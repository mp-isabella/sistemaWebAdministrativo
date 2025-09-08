"use client"

import { Button } from "@/components/ui/button"
import { X, Edit, DollarSign, Phone, Mail, User, CheckCircle, Calendar, Clock } from "lucide-react"
import type { Patient } from "@/types/calendar"
import { memo } from "react"

interface PatientSidebarProps {
  patient: Patient
  onClose: () => void
}

export const PatientSidebar = memo(function PatientSidebar({ patient, onClose }: PatientSidebarProps) {
  // Validar que el paciente tenga información válida
  if (!patient || !patient.name || !patient.id) {
    return null;
  }

  return (
    <aside className="w-auto max-w-4xl bg-white border border-gray-200 flex flex-col overflow-hidden rounded-xl shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-900">Detalles de la Cita</h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar panel de paciente" className="hover:bg-gray-50 p-2 rounded-lg">
          <X className="h-5 w-5 text-gray-400" />
        </Button>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Información de la Cita - Primera columna */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 truncate flex-1 mr-4">{patient.name}</h3>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1 text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200"
                onClick={() => {
                  console.log('Editar cita:', patient.id);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">Editar</span>
              </Button>
            </div>

            {/* Información de la cita */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tipo de Cita</p>
                  <p className="font-semibold text-blue-900 text-sm">{patient.appointmentType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Fecha y Hora</p>
                  <p className="font-semibold text-gray-900 text-sm">{patient.date} - {patient.time}</p>
                </div>
              </div>
              {patient.price && (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Precio</p>
                    <p className="font-bold text-green-700 text-base">{patient.price}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Técnico - Segunda columna */}
          <div className="space-y-4">
            {/* Técnico Asignado */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Técnico Asignado</h4>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Profesional</p>
                    <p className="font-bold text-purple-900 text-sm">{patient.attendedBy}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs text-gray-700">Especialidad: Fisioterapeuta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-xs text-gray-700">Experiencia: 5 años</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de la Cita */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Estado de la Cita</h4>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-green-800 text-sm">Confirmada</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-2">Cambiar estado:</p>
                  <div className="flex gap-2">
                    <button
                      className="w-6 h-6 bg-orange-400 rounded-full hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Pendiente"
                      onClick={() => console.log('Cambiar estado a: Pendiente')}
                    />
                    <button
                      className="w-6 h-6 bg-blue-400 rounded-full hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="En Progreso"
                      onClick={() => console.log('Cambiar estado a: En Progreso')}
                    />
                    <button
                      className="w-6 h-6 bg-green-400 rounded-full hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Completada"
                      onClick={() => console.log('Cambiar estado a: Completada')}
                    />
                    <button
                      className="w-6 h-6 bg-red-400 rounded-full hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Cancelada"
                      onClick={() => console.log('Cambiar estado a: Cancelada')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto y Acciones - Fila inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Información de Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Información de Contacto</h4>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Teléfono</p>
                  <a href={`tel:${patient.phone}`} className="text-gray-900 hover:text-blue-600 hover:underline font-medium text-sm">
                    {patient.phone}
                  </a>
                </div>
                <a
                  href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-xs font-semibold hover:text-green-700 hover:underline bg-green-50 px-2 py-1 rounded-lg transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Email</p>
                  <a href={`mailto:${patient.email}`} className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm">
                    {patient.email}
                  </a>
                </div>
              </div>
              {patient.id_number && (
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">RUT</p>
                    <span className="text-gray-900 font-medium text-sm">{patient.id_number}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Acciones</h4>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200 h-8"
                onClick={() => {
                  console.log('Ver detalles de pago para:', patient.id);
                }}
              >
                <DollarSign className="h-3 w-3 mr-2 text-green-600" />
                <span className="font-medium text-xs">Ver detalles de pago</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200 h-8"
                onClick={() => {
                  console.log('Reagendar cita:', patient.id);
                }}
              >
                <Calendar className="h-3 w-3 mr-2 text-blue-600" />
                <span className="font-medium text-xs">Reagendar cita</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200 h-8"
                onClick={() => {
                  console.log('Asignar técnico para:', patient.id);
                }}
              >
                <User className="h-3 w-3 mr-2 text-purple-600" />
                <span className="font-medium text-xs">Cambiar técnico</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-200 h-8"
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
                    console.log('Cancelar cita:', patient.id);
                  }
                }}
              >
                <X className="h-3 w-3 mr-2" />
                <span className="font-medium text-xs">Cancelar cita</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
})