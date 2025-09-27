"use client";

import { Calendar, Clock, User, Building2, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledAt: string;
  startTime: string;
  endTime: string;
  client: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  service: {
    name: string;
    price?: number;
  };
  company: {
    name: string;
    type: string;
  };
  technician?: {
    id: string;
    name: string;
  };
}

interface TodayScheduleProps {
  todayJobs: Job[];
  isLoading?: boolean;
}

export function TodaySchedule({ todayJobs, isLoading = false }: TodayScheduleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Urgente';
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      case 'LOW':
        return 'Baja';
      default:
        return priority;
    }
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    return time;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 w-full">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Agenda del Día
          </h3>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Agenda del Día
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-600">
            {todayJobs.length} trabajo{todayJobs.length !== 1 ? 's' : ''} programado{todayJobs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {todayJobs.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
            No hay trabajos programados para hoy
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            Es un buen día para planificar nuevas actividades
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
          {todayJobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 w-full"
            >
              {/* Header del trabajo */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
                    {job.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                    {job.service?.name}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-3 flex-shrink-0">
                  {/* Indicador de prioridad */}
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getPriorityColor(job.priority)}`}
                    title={`Prioridad: ${getPriorityText(job.priority)}`}
                  ></div>

                  {/* Badge de estado */}
                  <Badge className={`${getStatusColor(job.status)} text-xs sm:text-sm`} variant="outline">
                    {getStatusText(job.status)}
                  </Badge>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {job.client?.name || 'Cliente no especificado'}
                </span>
              </div>

              {/* Información de la empresa */}
              {job.company?.name && (
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 line-clamp-1">
                    {job.company.name} - {job.company.type}
                  </span>
                </div>
              )}

              {/* Horarios */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {formatTime(job.startTime)} - {formatTime(job.endTime)}
                </span>
              </div>

              {/* Dirección */}
              {job.client?.address && (
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                    {job.client.address}
                  </span>
                </div>
              )}

              {/* Técnico asignado */}
              {job.technician && (
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs">👨‍🔧</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                    Técnico: {job.technician.name}
                  </span>
                </div>
              )}

              {/* Acciones rápidas */}
              <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100">
                {job.client?.phone && (
                  <a
                    href={`tel:${job.client.phone}`}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Llamar</span>
                  </a>
                )}

                {job.client?.phone && (
                  <a
                    href={`https://wa.me/${job.client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 hover:text-green-800 transition-colors duration-200"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer informativo */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
          <span className="text-center sm:text-left">
            Última actualización: {new Date().toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span className="text-center sm:text-right">
            Total: {todayJobs.length} trabajo{todayJobs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
