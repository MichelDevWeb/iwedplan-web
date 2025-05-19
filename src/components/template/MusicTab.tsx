"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Music, Link as LinkIcon, Crown, Upload, 
  Play, Pause, Plus, Minus 
} from "lucide-react";

interface MusicTabProps {
  musicFile: File | null;
  musicFileName: string;
  musicPreviewUrl: string;
  musicLink: string;
  musicSource: "file" | "link";
  isPlaying: boolean;
  musicCount: number;
  setMusicSource: (source: "file" | "link") => void;
  handleMusicFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setMusicLink: (link: string) => void;
  toggleAudio: () => void;
  increaseMusicCount: () => void;
  decreaseMusicCount: () => void;
  validateMusicLink: (link: string) => boolean;
  VIP_PRICES: Record<string, number>;
}

export default function MusicTab({
  musicFile,
  musicFileName,
  musicPreviewUrl,
  musicLink,
  musicSource,
  isPlaying,
  musicCount,
  setMusicSource,
  handleMusicFileChange,
  setMusicLink,
  toggleAudio,
  increaseMusicCount,
  decreaseMusicCount,
  validateMusicLink,
  VIP_PRICES
}: MusicTabProps) {
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
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("musicFile")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Chọn file
              </Button>
            </div>
            
            {musicFileName && (
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">Đã chọn: {musicFileName}</p>
                </div>
                
                {musicPreviewUrl && (
                  <div className="flex flex-col space-y-3">
                    <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'bg-pink-100 text-pink-500' : 'bg-gray-100'}`}>
                          {isPlaying ? <span className="animate-pulse">♪</span> : <Music className="h-4 w-4" />}
                        </div>
                        <div className="ml-3 text-sm font-medium truncate max-w-[200px]">
                          {musicFileName}
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
                    
                    <div className="text-xs text-gray-500 text-center">
                      Nhấn nút để nghe thử nhạc nền
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {musicSource === "link" && (
          <div className="space-y-4">
            <Label htmlFor="musicLink" className="block">
              Link nhạc (YouTube, SoundCloud, Spotify)
            </Label>
            <Input
              id="musicLink"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={musicLink}
              onChange={(e) => setMusicLink(e.target.value)}
              className="w-full"
            />
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Chỉ hỗ trợ link từ YouTube, SoundCloud hoặc Spotify.
              </p>
            </div>
            
            {musicLink && validateMusicLink(musicLink) && (
              <div className="bg-white border border-pink-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div className="ml-3 text-sm font-medium truncate max-w-[240px]">
                    {musicLink}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(musicLink, "_blank")}
                >
                  <Play className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 