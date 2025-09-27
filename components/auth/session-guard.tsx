"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface SessionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function SessionGuard({ children, fallback: _fallback, requireAuth = true }: SessionGuardProps) {
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

      // Usar setTimeout para evitar redirecciones inmediatas
      const timer = setTimeout(() => {
        router.replace("/login")
      }, 100)
      return () => clearTimeout(timer)
    }

    // Si hay sesión válida, permitir acceso
    if (status === "authenticated" && session) {

      setIsReady(true)
      return
    }

    return undefined

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
