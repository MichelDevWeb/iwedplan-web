"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  fromDate?: Date;
  toDate?: Date;
  showClearButton?: boolean;
  calendarClassName?: string;
  popoverContentClassName?: string;
}

export function DatePicker({ 
  date, 
  setDate, 
  className,
  placeholder = "Chọn ngày",
  format: dateFormat = "PPP",
  disabled = false,
  disabledDates,
  fromDate,
  toDate,
  showClearButton = true,
  calendarClassName,
  popoverContentClassName,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>("");

  // Update input value when date changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, dateFormat, { locale: vi }));
    } else {
      setInputValue("");
    }
  }, [date, dateFormat]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Try to parse the date from input
    try {
      const parsedDate = parse(value, dateFormat, new Date(), { locale: vi });
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    } catch (error) {
      // Invalid date format, don't update the date
    }
  };

  const handleClear = () => {
    setDate(null);
    setInputValue("");
  };

  return (
    <div className={cn("relative grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-rose-500" />
            {inputValue ? inputValue : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn("w-auto p-0 shadow-lg", popoverContentClassName)}
          align="start"
        >
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            disabled={disabledDates ? 
              (date) => disabledDates.some(
                (disabledDate) => 
                  disabledDate.getDate() === date.getDate() &&
                  disabledDate.getMonth() === date.getMonth() &&
                  disabledDate.getFullYear() === date.getFullYear()
              ) :
              fromDate || toDate ? 
                (date) => 
                  (fromDate ? date < fromDate : false) || 
                  (toDate ? date > toDate : false) :
                undefined
            }
            initialFocus
            locale={vi}
            className={calendarClassName}
          />
          {showClearButton && date && (
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-center text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={handleClear}
              >
                Xóa ngày đã chọn
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
} 