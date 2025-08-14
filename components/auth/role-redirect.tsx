"use client"

import { ReactNode, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface RoleRedirectProps {
  children: ReactNode
}

export function RoleRedirect({ children }: RoleRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const userRole = session.user.role

      switch (userRole) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "secretaria":
          router.push("/dashboard/schedule")
          break
        case "operador":
          router.push("/dashboard/my-jobs")
          break
        default:
          router.push("/dashboard")
          break
      }
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  // Solo muestra el contenido si el usuario está autenticado
  if (status === "authenticated") {
    return <>{children}</>
  }

  return null
}
