"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Music, Play, Pause, SkipBack, SkipForward,
  Volume1, Volume2, VolumeX, Volume, Repeat
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { defaultMusic } from '@/config/templateConfig';
import { processMusicUrl, isValidYoutubeUrl, getYoutubeVideoId } from '@/lib/utils/youtubeToMp3';
import { getWeddingWebsite } from '@/lib/firebase/weddingService';

// Add YouTube API type definitions
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height: string | number;
          width: string | number;
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            disablekb?: number;
            enablejsapi?: number;
            fs?: number;
            modestbranding?: number;
            rel?: number;
            showinfo?: number;
            loop?: number;
            playlist?: string;
          };
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: YTPlayerState;
    };
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  getPlayerState: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  setLoop: (loopPlaylists: boolean) => void;
  cueVideoById: (videoId: string) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
}

type YTPlayerState = {
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
};

interface MusicFloatingButtonProps {
  weddingId?: string;
}

const MusicFloatingButton: React.FC<MusicFloatingButtonProps> = ({ weddingId }) => {
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storedMusic, setStoredMusic] = useState<Array<{ url: string; title: string }>>([]);
  const [musicPlayer, setMusicPlayer] = useState<HTMLAudioElement | null>(null);
  const [currentSongTitle, setCurrentSongTitle] = useState<string>('');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeatOne, setIsRepeatOne] = useState(false);

  // Initialize YouTube API
  const [youtubePlayer, setYoutubePlayer] = useState<YTPlayer | null>(null);
  const youtubePlayerRef = useRef<HTMLDivElement>(null);
  const currentVideoId = useRef<string>('');

  // Initialize YouTube API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (youtubePlayerRef.current) {
          const player = new window.YT.Player(youtubePlayerRef.current, {
            height: '0',
            width: '0',
            videoId: '',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0
            },
            events: {
              onReady: (event: { target: YTPlayer }) => {
                setYoutubePlayer(event.target);
              },
              onStateChange: (event: { data: number; target: YTPlayer }) => {
                // When a YouTube video ends
                if (event.data === window.YT.PlayerState.ENDED) {
                  if (isRepeatOne) {
                    // If repeat is on, restart the same video
                    if (currentVideoId.current) {
                      event.target.seekTo(0, true);
                      event.target.playVideo();
                    }
                  } else {
                    // Otherwise, move to next song automatically if there are multiple songs
                    if (storedMusic.length > 1) {
                      handleNext();
                    }
                  }
                }
              }
            }
          });
        }
      };
    }
  }, []);

  // Apply repeat mode changes to YouTube player
  useEffect(() => {
    if (youtubePlayer && isValidYoutubeUrl(storedMusic[currentMusicIndex]?.url)) {
      const videoId = getYoutubeVideoId(storedMusic[currentMusicIndex]?.url);
      if (videoId) {
        currentVideoId.current = videoId;
      }
    }
  }, [youtubePlayer, currentMusicIndex, storedMusic]);

  // Initialize music player with stored music or default music
  useEffect(() => {
    const initializeMusic = async () => {
      try {
        let musicList: Array<{ url: string; title: string }> = [];

        // Only try to get wedding music if weddingId is provided
        if (weddingId) {
          try {
            // Attempt to get wedding data from database
            const weddingData = await getWeddingWebsite(weddingId);
            
            // Check for new musics structure first
            if (weddingData?.musics && weddingData.musics.length > 0) {
              musicList = weddingData.musics.map((music) => ({
                url: music.url,
                title: music.name || 'Untitled Song'
              }));
            }
            // Fallback to old musicUrls structure  
            else if (weddingData?.musicUrls && weddingData.musicUrls.length > 0) {
              // Process all music URLs
              musicList = weddingData.musicUrls.map((url: string, index: number) => {
                const processedMusic = processMusicUrl(url);
                return {
                  url: processedMusic.url,
                  title: processedMusic.title || `Song ${index + 1}`
                };
              });
            }
          } catch (weddingError) {
            // Log the error but don't fail - will fall back to default music
            console.warn('Could not load wedding music, using default:', weddingError);
          }
        }

        // If no wedding music found or no weddingId, use default music
        if (musicList.length === 0) {
          musicList = [...defaultMusic];
        }

        // Set the music list
        setStoredMusic(musicList);

        // Initialize first song
        if (musicList.length > 0) {
          const firstSong = musicList[0];
          setCurrentSongTitle(firstSong.title);

          if (isValidYoutubeUrl(firstSong.url)) {
            // For YouTube URLs, use the YouTube player
            const videoId = getYoutubeVideoId(firstSong.url);
            if (videoId && youtubePlayer) {
              currentVideoId.current = videoId;
              youtubePlayer.loadVideoById(videoId);
              youtubePlayer.setVolume(volume * 100);
            }
          } else {
            // For direct audio files, use the Audio element
            const audio = new Audio(firstSong.url);
            audio.volume = volume;
            audio.loop = isRepeatOne;
            
            audio.addEventListener('ended', () => {
              if (isRepeatOne) {
                audio.currentTime = 0;
                audio.play().catch(console.error);
              } else {
                // Auto-advance to next song if there are multiple songs
                if (musicList.length > 1) {
                  handleNext();
                }
              }
            });
            
            setMusicPlayer(audio);
          }
        }
      } catch (error) {
        // If everything fails, ensure we at least have default music
        console.error('Error initializing music, falling back to default:', error);
        setStoredMusic(defaultMusic);
        
        // Initialize with first default song
        if (defaultMusic.length > 0) {
          const firstSong = defaultMusic[0];
          setCurrentSongTitle(firstSong.title);
          
          // Initialize audio player with first default song
          if (!isValidYoutubeUrl(firstSong.url)) {
            const audio = new Audio(firstSong.url);
            audio.volume = volume;
            audio.loop = isRepeatOne;
            
            audio.addEventListener('ended', () => {
              if (isRepeatOne) {
                audio.currentTime = 0;
                audio.play().catch(console.error);
              } else {
                // Auto-advance to next song if there are multiple songs
                if (defaultMusic.length > 1) {
                  handleNext();
                }
              }
            });
            
            setMusicPlayer(audio);
          }
        }
      }
    };

    initializeMusic();
  }, [weddingId, youtubePlayer]);

  // Handle volume control
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (musicPlayer) {
      musicPlayer.volume = newVolume;
    }
    if (youtubePlayer) {
      youtubePlayer.setVolume(newVolume * 100);
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (musicPlayer) {
      if (isMuted) {
        musicPlayer.volume = volume;
        setIsMuted(false);
      } else {
        musicPlayer.volume = 0;
        setIsMuted(true);
      }
    }
    if (youtubePlayer) {
      if (isMuted) {
        youtubePlayer.setVolume(volume * 100);
        setIsMuted(false);
      } else {
        youtubePlayer.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  // Handle music playback
  const handlePlayPause = () => {
    const currentSong = storedMusic[currentMusicIndex];
    
    if (isValidYoutubeUrl(currentSong.url)) {
      if (youtubePlayer) {
        if (isPlaying) {
          youtubePlayer.pauseVideo();
        } else {
          youtubePlayer.playVideo();
        }
      }
    } else if (musicPlayer) {
      if (isPlaying) {
        musicPlayer.pause();
      } else {
        musicPlayer.play().catch(error => {
          console.log('Play failed:', error);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Apply repeat mode to YouTube player when it changes
  useEffect(() => {
    if (musicPlayer) {
      musicPlayer.loop = isRepeatOne;
    }
  }, [isRepeatOne, musicPlayer]);

  // For YouTube, ensure we handle ended state properly for repeat mode
  useEffect(() => {
    if (youtubePlayer && isValidYoutubeUrl(storedMusic[currentMusicIndex]?.url)) {
      const checkPlayerState = setInterval(() => {
        if (youtubePlayer.getPlayerState) {
          const state = youtubePlayer.getPlayerState();
          // If video ended (state === 0) and repeat is enabled, restart the video
          if (state === 0 && isRepeatOne) {
            youtubePlayer.seekTo(0);
            youtubePlayer.playVideo();
          }
        }
      }, 1000); // Check every second

      return () => clearInterval(checkPlayerState);
    }
  }, [youtubePlayer, isRepeatOne, currentMusicIndex, storedMusic]);

  const handleNext = async () => {
    if (storedMusic.length === 0) return;
    
    const nextIndex = (currentMusicIndex + 1) % storedMusic.length;
    setCurrentMusicIndex(nextIndex);
    const nextSong = storedMusic[nextIndex];
    
    if (!nextSong) return;
    
    // Update song title immediately
    setCurrentSongTitle(nextSong.title);
    
    if (isValidYoutubeUrl(nextSong.url)) {
      const videoId = getYoutubeVideoId(nextSong.url);
      if (videoId && youtubePlayer) {
        currentVideoId.current = videoId;
        youtubePlayer.loadVideoById(videoId);
        if (isPlaying) {
          youtubePlayer.playVideo();
        }
      }
    } else if (musicPlayer) {
      try {
        await musicPlayer.pause();
        const newAudio = new Audio(nextSong.url);
        newAudio.volume = volume;
        newAudio.loop = isRepeatOne;
        
        newAudio.addEventListener('ended', () => {
          if (isRepeatOne) {
            newAudio.currentTime = 0;
            newAudio.play().catch(console.error);
          } else {
            // Auto-advance to next song if there are multiple songs
            if (storedMusic.length > 1) {
              handleNext();
            }
          }
        });
        
        setMusicPlayer(newAudio);
        if (isPlaying) {
          await newAudio.play();
        }
      } catch (error) {
        console.error('Error transitioning to next song:', error);
      }
    }
  };

  const handlePrevious = async () => {
    if (storedMusic.length === 0) return;
    
    const prevIndex = (currentMusicIndex - 1 + storedMusic.length) % storedMusic.length;
    setCurrentMusicIndex(prevIndex);
    const prevSong = storedMusic[prevIndex];
    
    if (!prevSong) return;
    
    // Update song title immediately
    setCurrentSongTitle(prevSong.title);
    
    if (isValidYoutubeUrl(prevSong.url)) {
      const videoId = getYoutubeVideoId(prevSong.url);
      if (videoId && youtubePlayer) {
        currentVideoId.current = videoId;
        youtubePlayer.loadVideoById(videoId);
        if (isPlaying) {
          youtubePlayer.playVideo();
        }
      }
    } else if (musicPlayer) {
      try {
        await musicPlayer.pause();
        const newAudio = new Audio(prevSong.url);
        newAudio.volume = volume;
        newAudio.loop = isRepeatOne;
        
        newAudio.addEventListener('ended', () => {
          if (isRepeatOne) {
            newAudio.currentTime = 0;
            newAudio.play().catch(console.error);
          } else {
            // Auto-advance to next song if there are multiple songs
            if (storedMusic.length > 1) {
              handleNext();
            }
          }
        });
        
        setMusicPlayer(newAudio);
        if (isPlaying) {
          await newAudio.play();
        }
      } catch (error) {
        console.error('Error transitioning to previous song:', error);
      }
    }
  };

  const toggleRepeatOne = () => {
    const newRepeatState = !isRepeatOne;
    setIsRepeatOne(newRepeatState);
    
    // Handle regular audio player
    if (musicPlayer) {
      musicPlayer.loop = newRepeatState;
    }

    // For YouTube videos
    if (youtubePlayer && isValidYoutubeUrl(storedMusic[currentMusicIndex]?.url)) {
      // YouTube has no direct loop API for single videos
      // The event handler will take care of repeating the video when it ends
      if (youtubePlayer.getPlayerState() === window.YT.PlayerState.ENDED && newRepeatState) {
        // If video already ended and we're turning on repeat, restart it
        const videoId = getYoutubeVideoId(storedMusic[currentMusicIndex]?.url);
        if (videoId) {
          currentVideoId.current = videoId;
          youtubePlayer.loadVideoById(videoId);
          youtubePlayer.playVideo();
        }
      }
    }
  };

  return (
    <div className="fixed top-14 left-2 z-50">
      <div className="relative group">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full w-12 h-12 bg-white/70 backdrop-blur-lg text-gray-700 shadow-md transition-all duration-300 border-white/20 hover:bg-pink-100 hover:scale-110 hover:shadow-pink-200"
          onClick={() => isMusicMenuOpen ? setIsMusicMenuOpen(false) : setIsMusicMenuOpen(true)}
        >
          <Music className="h-6 w-6 text-pink-500" />
        </Button>
        
        {/* Music Controls Menu */}
        <div className={cn(
          "absolute left-0 top-14 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-3 flex flex-col gap-3 transition-all duration-300 min-w-[200px]",
          isMusicMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}>
          {/* Current Song Title */}
          <div className="text-center text-sm font-medium text-gray-700 truncate" title={currentSongTitle}>
            {currentSongTitle || 'No Song'}
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 hover:bg-pink-100"
              onClick={handlePrevious}
              disabled={storedMusic.length <= 1}
            >
              <SkipBack className="h-4 w-4 text-pink-500" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="w-10 h-10 hover:bg-pink-100"
              onClick={handlePlayPause}
              disabled={storedMusic.length === 0}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-pink-500" />
              ) : (
                <Play className="h-5 w-5 text-pink-500" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 hover:bg-pink-100"
              onClick={handleNext}
              disabled={storedMusic.length <= 1}
            >
              <SkipForward className="h-4 w-4 text-pink-500" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 hover:bg-pink-100"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-pink-500" />
              ) : volume > 0.5 ? (
                <Volume2 className="h-4 w-4 text-pink-500" />
              ) : volume > 0 ? (
                <Volume1 className="h-4 w-4 text-pink-500" />
              ) : (
                <Volume className="h-4 w-4 text-pink-500" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-8 h-8 hover:bg-pink-100",
                isRepeatOne && "bg-pink-100"
              )}
              onClick={toggleRepeatOne}
            >
              <Repeat className={cn(
                "h-4 w-4",
                isRepeatOne ? "text-rose-600 font-bold" : "text-pink-500"
              )} />
            </Button>
          </div>
          
          {/* Song Counter */}
          <div className="text-center text-xs text-gray-500">
            {currentMusicIndex + 1} / {storedMusic.length}
          </div>
        </div>
      </div>

      {/* Hidden YouTube player */}
      <div ref={youtubePlayerRef} style={{ display: 'none' }}></div>
    </div>
  );
};

export default MusicFloatingButton; 