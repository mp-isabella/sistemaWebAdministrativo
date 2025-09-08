"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, User, Loader2 } from "lucide-react"

interface SessionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function SessionGuard({ children, fallback, requireAuth = true }: SessionGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Evitar renderizado prematuro
    if (status === "loading") {
      return
    }

    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) {
      setIsReady(true)
      return
    }

    // Si no hay sesión y requiere autenticación, redirigir
    if (status === "unauthenticated") {
      console.log("🔒 Usuario no autenticado, redirigiendo a login...")
      router.replace("/login")
      return
    }

    // Si hay sesión válida, permitir acceso
    if (status === "authenticated" && session) {
      console.log("✅ Sesión válida, permitiendo acceso")
      setIsReady(true)
      return
    }

    // Estado inesperado
    setError("Estado de sesión inesperado")
  }, [status, session, requireAuth, router])

  // Mostrar estado de carga
  if (status === "loading" || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
          <p className="text-sm text-gray-500 mt-2">Por favor espera</p>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => router.push("/login")}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              Ir al Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Recargar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar contenido protegido
  return <>{children}</>
}
