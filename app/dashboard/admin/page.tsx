"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, Database, Shield, Bell, Palette, Globe, Key } from "lucide-react"

export default function AdminPage() {
  const adminModules = [
    {
      title: "Gestión de Usuarios",
      description: "Administrar roles, permisos y accesos al sistema",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      status: "active",
    },
    {
      title: "Notificaciones",
      description: "Configurar alertas y notificaciones del sistema",
      icon: Bell,
      color: "bg-yellow-100 text-yellow-600",
      status: "active",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "beta":
        return "bg-yellow-100 text-yellow-800"
      case "coming_soon":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "beta":
        return "Beta"
      case "coming_soon":
        return "Próximamente"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-1">Configuración avanzada y gestión del sistema</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Settings className="mr-2 h-4 w-4" />
          Configuración General
        </Button>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {adminModules.map((module, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{module.title}</CardTitle>
                  </div>
                </div>
                <Badge className={getStatusColor(module.status)} variant="outline">
                  {getStatusLabel(module.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <Button variant="outline" className="w-full bg-white" disabled={module.status === "coming_soon"}>
                {module.status === "coming_soon" ? "Próximamente" : "Configurar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Actividad Reciente del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Nuevo usuario registrado: Ana Silva</span>
              </div>
              <span className="text-xs text-gray-500">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Respaldo de base de datos completado</span>
              </div>
              <span className="text-xs text-gray-500">Hace 6 horas</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Actualización del sistema programada</span>
              </div>
              <span className="text-xs text-gray-500">Hace 1 día</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
