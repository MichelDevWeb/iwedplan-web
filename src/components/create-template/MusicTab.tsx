"use client";

import { useRef, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Music, Link as LinkIcon, Crown, Upload, 
  Play, Pause, Plus, Minus, Info, Youtube, Trash2, X
} from "lucide-react";
import { isValidYoutubeUrl, getYoutubeThumbnail, getYoutubeVideoId } from "@/lib/utils/youtubeToMp3";
import { deleteImage } from "@/lib/firebase/weddingService";
import { toast } from "sonner";

interface MusicItem {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'youtube';
}

interface MusicTabProps {
  musics: MusicItem[];
  setMusics: (musics: MusicItem[]) => void;
  musicSource: "file" | "link";
  isPlaying: boolean;
  musicCount: number;
  setMusicSource: (source: "file" | "link") => void;
  increaseMusicCount: () => void;
  decreaseMusicCount: () => void;
  VIP_PRICES: Record<string, number>;
}

export default function MusicTab({
  musics,
  setMusics,
  musicSource,
  isPlaying,
  musicCount,
  setMusicSource,
  increaseMusicCount,
  decreaseMusicCount,
  VIP_PRICES
}: MusicTabProps) {
  const [youtubeThumbnails, setYoutubeThumbnails] = useState<(string | null)[]>([]);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState<(string | null)[]>([]);
  const [isYoutubePlayerReady, setIsYoutubePlayerReady] = useState(false);
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playingType, setPlayingType] = useState<'file' | 'youtube' | null>(null);
  const [musicLinks, setMusicLinks] = useState<string[]>([]);
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Generate unique ID
  const generateId = () => `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle music file upload
  const handleMusicFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error("File nhạc không được vượt quá 10MB");
          return false;
        }
        return true;
      });
      
      const newMusics = validFiles.map(file => ({
        id: generateId(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: 'file' as const
      }));
      
      setMusics([...musics, ...newMusics]);
      setMusicSource("file");
    }
  };

  // Handle YouTube link changes
  const handleMusicLinkChange = async (index: number, value: string) => {
    const newLinks = [...musicLinks];
    while (newLinks.length <= index) {
      newLinks.push("");
    }
    newLinks[index] = value;
    setMusicLinks(newLinks);

    // If it's a valid YouTube URL, create music item
    if (isValidYoutubeUrl(value)) {
      try {
        const title = `YouTube Video ${index + 1}`;
        const newMusic: MusicItem = {
          id: generateId(),
          name: title,
          url: value,
          type: 'youtube'
        };
        
        // Replace or add the YouTube music at the current index
        const youtubeMusics = musics.filter(m => m.type === 'youtube');
        const updatedYoutubeMusics = [...youtubeMusics];
        updatedYoutubeMusics[index] = newMusic;
        
        // Combine with file musics
        const fileMusics = musics.filter(m => m.type === 'file');
        setMusics([...fileMusics, ...updatedYoutubeMusics.filter(Boolean)]);
      } catch (error) {
        console.error('Error getting YouTube title:', error);
      }
    }
  };

  // Toggle YouTube player audio
  const toggleYoutubeAudio = (index: number) => {
    const music = getYoutubeMusics()[index];
    if (!music) return;
    
    const videoId = getYoutubeVideoId(music.url);
    const iframe = iframeRefs.current[index];
    
    if (!iframe || !videoId) return;
    
    try {
      if (isYoutubePlaying && playingIndex === index && playingType === 'youtube') {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsYoutubePlaying(false);
        setPlayingIndex(null);
        setPlayingType(null);
      } else {
        // Pause all other players
        iframeRefs.current.forEach((otherIframe, otherIndex) => {
          if (otherIframe && otherIndex !== index) {
            otherIframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        });
        
        audioRefs.current.forEach(audio => {
          if (audio) {
            audio.pause();
          }
        });
        
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsYoutubePlaying(true);
        setPlayingIndex(index);
        setPlayingType('youtube');
      }
    } catch (err) {
      console.error("Failed to control YouTube player:", err);
      toast.error("Không thể điều khiển trình chơi YouTube");
    }
  };

  // Toggle audio file playback
  const toggleAudioFile = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    try {
      if (playingIndex === index && playingType === 'file') {
        audio.pause();
        setPlayingIndex(null);
        setPlayingType(null);
      } else {
        // Pause all other players
        audioRefs.current.forEach((otherAudio, otherIndex) => {
          if (otherAudio && otherIndex !== index) {
            otherAudio.pause();
          }
        });
        
        iframeRefs.current.forEach(iframe => {
          if (iframe) {
            iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        });
        setIsYoutubePlaying(false);
        
        audio.play();
        setPlayingIndex(index);
        setPlayingType('file');
      }
    } catch (err) {
      console.error("Failed to control audio player:", err);
      toast.error("Không thể phát nhạc");
    }
  };

  // Delete music item
  const handleDeleteMusic = async (musicId: string) => {
    try {
      const music = musics.find(m => m.id === musicId);
      if (music && music.type === 'file' && music.url.startsWith('http')) {
        // Delete from Firebase storage if it's a stored file
        await deleteImage(music.url);
      }
      
      setMusics(musics.filter(m => m.id !== musicId));
      toast.success("Đã xoá nhạc thành công");
    } catch (error) {
      console.error("Error deleting music:", error);
      toast.error("Không thể xoá nhạc từ storage");
    }
  };

  // Get musics by type
  const getFileMusics = () => musics.filter(m => m.type === 'file');
  const getYoutubeMusics = () => musics.filter(m => m.type === 'youtube');

  // Effect to handle YouTube link changes
  useEffect(() => {
    const youtubeMusics = getYoutubeMusics();
    if (musicSource === "link" && youtubeMusics.length > 0) {
      const thumbnails: (string | null)[] = [];
      const videoIds: (string | null)[] = [];
      
      youtubeMusics.forEach(music => {
        if (isValidYoutubeUrl(music.url)) {
          thumbnails.push(getYoutubeThumbnail(music.url));
          videoIds.push(getYoutubeVideoId(music.url));
        } else {
          thumbnails.push(null);
          videoIds.push(null);
        }
      });
      
      setYoutubeThumbnails(thumbnails);
      setYoutubeVideoIds(videoIds);
    } else {
      setYoutubeThumbnails([]);
      setYoutubeVideoIds([]);
    }
  }, [musics, musicSource]);

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
        Nhạc nền 
        <span className="inline-flex items-center bg-yellow-500 text-white text-xs rounded-lg px-2 py-1">
          <Crown className="w-3 h-3 mr-1" /> VIP
        </span>
      </h2>
      
      <div className="space-y-6">
        <div className="bg-pink-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Số lượng nhạc</h3>
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={decreaseMusicCount}
                disabled={musicCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold">{musicCount}</span>
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={increaseMusicCount}
                disabled={musicCount >= 3}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500 ml-2">
                (tối đa 3 bài)
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            Thêm tối đa 3 bài nhạc nền cho website cưới của bạn. Nhạc sẽ được phát luân phiên.
          </div>
          
          <div className="mt-4 grid gap-2">
            {[...Array(musicCount)].map((_, index) => (
              <div key={index} className="bg-white rounded p-2 border border-pink-200 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Nhạc #{index + 1}</span>
                  {index === 0 ? (
                    <span className="text-xs text-green-600 ml-2">(Đang thiết lập)</span>
                  ) : (
                    <span className="text-xs text-gray-500 ml-2">(Bổ sung sau)</span>
                  )}
                </div>
                {index > 0 && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center bg-yellow-500 text-white text-xs rounded-lg px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" /> VIP
                    </span>
                    <span className="ml-2 text-sm font-bold text-rose-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        maximumFractionDigits: 0 
                      }).format(VIP_PRICES.MUSIC)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant={musicSource === "file" ? "default" : "outline"}
            onClick={() => setMusicSource("file")}
            className="flex-1"
          >
            <Music className="mr-2 h-4 w-4" /> Tải lên file nhạc
          </Button>
          <Button 
            variant={musicSource === "link" ? "default" : "outline"}
            onClick={() => setMusicSource("link")}
            className="flex-1"
          >
            <LinkIcon className="mr-2 h-4 w-4" /> Sử dụng link nhạc
          </Button>
        </div>
        
        {musicSource === "file" && (
          <div className="space-y-4">
            <Label htmlFor="musicFile" className="block">
              Tải lên file nhạc (MP3, tối đa 10MB)
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="musicFile"
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={handleMusicFileChange}
                className="w-full md:w-auto"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("musicFile")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Chọn file
              </Button>
            </div>
            
            {/* Display uploaded music files */}
            {getFileMusics().length > 0 && (
              <div className="p-4 bg-pink-50 rounded-lg space-y-4">
                <h4 className="text-sm font-medium text-gray-700">File nhạc đã tải lên</h4>
                {getFileMusics().map((music, index) => (
                  <div key={music.id} className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">{music.name}</p>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          File
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMusic(music.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            playingIndex === index && playingType === 'file' ? 'bg-pink-100 text-pink-500' : 'bg-gray-100'
                          }`}>
                            {playingIndex === index && playingType === 'file' ? 
                              <span className="animate-pulse">♪</span> : 
                              <Music className="h-4 w-4" />
                            }
                          </div>
                          <div className="ml-3 text-sm font-medium truncate max-w-[200px]">
                            {music.name}
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAudioFile(index)}
                          className={`flex items-center ${playingIndex === index && playingType === 'file' ? 'text-pink-500' : ''}`}
                        >
                          {playingIndex === index && playingType === 'file' ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Hidden audio element */}
                      <audio 
                        ref={(el) => {
                          audioRefs.current[index] = el;
                        }}
                        src={music.url}
                        onPlay={() => {
                          setPlayingIndex(index);
                          setPlayingType('file');
                        }}
                        onPause={() => {
                          setPlayingIndex(null);
                          setPlayingType(null);
                        }}
                        onEnded={() => {
                          setPlayingIndex(null);
                          setPlayingType(null);
                        }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {musicSource === "link" && (
          <div className="space-y-4">
            {[...Array(musicCount)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Label htmlFor={`musicLink${index}`} className="block">
                  Link nhạc YouTube #{index + 1}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`musicLink${index}`}
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={musicLinks[index] || ""}
                    onChange={(e) => handleMusicLinkChange(index, e.target.value)}
                    className="w-full"
                  />
                </div>
                
                {youtubeVideoIds[index] && getYoutubeMusics()[index] && (
                  <div className="bg-white border border-pink-200 rounded-lg p-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="w-16 h-12 bg-gray-100 rounded flex-shrink-0 relative overflow-hidden">
                          <img 
                            src={youtubeThumbnails[index] || ''}
                            alt="YouTube thumbnail" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium truncate">
                            {getYoutubeMusics()[index]?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            YouTube Video
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleYoutubeAudio(index)}
                          className={`flex items-center ${isYoutubePlaying && playingIndex === index && playingType === 'youtube' ? 'text-pink-500' : ''}`}
                        >
                          {isYoutubePlaying && playingIndex === index && playingType === 'youtube' ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMusic(getYoutubeMusics()[index]?.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hidden YouTube player */}
                    <div className="relative w-full h-16 bg-gray-50 rounded overflow-hidden">
                      <div className="text-xs text-gray-500 absolute top-1 left-2">Xem trước nhạc nền</div>
                      <iframe
                        ref={(el) => {
                          iframeRefs.current[index] = el;
                        }}
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeVideoIds[index]}?enablejsapi=1&controls=0&showinfo=0&rel=0&fs=0&modestbranding=1&disablekb=1&iv_load_policy=3&loop=1&playlist=${youtubeVideoIds[index]}`}
                        title="YouTube music player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onLoad={() => setIsYoutubePlayerReady(true)}
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="p-3 bg-pink-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-pink-700">
                <Info className="h-4 w-4" />
                <p>Nhập link YouTube để thêm làm nhạc nền cho website cưới của bạn.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 