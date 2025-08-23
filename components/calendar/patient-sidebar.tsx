"use client"

import { Button } from "@/components/ui/button"
import { X, Edit, DollarSign, FileText, Palette, Phone, Mail, User, Notebook } from "lucide-react"
import type { Patient } from "@/types/calendar"

interface PatientSidebarProps {
  patient: Patient
  onClose: () => void
}

export function PatientSidebar({ patient, onClose }: PatientSidebarProps) {
  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-semibold text-gray-900">Detalles de la Cita</h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar panel de paciente" className="hover:bg-gray-100 p-1">
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Main Content with Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Patient Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{patient.name}</h3>
            <Button variant="ghost" className="p-2 h-auto text-gray-600 hover:bg-gray-100">
              <Edit className="h-4 w-4 mr-1" />
              <span className="text-sm">Editar</span>
            </Button>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">{patient.appointmentType}</p>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-600">{patient.price}</span>
            </div>
            <p>{patient.date} - {patient.time}</p>
          </div>
        </div>

        {/* Contact Info & Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Información de Contacto</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Atendido por:</span>
              <span className="font-medium">{patient.attendedBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Teléfono:</span>
              <a href={`tel:${patient.phone}`} className="hover:underline">{patient.phone}</a>
              <a href={`https://wa.me/${patient.phone}`} target="_blank" rel="noopener noreferrer" className="text-green-600 text-xs font-semibold hover:underline">
                Hablar por WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Email:</span>
              <a href={`mailto:${patient.email}`} className="text-blue-600 hover:underline">{patient.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">RUT:</span>
              <span>{patient.id_number}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Observaciones</h4>
          <div className="flex items-start gap-2 text-sm">
            <Notebook className="h-4 w-4 text-gray-400 mt-1" />
            <span className="text-gray-600 flex-1">{patient.notes}</span>
          </div>
        </div>
        
        {/* Color Palette */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Colores</h4>
          <div className="flex gap-2">
            {[
              "bg-blue-400", "bg-yellow-400", "bg-pink-400", "bg-green-400",
              "bg-orange-400", "bg-red-400", "bg-purple-400",
            ].map((color, index) => (
              <button
                key={index}
                className={`w-6 h-6 rounded-full ${color} border-2 border-white shadow-sm hover:scale-110 transition-transform`}
                aria-label={`Seleccionar color ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start bg-transparent text-gray-700 hover:bg-gray-100" size="sm">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            Ver pago
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent text-gray-700 hover:bg-gray-100" size="sm">
            <FileText className="h-4 w-4 mr-2 text-gray-600" />
            Ficha médica
          </Button>
        </div>
      </div>
    </aside>
  )
}