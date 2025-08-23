"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Maximize2, ExternalLink, Printer, Plus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CalendarHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedCenter: string
}

export function CalendarHeader({ selectedDate, onDateChange, selectedCenter }: CalendarHeaderProps) {
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

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="text-sm bg-transparent">
              Hoy
            </Button>
            <Button variant="ghost" size="sm" onClick={goToPreviousDay} aria-label="Día anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextDay} aria-label="Día siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Date */}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </h1>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {selectedCenter}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Actualizado hace 0 min</span>
          <Button variant="ghost" size="sm" aria-label="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Pantalla completa">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Abrir en nueva ventana">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Imprimir">
            <Printer className="h-4 w-4" />
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>
    </header>
  )
}
