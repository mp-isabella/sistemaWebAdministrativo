import { useState, useEffect, useCallback, useMemo } from 'react'
import { RESPONSIVE_CONFIG } from '@/lib/responsive-config'

interface UseCalendarOptimizationProps {
  professionalsCount: number
}

export function useCalendarOptimization({ professionalsCount }: UseCalendarOptimizationProps) {
  const [windowWidth, setWindowWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detectar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      setIsMobile(width <= RESPONSIVE_CONFIG.BREAKPOINTS.MOBILE)
      setIsTablet(width <= RESPONSIVE_CONFIG.BREAKPOINTS.TABLET && width > RESPONSIVE_CONFIG.BREAKPOINTS.MOBILE)
    }

    // Establecer valores iniciales
    if (typeof window !== 'undefined') {
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Calcular ancho dinámico de columnas de técnicos
  const getTechnicianColumnWidth = useCallback(() => {
    if (windowWidth === 0) return 180 // Valor por defecto

    const sidebarWidth = 320
    const timeColumnWidth = isMobile ? 56 : isTablet ? 64 : 64 // 3.5rem, 4rem, 4rem (reducido de 5.5rem)
    const scrollbarWidth = 16
    const margins = 24
    
    const availableWidth = windowWidth - sidebarWidth - timeColumnWidth - scrollbarWidth - margins
    
    if (professionalsCount === 0) return 180
    
    // Calcular ancho óptimo por técnico
    let columnWidth = availableWidth / professionalsCount
    
    // Aplicar límites según el dispositivo
    if (isMobile) {
      columnWidth = Math.max(120, Math.min(160, columnWidth))
    } else if (isTablet) {
      columnWidth = Math.max(140, Math.min(200, columnWidth))
    } else {
      columnWidth = Math.max(160, Math.min(280, columnWidth))
    }
    
    return Math.floor(columnWidth)
  }, [windowWidth, professionalsCount, isMobile, isTablet])

  // Configuración de horarios optimizada - 8:00 AM a 19:00 PM
  const timeConfig = useMemo(() => {
    const slots = Array.from({ length: 12 }, (_, i) => 
      `${(i + 8).toString().padStart(2, '0')}:00`
    )
    
    console.log('🕐 Horarios configurados:', slots)
    console.log('🕐 Total de slots:', slots.length)
    console.log('🕐 Rango: 8:00 AM - 19:00 PM')
    
    return {
      startHour: 8, // 8:00 AM
      endHour: 19,  // 7:00 PM
      totalHours: 12, // 12 horas totales (8:00 a 19:00)
      slotHeight: 80, // Altura de 80px (5rem) para celdas más espaciosas
      timeSlots: slots
    }
  }, [])

  // Función para calcular posición de citas
  const calculateAppointmentPosition = useCallback((startTime: string, endTime: string) => {
    if (!startTime || !endTime) return null

    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    // Validar horas
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      return null
    }

    // Asegurar rango correcto (8:00-19:00)
    if (startHour < timeConfig.startHour || endHour > timeConfig.endHour) {
      return null
    }

    // Calcular posición
    const startSlotIndex = (startHour - timeConfig.startHour) + (startMinute / 60)
    const endSlotIndex = (endHour - timeConfig.startHour) + (endMinute / 60)
    
    const top = startSlotIndex * timeConfig.slotHeight
    const height = Math.max((endSlotIndex - startSlotIndex) * timeConfig.slotHeight, 28)

    return { top, height }
  }, [timeConfig])

  // Función para calcular posición de tiempo actual
  const getCurrentTimePosition = useCallback(() => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    // Verificar rango de horas
    if (hours < timeConfig.startHour || hours > timeConfig.endHour) {
      return null
    }

    const totalMinutes = (hours - timeConfig.startHour) * 60 + minutes
    return (totalMinutes / 60) * timeConfig.slotHeight
  }, [timeConfig])

  // Configuración de estilos responsivos
  const responsiveStyles = useMemo(() => ({
    timeColumn: {
      width: isMobile ? '3.5rem' : isTablet ? '4rem' : '5.5rem',
      fontSize: isMobile ? '0.75rem' : '0.875rem'
    },
    technicianColumn: {
      width: getTechnicianColumnWidth(),
      headerHeight: isMobile ? '60px' : '80px',
      avatarSize: isMobile ? '1.75rem' : isTablet ? '2rem' : '2.5rem'
    },
    appointment: {
      minHeight: isMobile ? '24px' : '28px',
      fontSize: isMobile ? '0.625rem' : '0.75rem',
      padding: isMobile ? '0.25rem' : '0.5rem'
    }
  }), [isMobile, isTablet, getTechnicianColumnWidth])

  return {
    windowWidth,
    isMobile,
    isTablet,
    timeConfig,
    responsiveStyles,
    getTechnicianColumnWidth,
    calculateAppointmentPosition,
    getCurrentTimePosition
  }
}
