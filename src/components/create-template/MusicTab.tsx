"use client";

import { useRef, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Music, Link as LinkIcon, Crown, Upload, 
  Play, Pause, Plus, Minus, Info, Youtube
} from "lucide-react";
import { isValidYoutubeUrl, getYoutubeThumbnail, getYoutubeVideoId } from "@/lib/utils/youtubeToMp3";
import { toast } from "sonner";

interface MusicTabProps {
  musicFiles: File[];
  musicFileNames: string[];
  musicPreviewUrls: string[];
  musicLinks: string[];
  musicSource: "file" | "link";
  isPlaying: boolean;
  musicCount: number;
  setMusicSource: (source: "file" | "link") => void;
  handleMusicFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setMusicLinks: (links: string[]) => void;
  toggleAudio: () => void;
  increaseMusicCount: () => void;
  decreaseMusicCount: () => void;
  validateMusicLink: (link: string) => boolean;
  VIP_PRICES: Record<string, number>;
}

export default function MusicTab({
  musicFiles,
  musicFileNames,
  musicPreviewUrls,
  musicLinks,
  musicSource,
  isPlaying,
  musicCount,
  setMusicSource,
  handleMusicFileChange,
  setMusicLinks,
  toggleAudio,
  increaseMusicCount,
  decreaseMusicCount,
  validateMusicLink,
  VIP_PRICES
}: MusicTabProps) {
  const [youtubeThumbnails, setYoutubeThumbnails] = useState<(string | null)[]>([]);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState<(string | null)[]>([]);
  const [isYoutubePlayerReady, setIsYoutubePlayerReady] = useState(false);
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(false);
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Effect to handle YouTube link changes
  useEffect(() => {
    if (musicSource === "link" && musicLinks.length > 0) {
      const thumbnails: (string | null)[] = [];
      const videoIds: (string | null)[] = [];
      
      musicLinks.forEach(link => {
        if (isValidYoutubeUrl(link)) {
          thumbnails.push(getYoutubeThumbnail(link));
          videoIds.push(getYoutubeVideoId(link));
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
  }, [musicLinks, musicSource]);

  // Toggle YouTube player audio
  const toggleYoutubeAudio = (index: number) => {
    const iframe = iframeRefs.current[index];
    const videoId = youtubeVideoIds[index];
    
    if (!iframe || !videoId) return;
    
    try {
      if (isYoutubePlaying) {
        // Use postMessage to pause
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsYoutubePlaying(false);
      } else {
        // Use postMessage to play
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsYoutubePlaying(true);
      }
    } catch (err) {
      console.error("Failed to control YouTube player:", err);
      toast.error("Không thể điều khiển trình chơi YouTube");
    }
  };

  // Handle music link changes
  const handleMusicLinkChange = (index: number, value: string) => {
    const newLinks = [...musicLinks];
    newLinks[index] = value;
    setMusicLinks(newLinks);
  };

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
            
            {musicFileNames.length > 0 && (
              <div className="p-4 bg-pink-50 rounded-lg space-y-4">
                {musicFileNames.map((fileName, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium">Đã chọn: {fileName}</p>
                    </div>
                    
                    {musicPreviewUrls[index] && (
                      <div className="flex flex-col space-y-3">
                        <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'bg-pink-100 text-pink-500' : 'bg-gray-100'}`}>
                              {isPlaying ? <span className="animate-pulse">♪</span> : <Music className="h-4 w-4" />}
                            </div>
                            <div className="ml-3 text-sm font-medium truncate max-w-[200px]">
                              {fileName}
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={toggleAudio}
                            className={`flex items-center ${isPlaying ? 'text-pink-500' : ''}`}
                          >
                            {isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="text-xs text-gray-500 text-center">
                  Nhấn nút để nghe thử nhạc nền
                </div>
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
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isValidYoutubeUrl(musicLinks[index] || "")}
                    className="whitespace-nowrap opacity-0"
                  >
                    <Youtube className="mr-2 h-4 w-4" /> Xem trước
                  </Button>
                </div>
                
                {youtubeVideoIds[index] && (
                  <div className="bg-white border border-pink-200 rounded-lg p-3 space-y-3">
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
                          {musicLinks[index]}
                        </div>
                        <div className="text-xs text-gray-500">
                          YouTube Video
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleYoutubeAudio(index)}
                        className={`flex items-center ${isYoutubePlaying ? 'text-pink-500' : ''}`}
                      >
                        {isYoutubePlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Hidden YouTube player with audio-only */}
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
                    
                    <div className="text-xs text-gray-500 pt-1">
                      Chú ý: Âm thanh sẽ phát khi khách ghé thăm website cưới của bạn, không hiển thị video.
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