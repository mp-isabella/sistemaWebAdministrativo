"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import JobStatusCalendar from "@/components/calendar/job-status-calendar"

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && (session?.user as any)?.role?.toLowerCase() !== "tecnico") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || (status === "authenticated" && (session?.user as any)?.role?.toLowerCase() !== "tecnico")) {
    return null
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Calendario de <span className="text-blue-600">Trabajos</span></h1>
            <p className="section-subtitle">Vista de calendario con estado de trabajos</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="btn-outline"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>

        {/* Calendario */}
        <JobStatusCalendar />
      </div>
    </div>
  )
}
