"use client"

interface Professional {
  id: string
  name: string
  status?: string
  avatar?: string
}

interface TechnicianHeaderProps {
  professional: Professional
  width: number
}

export function TechnicianHeader({ professional, width }: TechnicianHeaderProps) {

  return (
    <div 
      className="technician-header bg-white p-3 text-center border-r border-gray-200 flex items-center justify-center"
      style={{ 
        width: `${width}px`,
        minWidth: `${width}px`,
        maxHeight: '80px'
      }}
    >
      <h3 
        className="technician-name font-semibold text-sm text-gray-900 truncate w-full" 
        title={professional.name}
      >
        {professional.name}
      </h3>
    </div>
  )
}
