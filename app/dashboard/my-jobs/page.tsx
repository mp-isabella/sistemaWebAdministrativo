"use client"

import RoleRedirect from "@/components/auth/role-redirect"
import TecnicoDashboard from "@/components/dashboard/tecnico-dashboard"

export default function MyJobsPage() {
  return (
    <RoleRedirect allowedRoles={["operador"]}>
      <TecnicoDashboard />
    </RoleRedirect>
  )
}
