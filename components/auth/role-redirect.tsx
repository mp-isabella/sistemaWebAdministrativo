"use client"

import { ReactNode, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface RoleRedirectProps {
  children: ReactNode
  allowedRoles?: string[]
}

export function RoleRedirect({ children, allowedRoles }: RoleRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      console.log("🔒 Usuario no autenticado, redirigiendo a login...")
      router.replace("/login")
      return
    }

    if (status === "authenticated" && session) {
      const role = session?.user?.role
      console.log("👤 Usuario autenticado con rol:", role)
      
      if (allowedRoles && !allowedRoles.includes(role || "")) {
        console.log("🚫 Rol no autorizado, redirigiendo...")
        // Redirigir si el rol no tiene permiso
        if (role === "TECNICO") {
          router.replace("/dashboard/my-jobs")
        } else if (role === "SECRETARIA") {
          router.replace("/dashboard/schedule")
        } else {
          router.replace("/dashboard")
        }
        return
      }
      
      console.log("✅ Acceso autorizado")
      setReady(true)
    }
  }, [status, session, allowedRoles, router])

  if (status === "loading" || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
          <p className="text-sm text-gray-500 mt-2">Por favor espera</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
