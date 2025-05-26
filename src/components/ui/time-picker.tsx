"use client";

import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, minutes] = value.split(':').map(Number);
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
    onChange(`${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
    onChange(`${hours.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
  };

  const incrementHour = () => {
    const newHour = (hours + 1) % 24;
    onChange(`${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  const decrementHour = () => {
    const newHour = (hours - 1 + 24) % 24;
    onChange(`${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  const incrementMinute = () => {
    const newMinute = (minutes + 1) % 60;
    onChange(`${hours.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
  };

  const decrementMinute = () => {
    const newMinute = (minutes - 1 + 60) % 60;
    onChange(`${hours.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-3.5 w-3.5 text-rose-500" />
          <span className="text-sm">
            {value ? (
              `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
            ) : (
              "Chọn giờ"
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center gap-3">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <Button 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-pink-50 hover:text-rose-600"
              onClick={incrementHour}
            >
              <ChevronUp size={16} />
            </Button>
            <Input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={handleHourChange}
              className="h-9 w-14 text-center text-lg font-medium"
              placeholder="00"
            />
            <Button 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-pink-50 hover:text-rose-600"
              onClick={decrementHour}
            >
              <ChevronDown size={16} />
            </Button>
            <span className="text-xs text-gray-500 mt-1">giờ</span>
          </div>
          
          <span className="text-xl font-medium text-gray-400">:</span>
          
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <Button 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-pink-50 hover:text-rose-600"
              onClick={incrementMinute}
            >
              <ChevronUp size={16} />
            </Button>
            <Input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={handleMinuteChange}
              className="h-9 w-14 text-center text-lg font-medium"
              placeholder="00"
            />
            <Button 
              variant="ghost" 
              className="h-6 w-6 p-0 hover:bg-pink-50 hover:text-rose-600"
              onClick={decrementMinute}
            >
              <ChevronDown size={16} />
            </Button>
            <span className="text-xs text-gray-500 mt-1">phút</span>
          </div>
        </div>
        
        {/* Common times */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="h-7 text-xs hover:bg-pink-50 hover:text-rose-600"
            onClick={() => onChange("08:00")}
          >
            08:00
          </Button>
          <Button 
            variant="outline" 
            className="h-7 text-xs hover:bg-pink-50 hover:text-rose-600"
            onClick={() => onChange("12:00")}
          >
            12:00
          </Button>
          <Button 
            variant="outline" 
            className="h-7 text-xs hover:bg-pink-50 hover:text-rose-600"
            onClick={() => onChange("16:00")}
          >
            16:00
          </Button>
          <Button 
            variant="outline" 
            className="h-7 text-xs hover:bg-pink-50 hover:text-rose-600"
            onClick={() => onChange("19:00")}
          >
            19:00
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 