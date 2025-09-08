"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, HelpCircle, X, Filter } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface CalendarSidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedCenter: string
  onCenterChange: (center: string) => void
  selectedTechnician: string
  onTechnicianChange: (technician: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  technicians: Array<{ id: string; name: string }>
  onClose?: () => void
}

export function CalendarSidebar({ 
  selectedDate, 
  onDateChange, 
  selectedCenter, 
  onCenterChange,
  selectedTechnician,
  onTechnicianChange,
  selectedStatus,
  onStatusChange,
  technicians,
  onClose 
}: CalendarSidebarProps) {
  // Debug: verificar fecha actual
  const today = new Date()
  console.log('📅 Fecha actual:', today.toDateString())
  console.log('🎯 isToday test:', isToday(today))
  
  // Función personalizada para detectar el día de hoy
  const isTodayCustom = (date: Date) => {
    const today = new Date()
    const result = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear()
    
    // Debug: mostrar comparación
    console.log(`🔍 Comparando fecha: ${date.toDateString()} con hoy: ${today.toDateString()} = ${result}`)
    
    if (result) {
      console.log('✅ DÍA DE HOY DETECTADO!', date.toDateString())
    }
    
    return result
  }
  
  // Estado separado para cada mes
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate))
  const [nextMonth, setNextMonth] = useState(() => {
    const next = new Date(selectedDate)
    next.setMonth(next.getMonth() + 1)
    return startOfMonth(next)
  })

  // Navegación independiente para el mes actual
  const goToPreviousMonth = () => {
    console.log('🔄 Navegando al mes anterior del primer calendario')
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    
    // Actualizar también el próximo mes para mantener la secuencia
    const newNextMonth = new Date(newMonth)
    newNextMonth.setMonth(newMonth.getMonth() + 1)
    setNextMonth(newNextMonth)
  }

  const goToNextMonth = () => {
    console.log('🔄 Navegando al mes siguiente del primer calendario')
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    
    // Actualizar también el próximo mes para mantener la secuencia
    const newNextMonth = new Date(newMonth)
    newNextMonth.setMonth(newMonth.getMonth() + 1)
    setNextMonth(newNextMonth)
  }

  // Navegación independiente para el próximo mes
  const goToPreviousNextMonth = () => {
    console.log('🔄 Navegando al mes anterior del segundo calendario')
    const newNextMonth = new Date(nextMonth)
    newNextMonth.setMonth(nextMonth.getMonth() - 1)
    setNextMonth(newNextMonth)
  }

  const goToNextNextMonth = () => {
    console.log('🔄 Navegando al mes siguiente del segundo calendario')
    const newNextMonth = new Date(nextMonth)
    newNextMonth.setMonth(nextMonth.getMonth() + 1)
    setNextMonth(newNextMonth)
  }

  const handleDateSelect = (date: Date) => {
    onDateChange(date)
  }

  // Actualizar los meses cuando cambie la fecha seleccionada
  useEffect(() => {
    const newCurrentMonth = startOfMonth(selectedDate)
    const newNextMonth = new Date(newCurrentMonth)
    newNextMonth.setMonth(newCurrentMonth.getMonth() + 1)
    
    setCurrentMonth(newCurrentMonth)
    setNextMonth(newNextMonth)
  }, [selectedDate])

  // Función para renderizar un mini calendario
  const renderMiniCalendar = (month: Date, title: string, onPrev: () => void, onNext: () => void) => {
    console.log(`📅 Renderizando calendario: ${title}`, month.toDateString())
    console.log(`🔍 Fecha actual del sistema: ${new Date().toDateString()}`)
    
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Verificar si el mes actual contiene el día de hoy
    const today = new Date()
    const hasToday = days.some(day => 
      day.getDate() === today.getDate() && 
      day.getMonth() === today.getMonth() && 
      day.getFullYear() === today.getFullYear()
    )
    console.log(`🎯 ¿Este mes contiene el día de hoy? ${hasToday}`)

    return (
      <div>
        <div className="calendar-mini-calendar-header">
          <h3 className="calendar-mini-calendar-title capitalize">
            {title}
          </h3>
          <div className="calendar-mini-calendar-nav">
            <Button variant="ghost" size="sm" onClick={onPrev} className="calendar-mini-calendar-nav-btn">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext} className="calendar-mini-calendar-nav-btn">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="calendar-mini-calendar-grid">
          {/* Días de la semana */}
          {["L", "M", "M", "J", "V", "S", "D"].map((day) => (
            <div key={day} className="calendar-mini-calendar-weekday">
              {day}
            </div>
          ))}

          {/* Celdas vacías para alineación */}
          {(() => {
            const firstDayOfMonth = monthStart.getDay()
            const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
            return Array.from({ length: startOffset }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-7" />
            ))
          })()}

          {/* Días del mes */}
          {days.map((day) => {
            const isTodayDate = isTodayCustom(day)
            const isSelectedDate = isSameDay(day, selectedDate)
            
            // Debug: mostrar información del día actual
            if (isTodayDate) {
              console.log('🎯 Día de hoy encontrado:', day.toDateString(), 'isToday:', isTodayDate)
            }
            
            return (
              <Button
                key={day.toISOString()}
                variant="ghost"
                size="sm"
                onClick={() => handleDateSelect(day)}
                className={cn(
                  "calendar-mini-calendar-day",
                  // Día seleccionado (prioridad más alta)
                  isSelectedDate && "selected",
                  // Día de hoy (prioridad alta, solo si no está seleccionado)
                  isTodayDate && !isSelectedDate && "today",
                  // Día normal
                  !isTodayDate && !isSelectedDate && ""
                )}
              >
                {format(day, "d")}
                {/* Círculo indicador para el día de hoy */}
                {isTodayDate && !isSelectedDate && (
                  <div className="absolute inset-0 border-2 border-blue-600 rounded-full animate-pulse"></div>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <aside className="calendar-sidebar">
      {/* Header mejorado */}
      <div className="calendar-sidebar-header">
        <div className="flex items-center justify-between">
          <div className="calendar-sidebar-title">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" className="lg:hidden hover:bg-blue-100" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="calendar-sidebar-content">
        <div className="calendar-filters-section">
          {/* Empresa */}
          <div className="calendar-filter-group">
            <Label className="calendar-filter-label">Empresa</Label>
            <Select value={selectedCenter} onValueChange={onCenterChange}>
              <SelectTrigger className="calendar-filter-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amestica">Amestica</SelectItem>
                <SelectItem value="Multifugas">Multifugas</SelectItem>
                <SelectItem value="Servifugas">Servifugas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Técnico */}
          <div className="calendar-filter-group">
            <Label className="calendar-filter-label">Técnico</Label>
            <Select value={selectedTechnician} onValueChange={onTechnicianChange}>
              <SelectTrigger className="calendar-filter-select">
                <SelectValue placeholder="Seleccionar técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los técnicos</SelectItem>
                {technicians.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id}>
                    {technician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="calendar-filter-group">
            <Label className="calendar-filter-label">Estado</Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="calendar-filter-select">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activas">Reservas activas</SelectItem>
                <SelectItem value="todas">Todas las reservas</SelectItem>
                <SelectItem value="canceladas">Reservas canceladas</SelectItem>
                <SelectItem value="completadas">Reservas completadas</SelectItem>
                <SelectItem value="pendientes">Reservas pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendario actual - con navegación independiente */}
        <div className="calendar-mini-calendars">
          <div className="calendar-mini-calendar">
            {renderMiniCalendar(
              currentMonth,
              format(currentMonth, "MMMM yyyy", { locale: es }),
              goToPreviousMonth,
              goToNextMonth
            )}
          </div>

          {/* Calendario del próximo mes - con navegación independiente */}
          <div className="calendar-mini-calendar">
            {renderMiniCalendar(
              nextMonth,
              format(nextMonth, "MMMM yyyy", { locale: es }),
              goToPreviousNextMonth,
              goToNextNextMonth
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
