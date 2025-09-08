import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Download,
  Filter, 
  Search,
  Calendar,
  Users,
  Building2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestión de Cajas | Améstica Servicios Técnicos',
  description: 'Administra y controla el flujo de caja, transacciones financieras y reportes de ingresos y egresos.',
  keywords: 'caja, finanzas, transacciones, ingresos, egresos, reportes financieros, Améstica',
  openGraph: {
    title: 'Gestión de Cajas | Améstica Servicios Técnicos',
    description: 'Administra y controla el flujo de caja, transacciones financieras y reportes de ingresos y egresos.',
    type: 'website',
  },
};

export default function CashDashboard() {
  // Datos simulados para el dashboard
  const stats = [
    {
      title: "Saldo Total",
      value: "$2,847,500",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Ingresos del Mes",
      value: "$1,245,800",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Egresos del Mes",
      value: "$892,300",
      change: "-3.1%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Transacciones",
      value: "156",
      change: "+5.7%",
      trend: "up",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "ingreso",
      description: "Pago Servicio Técnico #1234",
      amount: 125000,
      date: "2024-01-15",
      client: "Empresa ABC Ltda",
      status: "completado"
    },
    {
      id: 2,
      type: "egreso",
      description: "Compra Repuestos",
      amount: -45000,
      date: "2024-01-14",
      client: "Proveedor XYZ",
      status: "completado"
    },
    {
      id: 3,
      type: "ingreso",
      description: "Mantenimiento Preventivo #567",
      amount: 89000,
      date: "2024-01-13",
      client: "Industria DEF",
      status: "pendiente"
    },
    {
      id: 4,
      type: "egreso",
      description: "Pago Nómina Técnicos",
      amount: -320000,
      date: "2024-01-12",
      client: "RRHH",
      status: "completado"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cajas</h1>
          <p className="text-gray-600 mt-2">
            Administra y controla el flujo de caja de manera eficiente
          </p>
            </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="bg-[#002D71] hover:bg-[#1e40af] transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
            </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
            </Button>
          </div>
        </div>

      {/* Filtros y Búsqueda */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar transacciones..."
                  className="pl-10 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71]"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fecha
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={stat.trend === "up" ? "default" : "secondary"}
                      className={`${
                        stat.trend === "up" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Flujo de Caja */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#002D71]" />
            Flujo de Caja - Últimos 30 Días
          </CardTitle>
          <CardDescription>
            Visualiza el comportamiento de ingresos y egresos a lo largo del tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Gráfico de Flujo de Caja</p>
              <p className="text-sm">Integración con librería de gráficos</p>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Transacciones Recientes */}
      <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#002D71]" />
            Transacciones Recientes
                </CardTitle>
          <CardDescription>
            Últimas operaciones financieras realizadas
          </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente/Proveedor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge 
                        variant={transaction.type === "ingreso" ? "default" : "secondary"}
                        className={`${
                          transaction.type === "ingreso" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {transaction.type === "ingreso" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{transaction.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{transaction.client}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
                      </span>
                          </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{transaction.date}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={transaction.status === "completado" ? "default" : "secondary"}
                        className={`${
                          transaction.status === "completado" 
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }`}
                      >
                        {transaction.status === "completado" ? "Completado" : "Pendiente"}
                      </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

      {/* Resumen de Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#002D71]" />
              Ingresos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
            <div className="space-y-4">
              {[
                { category: "Servicios Técnicos", amount: 890000, percentage: 71.5 },
                { category: "Mantenimiento", amount: 245000, percentage: 19.7 },
                { category: "Reparaciones", amount: 110800, percentage: 8.8 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#002D71] h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                  </div>
                  </div>
              ))}
                </div>
              </CardContent>
            </Card>

        <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#002D71]" />
              Egresos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
              {[
                { category: "Nómina", amount: 320000, percentage: 35.9 },
                { category: "Repuestos", amount: 245000, percentage: 27.5 },
                { category: "Operacionales", amount: 180000, percentage: 20.2 },
                { category: "Administrativos", amount: 147300, percentage: 16.5 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                          </div>
                    <span className="text-sm font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
      </div>
    </div>
  );
}
