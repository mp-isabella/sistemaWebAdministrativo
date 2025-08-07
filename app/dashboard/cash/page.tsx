"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function CashPage() {
  const [transactions, setTransactions] = useState([
    {
      id: "1",
      type: "income",
      amount: 85000,
      description: "Pago servicio - María González",
      date: "2024-01-15",
      method: "efectivo",
      category: "servicios",
    },
    {
      id: "2",
      type: "expense",
      amount: 25000,
      description: "Combustible vehículo técnico",
      date: "2024-01-15",
      method: "tarjeta",
      category: "operacional",
    },
    {
      id: "3",
      type: "income",
      amount: 120000,
      description: "Pago servicio - Empresa ABC",
      date: "2024-01-14",
      method: "transferencia",
      category: "servicios",
    },
  ])

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const getTypeColor = (type: string) => {
    return type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "efectivo":
        return "bg-yellow-100 text-yellow-800"
      case "tarjeta":
        return "bg-blue-100 text-blue-800"
      case "transferencia":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cajas</h1>
          <p className="text-gray-600 mt-1">Control de ingresos, gastos y flujo de efectivo</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-white">
            <ArrowDownRight className="mr-2 h-4 w-4" />
            Registrar Gasto
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Registrar Ingreso
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Total</p>
                <p className="text-3xl font-bold text-gray-900">${balance.toLocaleString("es-CL")}</p>
                <p className="text-xs text-green-600 mt-1">Saldo actual</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-gray-900">${totalIncome.toLocaleString("es-CL")}</p>
                <p className="text-xs text-blue-600 mt-1">Este mes</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gastos</p>
                <p className="text-3xl font-bold text-gray-900">${totalExpenses.toLocaleString("es-CL")}</p>
                <p className="text-xs text-red-600 mt-1">Este mes</p>
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
                <p className="text-sm font-medium text-gray-600">Transacciones</p>
                <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
                <p className="text-xs text-purple-600 mt-1">Hoy</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900">Transacciones Recientes</CardTitle>
            <Select defaultValue="today">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                    <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString("es-CL")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getMethodColor(transaction.method)} variant="outline">
                    {transaction.method}
                  </Badge>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}