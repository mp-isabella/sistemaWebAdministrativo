"use client"

import { ReactNode, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getDefaultRoute } from "@/lib/roles"

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

      router.replace("/login")
      return
    }

    if (status === "authenticated" && session) {
      const role = (session?.user as any)?.role?.toLowerCase()

      if (allowedRoles) {
        // Normalizar roles permitidos a minúsculas
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase())

        // Verificar si el rol está permitido (incluyendo equivalencias admin/administrador)
        const isAuthorized = normalizedAllowedRoles.includes(role || "") ||
          (role === "admin" && normalizedAllowedRoles.includes("administrador")) ||
          (role === "administrador" && normalizedAllowedRoles.includes("admin"))

        if (!isAuthorized) {

          // Redirigir a la ruta por defecto del rol
          const defaultRoute = getDefaultRoute(role)
          router.replace(defaultRoute)
          return
        }
      }

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
