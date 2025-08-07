"use client"

import { useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type Role = string

interface RoleRedirectProps {
  allowedRoles: Role[]
  redirectTo?: string
  children: ReactNode
}

export default function RoleRedirect({
  allowedRoles,
  redirectTo = "/dashboard",
  children,
}: RoleRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.replace("/login")
      return
    }

    const userRole = session.user?.role

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.replace(redirectTo)
    }
  }, [session, status, router, allowedRoles, redirectTo])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">
        Cargando...
      </div>
    )
  }

  if (!session || !allowedRoles.includes(session.user?.role)) {
    return null
  }

  return <>{children}</>
}
