"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, SelectSingleEventHandler, DayClickEventHandler } from "react-day-picker"
import { vi } from "date-fns/locale"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onDayClick?: DayClickEventHandler;
  showWeekNumber?: boolean;
  showOutsideDays?: boolean;
  className?: string;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showWeekNumber = false,
  locale = vi,
  onDayClick,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      showWeekNumber={showWeekNumber}
      className={cn("p-3 select-none transition-all duration-200", className)}
      locale={locale}
      onDayClick={onDayClick}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-rose-700",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] capitalize",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 hover:bg-accent/50 transition-colors duration-200",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 transition-transform duration-200 hover:scale-110"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-rose-500 text-primary-foreground hover:bg-rose-500 hover:text-primary-foreground focus:bg-rose-500 focus:text-primary-foreground shadow-sm",
        day_today: "bg-accent text-accent-foreground ring-1 ring-rose-300",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatCaption: (date, options) => {
          return format(date, 'MMMM yyyy', { locale: options?.locale });
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 