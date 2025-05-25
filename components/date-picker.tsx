"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function DatePicker({ selected, onSelect, disabled, className = "" }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => selected || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const isDisabled = (date: Date) => {
    if (disabled) {
      return disabled(date)
    }
    return false
  }

  return (
    <div className={`p-4 border rounded-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, i) => {
          const isSelectedDay = selected && isSameDay(day, selected)
          const isTodayDay = isToday(day)
          const isDisabledDay = isDisabled(day)

          return (
            <Button
              key={i}
              variant={isSelectedDay ? "default" : isTodayDay ? "outline" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${isDisabledDay ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isDisabledDay && onSelect(day)}
              disabled={isDisabledDay}
            >
              <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
