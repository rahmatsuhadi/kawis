"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "Pilih waktu",
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(value ? Number.parseInt(value.split(":")[0]) : 9)
  const [minutes, setMinutes] = useState(value ? Number.parseInt(value.split(":")[1]) : 0)

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const timeString = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
    onChange(timeString)
    setHours(newHours)
    setMinutes(newMinutes)
  }

  const formatTime = (time: string) => {
    if (!time) return placeholder
    return `${time} WIB`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={disabled}>
          <Clock className="mr-2 h-4 w-4" />
          {formatTime(value || "")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Pilih Waktu</div>

          <div className="flex items-center gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <Label className="text-xs text-gray-600 mb-1">Jam</Label>
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(Math.min(23, hours + 1), minutes)}
                  className="h-6 w-12 p-0"
                >
                  +
                </Button>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => {
                    const newHours = Math.max(0, Math.min(23, Number.parseInt(e.target.value) || 0))
                    handleTimeChange(newHours, minutes)
                  }}
                  className="h-8 w-12 text-center p-0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(Math.max(0, hours - 1), minutes)}
                  className="h-6 w-12 p-0"
                >
                  -
                </Button>
              </div>
            </div>

            <div className="text-lg font-bold">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <Label className="text-xs text-gray-600 mb-1">Menit</Label>
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(hours, Math.min(59, minutes + 15))}
                  className="h-6 w-12 p-0"
                >
                  +
                </Button>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  step="15"
                  value={minutes}
                  onChange={(e) => {
                    const newMinutes = Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0))
                    handleTimeChange(hours, newMinutes)
                  }}
                  className="h-8 w-12 text-center p-0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(hours, Math.max(0, minutes - 15))}
                  className="h-6 w-12 p-0"
                >
                  -
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Time Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {["09:00", "12:00", "14:00", "16:00", "18:00", "20:00"].map((time) => (
              <Button
                key={time}
                variant="outline"
                size="sm"
                onClick={() => {
                  const [h, m] = time.split(":").map(Number)
                  handleTimeChange(h, m)
                  setIsOpen(false)
                }}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)} className="flex-1">
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
