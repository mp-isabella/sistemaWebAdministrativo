"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Wrench, DollarSign, Clock, Tag, FileText } from 'lucide-react'

interface ServiceFormProps {
  service?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function ServiceForm({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price?.toString() || "",
    category: service?.category || "",
    estimatedDuration: service?.estimatedDuration?.toString() || "",
    active: service?.active ?? true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del servicio es requerido"
    }

    if (!formData.price.trim()) {
      newErrors.price = "El precio es requerido"
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser un número válido mayor a 0"
    }

    if (!formData.category) {
      newErrors.category = "La categoría es requerida"
    }

    if (formData.estimatedDuration && (isNaN(Number(formData.estimatedDuration)) || Number(formData.estimatedDuration) <= 0)) {
      newErrors.estimatedDuration = "La duración debe ser un número válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null
    }

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="h-5 w-5" />
          <span>{service ? "Editar Servicio" : "Nuevo Servicio"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Servicio *</Label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ej: Detección de fugas"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger className={`pl-10 ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deteccion">Detección de Fugas</SelectItem>
                    <SelectItem value="destape">Destape de Alcantarillado</SelectItem>
                    <SelectItem value="video">Video Inspección</SelectItem>
                    <SelectItem value="reparacion">Reparación</SelectItem>
                    <SelectItem value="mantencion">Mantención</SelectItem>
                    <SelectItem value="instalacion">Instalación</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.category && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.category}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                placeholder="Describe el servicio en detalle..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="pl-10 min-h-[100px]"
              />
            </div>
          </div>

          {/* Precio y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (CLP) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  placeholder="50000"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                  min="0"
                  step="1000"
                />
              </div>
              {errors.price && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.price}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Duración Estimada (minutos)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimatedDuration"
                  type="number"
                  placeholder="120"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleChange("estimatedDuration", e.target.value)}
                  className={`pl-10 ${errors.estimatedDuration ? "border-red-500" : ""}`}
                  min="0"
                  step="15"
                />
              </div>
              {errors.estimatedDuration && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.estimatedDuration}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange("active", checked)}
            />
            <Label htmlFor="active">Servicio activo</Label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Guardando..." : service ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
