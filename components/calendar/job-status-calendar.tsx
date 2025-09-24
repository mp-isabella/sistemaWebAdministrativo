"use client"

import JobManagementModal from "@/components/dashboard/job-management-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface Job {
  id: string
  title: string
  description: string
  status: string
  priority: string
  scheduledAt: string
  startTime: string
  endTime: string
  address: string
  notes: string
  images: string
  signature: string
  client: {
    name: string
    phone: string
    email: string
    address: string
  }
  service: {
    name: string
  }
  estimatedDuration?: number
}

interface JobStatusCalendarProps {
  className?: string
}

export default function JobStatusCalendar({ className }: JobStatusCalendarProps) {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false)

  useEffect(() => {
    if (session) {
      fetchJobs()
    }
  }, [session])

  // Escuchar eventos de actualización de estado de trabajos
  useEffect(() => {
    const handleJobStatusUpdated = () => {

      fetchJobs() // Recargar trabajos para reflejar el nuevo estado
    }

    window.addEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener)

    return () => {
      window.removeEventListener('jobStatusUpdated', handleJobStatusUpdated as EventListener)
    }
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {

    }
  }

  const handleJobUpdated = () => {
    fetchJobs()
  }

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduledAt)
      return jobDate.toDateString() === date.toDateString()
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 border-green-300 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 border-blue-300 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 border-red-300 text-red-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-3 w-3" />
      case "IN_PROGRESS":
        return <Clock className="h-3 w-3" />
      case "PENDING":
        return <AlertCircle className="h-3 w-3" />
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />
      default:
        return <CalendarIcon className="h-3 w-3" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const renderDayContent = (day: Date) => {
    const dayJobs = getJobsForDate(day)

    if (dayJobs.length === 0) {
      return <div className="p-1 text-sm">{day.getDate()}</div>
    }

    return (
      <div className="p-1">
        <div className="text-sm font-medium mb-1">{day.getDate()}</div>
        <div className="space-y-1">
          {dayJobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className={`flex items-center gap-1 p-1 rounded text-xs text-white cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(job.status)}`}
              onClick={() => {
                setSelectedJob(job)
                setIsManagementModalOpen(true)
              }}
              title={`${job.title} - ${job.client.name}`}
            >
              {getStatusIcon(job.status)}
              <span className="truncate">{job.title}</span>
            </div>
          ))}
          {dayJobs.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayJobs.length - 3} más
            </div>
          )}
        </div>
      </div>
    )
  }

  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : []

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendario de Trabajos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendario */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }: any) => renderDayContent(date)
                } as any}
              />

              {/* Leyenda */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Leyenda:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Completado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>En Progreso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Pendiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Cancelado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trabajos del día seleccionado */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Trabajos del {selectedDate?.toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>

              {selectedDateJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay trabajos programados para este día</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.client.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(job.status)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{job.startTime} - {job.endTime}</span>
                          <span>{job.address}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedJob(job)
                            setIsManagementModalOpen(true)
                          }}
                          className="w-full"
                        >
                          Gestionar Trabajo
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Gestión de Trabajos */}
      <JobManagementModal
        job={selectedJob}
        isOpen={isManagementModalOpen}
        onClose={() => {
          setIsManagementModalOpen(false)
          setSelectedJob(null)
        }}
        onJobUpdated={handleJobUpdated}
      />
    </div>
  )
}
