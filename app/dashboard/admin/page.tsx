"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Shield, 
  Activity,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Globe,
  Server,
  Bell,
  Clock,
  FileText,
  X,
  MoreHorizontal,
  Share2,
  Copy,
  History,
  Info
} from 'lucide-react';
export default function AdminDashboard() {
  // Datos simulados para el historial de notificaciones CRUD
  const activityHistory = [
    {
      id: 1,
      action: "create",
      module: "Clientes",
      description: "Nuevo cliente registrado: Empresa Tecnológica Ltda.",
      user: "admin@amestica.cl",
      timestamp: "2024-01-15 15:30:22",
      details: {
        clientName: "Empresa Tecnológica Ltda.",
        rut: "76.123.456-7",
        region: "Metropolitana"
      },
      priority: "normal",
      status: "completado"
    },
    {
      id: 2,
      action: "update",
      module: "Trabajadores",
      description: "Información del técnico actualizada: Carlos Méndez",
      user: "secretaria@amestica.cl",
      timestamp: "2024-01-15 15:25:18",
      details: {
        workerName: "Carlos Méndez",
        field: "Teléfono de contacto",
        oldValue: "+56 9 1234 5678",
        newValue: "+56 9 9876 5432"
      },
      priority: "normal",
      status: "en_progreso"
    },
    {
      id: 3,
      action: "delete",
      module: "Cotizaciones",
      description: "Cotización eliminada: COT-2024-001",
      user: "admin@amestica.cl",
      timestamp: "2024-01-15 15:00:00",
      details: {
        quoteId: "COT-2024-001",
        clientName: "Cliente Anterior",
        amount: "$150,000"
      },
      priority: "high",
      status: "pendiente"
    },
    {
      id: 4,
      action: "create",
      module: "Liquidaciones",
      description: "Nueva liquidación generada: LIQ-2024-001",
      user: "contador@amestica.cl",
      timestamp: "2024-01-15 14:45:33",
      details: {
        liquidationId: "LIQ-2024-001",
        workerName: "Ana Rodríguez",
        amount: "$85,000"
      },
      priority: "normal",
      status: "completado"
    },
    {
      id: 5,
      action: "update",
      module: "Cajas",
      description: "Estado de caja actualizado: Caja Principal",
      user: "admin@amestica.cl",
      timestamp: "2024-01-15 14:30:15",
      details: {
        cashRegister: "Caja Principal",
        oldStatus: "Abierta",
        newStatus: "Cerrada",
        balance: "$45,250"
      },
      priority: "normal",
      status: "en_progreso"
    },
    {
      id: 6,
      action: "create",
      module: "Reportes",
      description: "Reporte financiero generado: REP-FIN-2024-01",
      user: "sistema@amestica.cl",
      timestamp: "2024-01-15 14:15:00",
      details: {
        reportId: "REP-FIN-2024-01",
        type: "Reporte Financiero",
        period: "Enero 2024",
        size: "2.4 MB"
      },
      priority: "normal",
      status: "pendiente"
    },
    {
      id: 7,
      action: "update",
      module: "Trabajos",
      description: "Estado de trabajo actualizado: TRB-2024-001",
      user: "tecnico@amestica.cl",
      timestamp: "2024-01-15 14:00:45",
      details: {
        jobId: "TRB-2024-001",
        oldStatus: "En Progreso",
        newStatus: "Completado",
        clientName: "Empresa ABC"
      },
      priority: "normal",
      status: "completado"
    },
    {
      id: 8,
      action: "delete",
      module: "Evidencias",
      description: "Evidencia eliminada: EV-2024-001",
      user: "admin@amestica.cl",
      timestamp: "2024-01-15 13:45:22",
      details: {
        evidenceId: "EV-2024-001",
        jobId: "TRB-2024-001",
        type: "Foto de trabajo"
      },
      priority: "medium",
      status: "en_progreso"
    }
  ];

  // Estadísticas del sistema
  const systemStats = [
    {
      title: "Usuarios Activos",
      value: "47",
      change: "+3",
      trend: "up",
      icon: Users,
      color: "text-[#016AAB]",
      bgColor: "bg-[#C4E9F9]",
      status: "completado"
    },
    {
      title: "Sesiones Activas",
      value: "23",
      change: "+5",
      trend: "up",
      icon: Activity,
      color: "text-[#016AAB]",
      bgColor: "bg-[#C4E9F9]",
      status: "en_progreso"
    },
    {
      title: "Actividades Hoy",
      value: "156",
      change: "+12",
      trend: "up",
      icon: Clock,
      color: "text-[#016AAB]",
      bgColor: "bg-[#C4E9F9]",
      status: "pendiente"
    },
    {
      title: "Uptime Sistema",
      value: "99.9%",
      change: "+0.1%",
      trend: "up",
      icon: Server,
      color: "text-[#016AAB]",
      bgColor: "bg-[#C4E9F9]",
      status: "completado"
    }
  ];

  // Función para obtener el icono según la acción
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "update":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  // Función para obtener el color del badge según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el color del badge según el módulo
  const getModuleColor = (module: string) => {
    switch (module) {
      case "Clientes":
        return "bg-[#C4E9F9] text-[#002D71] border-[#9ABCE1]";
      case "Trabajadores":
        return "bg-[#9ABCE1] text-[#014C90] border-[#5692C8]";
      case "Cotizaciones":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "Liquidaciones":
        return "bg-green-50 text-green-800 border-green-200";
      case "Cajas":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Reportes":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Trabajos":
        return "bg-[#9ABCE1] text-[#014C90] border-[#5692C8]";
      case "Evidencias":
        return "bg-gray-50 text-gray-800 border-gray-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completado":
        return "bg-green-100 text-green-800 border-green-200";
      case "en_progreso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "completado":
        return "Completado";
      case "en_progreso":
        return "En Progreso";
      case "pendiente":
        return "Pendiente";
      default:
        return "Desconocido";
    }
  };

  // Función para manejar la selección de una actividad
  const handleActivitySelect = (activity: any) => {
    setSelectedActivity(activity);
  };

  // Función para cerrar la tarjeta expandida
  const closeExpandedCard = () => {
    setSelectedActivity(null);
  };



  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-[#002D71] to-[#014C90] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Dashboard de Administración
            </h1>
            <p className="text-[#C4E9F9] mt-2 text-lg">
              Gestiona usuarios, configuraciones del sistema y monitorea el historial de actividades CRUD
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-[#F46015] hover:bg-orange-600 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#002D71]">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="border-0 shadow-lg bg-white rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar en historial de actividades..."
                  className="pl-10 border-gray-200 focus:border-[#016AAB] focus:ring-[#016AAB] rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9] rounded-xl">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fecha
                </Button>
                <Button variant="outline" size="sm" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9] rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9] rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card 
            key={index} 
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-[#C4E9F9] rounded-2xl h-32 cursor-pointer ${
              selectedActivity?.id === `stat-${index}` ? 'ring-4 ring-[#016AAB] ring-opacity-50' : ''
            }`}
            onClick={() => handleActivitySelect({ ...stat, id: `stat-${index}`, type: 'statistic' })}
          >
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#002D71]">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#002D71] mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant="default"
                      className={`${
                        stat.trend === "up" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" 
                          : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                      }`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-sm text-[#014C90] ml-2">vs hora anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-white flex-shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {/* Badge de estado */}
              <div className="absolute top-2 right-2">
                <Badge className={getStatusColor(stat.status)}>
                  {getStatusText(stat.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historial de Actividades CRUD - Sección Principal */}
      <Card className="border-0 shadow-lg bg-white rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-[#C4E9F9] to-[#9ABCE1] rounded-t-2xl">
          <CardTitle className="flex items-center gap-3 text-[#002D71]">
            <Bell className="h-6 w-6" />
            Historial de Actividades CRUD
          </CardTitle>
          <CardDescription className="text-[#014C90]">
            Registro completo de todas las acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activityHistory.map((activity) => (
              <div 
                key={activity.id} 
                className={`bg-[#C4E9F9] rounded-xl p-4 hover:bg-[#9ABCE1] transition-colors cursor-pointer ${
                  selectedActivity?.id === activity.id ? 'ring-2 ring-[#016AAB] ring-opacity-50' : ''
                }`}
                onClick={() => handleActivitySelect(activity)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-[#002D71]">{activity.description}</h4>
                        <Badge className={getPriorityColor(activity.priority)}>
                          {activity.priority === "high" ? "Alta" : 
                           activity.priority === "medium" ? "Media" : "Normal"}
                        </Badge>
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusText(activity.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#014C90] mb-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.timestamp}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-[#9ABCE1]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(activity.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium text-[#002D71] capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-[#014C90]">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge className={getModuleColor(activity.module)}>
                      {activity.module}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9]">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9]">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Actividades por Módulo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white rounded-2xl h-80">
          <CardHeader className="bg-gradient-to-r from-[#9ABCE1] to-[#5692C8] rounded-t-2xl">
            <CardTitle className="flex items-center gap-3 text-white">
              <TrendingUp className="h-6 w-6" />
              Actividades por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-full">
            <div className="space-y-4 h-full">
              {[
                { module: "Clientes", count: 45, color: "bg-[#C4E9F9]" },
                { module: "Trabajadores", count: 32, color: "bg-[#9ABCE1]" },
                { module: "Cotizaciones", count: 28, color: "bg-orange-100" },
                { module: "Liquidaciones", count: 19, color: "bg-green-100" },
                { module: "Cajas", count: 15, color: "bg-purple-100" },
                { module: "Reportes", count: 12, color: "bg-indigo-100" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                    <span className="font-medium text-gray-700">{item.module}</span>
                  </div>
                  <Badge className="bg-[#016AAB] text-white">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white rounded-2xl h-80">
          <CardHeader className="bg-gradient-to-r from-[#5692C8] to-[#014C90] rounded-t-2xl">
            <CardTitle className="flex items-center gap-3 text-white">
              <TrendingUp className="h-6 w-6" />
              Actividades por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-full">
            <div className="space-y-4 h-full">
              {[
                { action: "Creación", count: 67, icon: Plus, color: "text-green-600", bgColor: "bg-green-100" },
                { action: "Edición", count: 89, icon: Edit, color: "text-blue-600", bgColor: "bg-blue-100" },
                { action: "Eliminación", count: 23, icon: Trash2, color: "text-red-600", bgColor: "bg-red-100" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${item.bgColor}`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="font-medium text-gray-700">{item.action}</span>
                  </div>
                  <Badge className="bg-[#016AAB] text-white">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-[#C4E9F9] rounded-2xl h-80">
          <CardHeader className="bg-gradient-to-r from-[#9ABCE1] to-[#5692C8] rounded-t-2xl">
            <CardTitle className="flex items-center gap-3 text-white">
              <Globe className="h-6 w-6" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-full">
            <div className="space-y-4 h-full">
              {[
                { setting: "Idioma del Sistema", value: "Español", editable: true },
                { setting: "Zona Horaria", value: "America/Santiago", editable: true },
                { setting: "Formato de Fecha", value: "DD/MM/YYYY", editable: true },
                { setting: "Moneda", value: "CLP (Peso Chileno)", editable: true }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#9ABCE1]">
                  <span className="text-sm text-[#002D71]">{item.setting}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#014C90]">{item.value}</span>
                    {item.editable && (
                      <Button size="sm" variant="outline" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9]">
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-[#C4E9F9] rounded-2xl h-80">
          <CardHeader className="bg-gradient-to-r from-[#9ABCE1] to-[#5692C8] rounded-t-2xl">
            <CardTitle className="flex items-center gap-3 text-white">
              <Shield className="h-6 w-6" />
              Configuración de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-full">
            <div className="space-y-4 h-full">
              {[
                { setting: "Autenticación 2FA", value: "Habilitada", editable: true },
                { setting: "Política de Contraseñas", value: "Alta Seguridad", editable: true },
                { setting: "Sesiones Múltiples", value: "Permitidas", editable: true },
                { setting: "Registro de Auditoría", value: "Completo", editable: true }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#9ABCE1]">
                  <span className="text-sm text-[#002D71]">{item.setting}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#014C90]">{item.value}</span>
                    {item.editable && (
                      <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-[#014C90]">
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjeta Expandida - Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#C4E9F9] to-[#9ABCE1] rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                                      {selectedActivity.type === 'statistic' ? (
                      <div className="h-8 w-8 text-[#002D71] flex items-center justify-center">
                        {selectedActivity.icon && <selectedActivity.icon className="h-8 w-8 text-[#002D71]" />}
                      </div>
                    ) : (
                    getActionIcon(selectedActivity.action)
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-[#002D71]">
                      {selectedActivity.type === 'statistic' ? selectedActivity.title : selectedActivity.description}
                    </h2>
                    {selectedActivity.type !== 'statistic' && (
                      <p className="text-[#014C90] text-sm mt-1">
                        Módulo: {selectedActivity.module} • Usuario: {selectedActivity.user}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeExpandedCard}
                  className="text-[#002D71] hover:bg-white hover:text-[#002D71]"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#002D71] flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Información General
                  </h3>
                  <div className="space-y-3">
                    {selectedActivity.type === 'statistic' ? (
                      <>
                        <div className="flex justify-between p-3 bg-[#C4E9F9] rounded-lg">
                          <span className="text-[#002D71] font-medium">Valor:</span>
                          <span className="text-[#014C90] font-bold text-xl">{selectedActivity.value}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-[#C4E9F9] rounded-lg">
                          <span className="text-[#014C90] font-medium">Cambio:</span>
                          <span className="text-[#014C90]">{selectedActivity.change}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-[#C4E9F9] rounded-lg">
                          <span className="text-[#002D71] font-medium">Estado:</span>
                          <Badge className={getStatusColor(selectedActivity.status)}>
                            {getStatusText(selectedActivity.status)}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between p-3 bg-[#C4E9F9] rounded-lg">
                          <span className="text-[#002D71] font-medium">Acción:</span>
                          <Badge className={getPriorityColor(selectedActivity.priority)}>
                            {selectedActivity.action === "create" ? "Creación" : 
                             selectedActivity.action === "update" ? "Edición" : "Eliminación"}
                          </Badge>
                        </div>
                        <div className="flex justify-between p-3 bg-[#C4E9F9] rounded-lg">
                          <span className="text-[#002D71] font-medium">Estado:</span>
                          <Badge className={getStatusColor(selectedActivity.status)}>
                            {getStatusText(selectedActivity.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between p-3 bg-[#C4E9F9] rounded-lg">
                          <span className="text-[#002D71] font-medium">Timestamp:</span>
                          <span className="text-[#014C90]">{selectedActivity.timestamp}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#002D71] flex items-center gap-2">
                    <MoreHorizontal className="h-5 w-5" />
                    Acciones Rápidas
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-[#016AAB] hover:bg-[#014C90] text-white w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9] w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9] w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9] w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Detalles Específicos */}
              {selectedActivity.type !== 'statistic' && selectedActivity.details && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#002D71] flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detalles
                  </h3>
                  <div className="bg-[#C4E9F9] rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedActivity.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-white rounded-lg border border-[#9ABCE1]">
                          <span className="font-medium text-[#002D71] capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-[#014C90] font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Historial de Cambios */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002D71] flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial de Cambios
                </h3>
                <div className="bg-[#C4E9F9] rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#9ABCE1]">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[#014C90] text-sm">Estado actualizado a &quot;{getStatusText(selectedActivity.status)}&quot;</span>
                      <span className="text-[#002D71] text-xs ml-auto">Hace 2 horas</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#9ABCE1]">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-[#014C90] text-sm">Información modificada por {selectedActivity.user}</span>
                      <span className="text-[#002D71] text-xs ml-auto">Hace 1 día</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#9ABCE1]">
                <Button variant="outline" onClick={closeExpandedCard} className="border-[#5692C8] text-[#014C90] hover:bg-[#C4E9F9]">
                  Cancelar
                </Button>
                <Button className="bg-[#016AAB] hover:bg-[#014C90] text-white">
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
