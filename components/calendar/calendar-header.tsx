"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CalendarHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedCenter: string
  userRole?: string
  onRefresh?: () => void
}

export function CalendarHeader({ 
  selectedDate, 
  onDateChange, 
  selectedCenter, 
  userRole,
  onRefresh 
}: CalendarHeaderProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + 1)
    onDateChange(newDate)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-5">
      <div className="flex items-center justify-between">
        {/* Sección izquierda - Navegación y fecha */}
        <div className="flex items-center gap-10">
          {/* Navegación de días */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPreviousDay} 
              aria-label="Día anterior"
              className="h-10 w-10 p-0 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextDay} 
              aria-label="Día siguiente"
              className="h-10 w-10 p-0 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Información de fecha */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </h1>
          </div>
        </div>

        {/* Sección derecha - Acciones */}
        <div className="flex items-center gap-3">
          {/* Botón de refresco */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              aria-label="Refrescar calendario"
              className="h-10 w-10 p-0 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
