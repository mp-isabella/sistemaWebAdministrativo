"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSignOut } from "@/hooks/use-signout"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, User } from "lucide-react"

interface TechnicianGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function TechnicianGuard({ children, fallback }: TechnicianGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { handleSignOut } = useSignOut()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Verificar que el usuario sea técnico
    if (session.user.role.toLowerCase() !== "tecnico") {
      setIsAuthorized(false)
      setIsLoading(false)
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [session, status, router])

  // Mostrar estado de carga
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Mostrar error de autorización
  if (!isAuthorized) {
    return fallback || (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <Alert className="border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex flex-col space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Acceso Denegado</h3>
                  <p>No tienes permisos para acceder a esta sección. Solo los técnicos pueden ver el calendario de trabajos.</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Ir al Dashboard</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Renderizar contenido si está autorizado
  return <>{children}</>
}
