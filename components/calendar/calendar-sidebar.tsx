"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Search, HelpCircle } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface CalendarSidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedCenter: string
  onCenterChange: (center: string) => void
}

export function CalendarSidebar({ selectedDate, onDateChange, selectedCenter, onCenterChange }: CalendarSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const [searchQuery, setSearchQuery] = useState("")

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const handleDateSelect = (date: Date) => {
    onDateChange(date)
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Branch Selection */}
      <div className="p-4 border-b border-gray-200">
        <Label htmlFor="branch-select" className="text-sm font-medium text-gray-700 mb-2 block">
          Sucursal
        </Label>
        <Select value={selectedCenter} onValueChange={onCenterChange}>
          <SelectTrigger id="branch-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CENTRO MÉDICO COIHUECO">CENTRO MÉDICO COIHUECO</SelectItem>
            <SelectItem value="CENTRO MÉDICO SANTIAGO">CENTRO MÉDICO SANTIAGO</SelectItem>
            <SelectItem value="CENTRO MÉDICO VALPARAÍSO">CENTRO MÉDICO VALPARAÍSO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Professional Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-sm font-medium text-gray-700">Profesional</Label>
          <HelpCircle className="h-4 w-4 text-gray-400" />
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">+12</span>
        </div>
        <Select defaultValue="todos">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="andrea">Andrea Cid Venegas</SelectItem>
            <SelectItem value="cristopher">Cristopher Hernández</SelectItem>
            <SelectItem value="diego">Diego Cabezas Cádiz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservation Status */}
      <div className="p-4 border-b border-gray-200">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Estado de la reserva</Label>
        <Select defaultValue="activas">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activas">Reservas activas</SelectItem>
            <SelectItem value="todas">Todas las reservas</SelectItem>
            <SelectItem value="canceladas">Reservas canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Búsqueda rápida de hora"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="p-4 flex-1">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth} aria-label="Mes anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-gray-900">{format(currentMonth, "MMMM yyyy", { locale: es })}</h3>
            <Button variant="ghost" size="sm" onClick={goToNextMonth} aria-label="Mes siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="p-2 text-gray-500 font-medium">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month start */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}

            {/* Calendar days */}
            {days.map((day) => (
              <Button
                key={day.toISOString()}
                variant="ghost"
                size="sm"
                onClick={() => handleDateSelect(day)}
                className={cn(
                  "h-8 w-8 p-0 text-xs font-normal",
                  isSameDay(day, selectedDate) && "bg-primary text-primary-foreground",
                  isToday(day) && !isSameDay(day, selectedDate) && "bg-accent text-accent-foreground font-medium",
                  !isSameMonth(day, currentMonth) && "text-gray-300",
                )}
                aria-label={format(day, "d de MMMM", { locale: es })}
              >
                {format(day, "d")}
              </Button>
            ))}
          </div>
        </div>

        {/* Next Month Preview */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">
            {format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1), "MMMM yyyy", { locale: es })}
          </h4>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="p-1 text-gray-400 text-xs">
                {day.charAt(0)}
              </div>
            ))}
            {/* Simplified next month preview */}
            {Array.from({ length: 35 }).map((_, index) => {
              const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
              const nextMonthStart = startOfMonth(nextMonth)
              const dayOffset = (nextMonthStart.getDay() + 6) % 7
              const dayNumber = index - dayOffset + 1

              if (dayNumber > 0 && dayNumber <= 31) {
                return (
                  <div key={index} className="p-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
                    {dayNumber}
                  </div>
                )
              }
              return <div key={index} className="p-1" />
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
