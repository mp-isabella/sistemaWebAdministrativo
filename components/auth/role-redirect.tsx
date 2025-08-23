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
      router.replace("/login")
      return
    }

    if (status === "authenticated") {
      const role = session?.user?.role?.toLowerCase()
      if (allowedRoles && !allowedRoles.includes(role || "")) {
        // Redirigir si el rol no tiene permiso
        if (role === "tecnico") router.replace("/dashboard/my-jobs")
        else router.replace("/dashboard")
        return
      }
      setReady(true)
    }
  }, [status, session, allowedRoles, router])

  if (status === "loading" || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
