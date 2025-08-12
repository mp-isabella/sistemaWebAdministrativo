"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Download, Eye } from 'lucide-react'
import { Line, Bar, Doughnut } from "react-chartjs-2"
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
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  category: string;
}

type BalanceData = {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  monthlyGrowth: number;
  transactions: Transaction[];
}

export default function CashBalancePage() {
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(true)
  const [balanceData, setBalanceData] = useState<BalanceData>({
  currentBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  netFlow: 0,
  monthlyGrowth: 0,
  transactions: []
})

  useEffect(() => {
    fetchBalanceData()
  }, [period])

  const fetchBalanceData = async () => {
    try {
      setLoading(true)
      
      // Simulated data - replace with actual API call
      setBalanceData({
        currentBalance: 3250000,
        totalIncome: 4500000,
        totalExpenses: 1250000,
        netFlow: 3250000,
        monthlyGrowth: 15.5,
        transactions: [
          {
            id: "1",
            type: "income",
            amount: 150000,
            description: "Pago servicio - Cliente ABC",
            date: "2024-01-15",
            category: "servicios"
          },
          {
            id: "2",
            type: "expense",
            amount: 45000,
            description: "Combustible vehículos",
            date: "2024-01-15",
            category: "operacional"
          },
          {
            id: "3",
            type: "income",
            amount: 200000,
            description: "Pago factura #001",
            date: "2024-01-14",
            category: "servicios"
          }
        ]
      })
    } catch (error) {
      console.error("Error fetching balance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportBalanceReport = async () => {
    try {
      const response = await fetch(`/api/reports/export?type=cash-balance&period=${period}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `balance-caja-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting balance report:', error)
    }
  }

  // Chart data
  const cashFlowData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Ingresos",
        data: [800000, 1200000, 950000, 1400000, 1100000, 1300000],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.1,
      },
      {
        label: "Gastos",
        data: [300000, 450000, 380000, 520000, 410000, 480000],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.1,
      }
    ],
  }

  const categoryDistribution = {
    labels: ["Servicios", "Mantenimiento", "Combustible", "Salarios", "Otros"],
    datasets: [
      {
        data: [60, 15, 10, 10, 5],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
      },
    ],
  }

  const monthlyBalanceData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Balance Acumulado",
        data: [500000, 1250000, 1820000, 2700000, 3390000, 4210000],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando balance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance General de Caja</h1>
          <p className="text-gray-600">Análisis detallado del flujo de efectivo</p>
        </div>
        <div className="flex space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportBalanceReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Exportar Balance
          </Button>
        </div>
      </div>

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Actual</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${balanceData.currentBalance.toLocaleString("es-CL")}
                </p>
                <p className="text-xs text-blue-600 mt-1">Saldo disponible</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${balanceData.totalIncome.toLocaleString("es-CL")}
                </p>
                <p className="text-xs text-green-600 mt-1">Este período</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastos</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${balanceData.totalExpenses.toLocaleString("es-CL")}
                </p>
                <p className="text-xs text-red-600 mt-1">Este período</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flujo Neto</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${balanceData.netFlow.toLocaleString("es-CL")}
                </p>
                <p className={`text-xs mt-1 ${balanceData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balanceData.monthlyGrowth >= 0 ? '+' : ''}{balanceData.monthlyGrowth}% vs mes anterior
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                {balanceData.monthlyGrowth >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-purple-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flujo de Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={cashFlowData} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={monthlyBalanceData} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={categoryDistribution} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transacciones Recientes</span>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balanceData.transactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString("es-CL")} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proyección Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos estimados:</span>
                <span className="font-semibold text-green-600">$1,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos estimados:</span>
                <span className="font-semibold text-red-600">$500,000</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Balance proyectado:</span>
                  <span className="font-bold text-blue-600">$1,000,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicadores Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Margen de ganancia:</span>
                <Badge className="bg-green-100 text-green-800">72%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Días de efectivo:</span>
                <Badge className="bg-blue-100 text-blue-800">45 días</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Liquidez:</span>
                <Badge className="bg-purple-100 text-purple-800">Excelente</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">✓ Balance saludable</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">⚠ Revisar gastos de combustible</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">ℹ Oportunidad de inversión</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
