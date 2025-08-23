"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  DollarSign,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ImageIcon,
} from "lucide-react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { RoleRedirect } from "@/components/auth/role-redirect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role?.toLowerCase();


  const [stats, setStats] = useState({
    todayJobs: 8,
    pendingJobs: 12,
    completedJobs: 45,
    totalRevenue: 2850000,
    activeClients: 128,
    activeTechnicians: 6,
  });

  const [todaySchedule, setTodaySchedule] = useState([
    {
      id: "1",
      time: "09:00",
      client: "María González",
      service: "Detección de Fugas",
      technician: "Juan Pérez",
      status: "confirmado",
      priority: "alta",
    },
    {
      id: "2",
      time: "11:30",
      client: "Empresa ABC",
      service: "Video Inspección",
      technician: "Ana Silva",
      status: "en progreso",
      priority: "media",
    },
    {
      id: "3",
      time: "14:00",
      client: "Carlos Rodríguez",
      service: "Destape de Alcantarillado",
      technician: "Luis Torres",
      status: "pendiente",
      priority: "alta",
    },
    {
      id: "4",
      time: "16:30",
      client: "Condominio Los Pinos",
      service: "Detección de Fugas",
      technician: "Pedro Sánchez",
      status: "confirmado",
      priority: "baja",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-blue-100 text-blue-800";
      case "en_progreso":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "completado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Chart data
  const weeklyJobsData = {
    labels: [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ],
    datasets: [
      {
        label: "Trabajos Completados",
        data: [12, 15, 8, 18, 22, 14, 6],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const revenueData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    datasets: [
      {
        label: "Ingresos (CLP)",
        data: [1200000, 1900000, 1500000, 2500000, 2200000, 2850000],
        borderColor: "rgb(245, 124, 0)",
        backgroundColor: "rgba(245, 124, 0, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const serviceDistribution = {
    labels: [
      "Detección de Fugas",
      "Destape Alcantarillado",
      "Video Inspección",
    ],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 124, 0, 0.8)",
          "rgba(34, 197, 94, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" } },
      x: { grid: { display: false } },
    },
  };

  if (!session) {
    return <div className="text-center py-20">Cargando...</div>;
  }


  return (
    <RoleRedirect>
      <div className="space-y-6">
        {/* Encabezado de Bienvenida */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Hola, {session?.user?.name?.split(" ")[0] || "Usuario"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Aquí tienes un resumen de tu día en Améstica
            </p>
          </div>
          <div className="flex space-x-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/schedule">
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Trabajo
                </>
              </Link>
            </Button>

            <Button asChild variant="outline" className="bg-white">
              <Link href="/dashboard/schedule/calendar">
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Calendario
                </>
              </Link>
            </Button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Estadísticas para todos los roles */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {userRole === "tecnico" ? "Mis Trabajos Hoy" : "Trabajos Hoy"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.todayJobs}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+2 desde ayer</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {userRole === "tecnico" ? "Mis Pendientes" : "Pendientes"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pendingJobs}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Requieren atención
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {userRole === "tecnico" ? "Mis Completados" : "Completados"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completedJobs}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Este mes</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadística de ingresos solo para admin y secretaria */}
          {(userRole === "admin" || userRole === "secretaria") && (
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalRevenue.toLocaleString("es-CL")}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +15% vs mes anterior
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadística adicional para tecnico */}
          {userRole === "tecnico" && (
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                    <p className="text-3xl font-bold text-gray-900">95%</p>
                    <p className="text-xs text-indigo-600 mt-1">Este mes</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agenda de Hoy */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Agenda de Hoy
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {todaySchedule.length} trabajos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {appointment.time}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {appointment.client}
                          </h4>
                          <Badge
                            className={getPriorityColor(appointment.priority)}
                            variant="outline"
                          >
                            {appointment.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {appointment.service}
                        </p>
                        <p className="text-xs text-gray-500">
                          Técnico: {appointment.technician}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribución de Servicios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Distribución de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut
                  data={serviceDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Trabajos por Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={weeklyJobsData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Evolución de Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={revenueData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `$${context.parsed.y.toLocaleString("es-CL")}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Acciones para Admin y Secretaria */}
              {(userRole === "admin" || userRole === "secretaria") && (
                <>
                  <Link href="/dashboard/clients">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-blue-50 w-full"
                    >
                      <Users className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Nuevo Cliente</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/schedule">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-green-50 w-full"
                    >
                      <Wrench className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">
                        Programar Servicio
                      </span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/billing">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-orange-50 w-full"
                    >
                      <DollarSign className="h-6 w-6 text-orange-600" />
                      <span className="text-sm font-medium">Generar Factura</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/reports">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-purple-50 w-full"
                    >
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium">Ver Reportes</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* Acciones específicas para Técnico */}
              {userRole === "tecnico" && (
                <>
                  <Link href="/dashboard/my-jobs">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-blue-50 w-full"
                    >
                      <Wrench className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Mis Trabajos</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/evidences">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-green-50 w-full"
                    >
                      <ImageIcon className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">Evidencias</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/my-jobs">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-orange-50 w-full"
                    >
                      <Clock className="h-6 w-6 text-orange-600" />
                      <span className="text-sm font-medium">Estado Trabajos</span>
                    </Button>
                  </Link>

                  <Link href="/dashboard/my-jobs">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-white hover:bg-purple-50 w-full"
                    >
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium">Completados</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleRedirect>
  );
}
