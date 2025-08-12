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

  // Estado para mostrar/ocultar formulario y si es ingreso o gasto
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<"income" | "expense">("income")

  // Estado para campos del formulario
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10), // formato yyyy-mm-dd
    method: "efectivo",
    category: "",
  })

  // Cálculos para mostrar resumen
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

  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Guardar nueva transacción
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount || Number(formData.amount) <= 0) {
      alert("Por favor, complete la descripción y un monto válido.")
      return
    }

    const newTransaction = {
      id: Date.now().toString(),
      type: formType,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      method: formData.method,
      category: formData.category || "varios",
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setShowForm(false)
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      method: "efectivo",
      category: "",
    })
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
          <Button
  variant="outline"
  className="bg-white bg-opacity-30 backdrop-blur-md border border-gray-300 rounded-lg shadow-md
             hover:bg-green-50 hover:border-green-400 hover:shadow-lg
             transition duration-300 ease-in-out flex items-center"
  onClick={() => {
    setFormType("expense")
    setShowForm(true)
  }}
>
  <ArrowDownRight className="mr-2 h-5 w-5 text-red-600 hover:text-red-700 transition-colors" />
  Registrar Gasto
</Button>

<Button
  className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg shadow-lg
             hover:from-green-600 hover:to-green-800
             transform hover:scale-105
             transition duration-300 ease-in-out flex items-center"
  onClick={() => {
    setFormType("income")
    setShowForm(true)
  }}
>
  <ArrowUpRight className="mr-2 h-5 w-5 text-white" />
  Registrar Ingreso
</Button>

        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ... tus Cards actuales ... */}
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

      {/* Modal / Form para nueva transacción */}
      {showForm && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg w-96 shadow-lg"> {/* padding aumentado */}
      <h2 className="text-2xl font-bold mb-6"> {/* texto más grande y margen inferior */}
        {formType === "income" ? "Registrar Ingreso" : "Registrar Gasto"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6"> {/* más espacio entre campos */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Descripción</label> {/* texto más grande */}
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-3 text-lg"  
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Monto</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-3 text-lg"
            min={1}
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-3 text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Método</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleInputChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-3 text-lg"
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">Categoría</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Servicios, Operacional, etc."
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-3 text-lg"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6"> {/* más espacio entre botones y arriba */}
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-2 text-lg"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className={`${formType === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} px-6 py-2 text-lg`}
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  </div>
)}

      
    </div>
  )
}
