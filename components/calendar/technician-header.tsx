"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Professional } from "@/types/calendar"

interface TechnicianHeaderProps {
  professional: Professional
  width: number
}

export function TechnicianHeader({ professional, width }: TechnicianHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'disponible':
        return 'bg-green-500'
      case 'busy':
      case 'ocupado':
        return 'bg-yellow-500'
      case 'unavailable':
      case 'no disponible':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'disponible'
      case 'unavailable':
        return 'no disponible'
      case 'busy':
        return 'ocupado'
      default:
        return status
    }
  }

  return (
    <div 
      className="technician-header bg-white p-3 text-center border-r border-gray-200 flex flex-col items-center justify-center"
      style={{ 
        width: `${width}px`,
        minWidth: `${width}px`,
        maxHeight: '80px'
      }}
    >
      <Avatar className="technician-avatar mx-auto mb-2 h-10 w-10 ring-2 ring-blue-100">
        <AvatarImage 
          src={professional.avatar || "/placeholder.svg"} 
          alt={professional.name}
          className="object-cover"
        />
        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
          {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <h3 
        className="technician-name font-semibold text-sm text-gray-900 mb-1 truncate w-full" 
        title={professional.name}
      >
        {professional.name}
      </h3>
      
      <div className="technician-status flex items-center justify-center gap-1">
        <div className={`status-indicator w-2 h-2 rounded-full ${getStatusColor(professional.status)}`} />
        <span className="status-text text-xs text-gray-600 capitalize truncate">
          {getStatusText(professional.status)}
        </span>
      </div>
    </div>
  )
}
