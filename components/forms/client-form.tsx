"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, MapPin, Building, CreditCard } from 'lucide-react'
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes"
import { useResponsive } from "@/hooks/use-responsive"
import ResponsiveContainer, { ResponsiveGrid, ResponsiveFlex } from "@/components/ui/responsive-container"

export interface ClientData {
  name: string;
  rut?: string;
  phone: string;
  email?: string;
  address: string;
  region: string;
  commune: string;
  company?: string;
}

interface ClientFormProps {
  client?: ClientData
  onSubmit: (data: ClientData) => void
  onCancel: () => void
  loading?: boolean
}

export default function ClientForm({ client, onSubmit, onCancel, loading = false }: ClientFormProps) {
  // Usar el mapeo completo de regiones y comunas
  const regionCommuneMap = useMemo(() => REGIONES_Y_COMUNAS, []);
  const { isMobile, isTablet } = useResponsive();

  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    phone: "",
    email: "",
    address: "",
    region: "",
    commune: "",
    company: "none"
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client?.name || "",
        rut: client?.rut || "",
        phone: client?.phone || "",
        email: client?.email || "",
        address: client?.address || "",
        region: client?.region || "",
        commune: client?.commune || "",
        company: client?.company || "none"
      })
    } else {
      // Reset form when creating new client
      setFormData({
        name: "",
        rut: "",
        phone: "",
        email: "",
        address: "",
        region: "",
        commune: "",
        company: "none"
      })
    }
  }, [client])

  // Obtener comunas disponibles según la región seleccionada
  const getAvailableCommunes = () => {
    return [...(regionCommuneMap[formData.region as keyof typeof regionCommuneMap] || [])];
  };

  // Resetear comuna cuando cambia la región
  const handleRegionChange = (region: string) => {
    const availableCommunes = [...(regionCommuneMap[region as keyof typeof regionCommuneMap] || [])];
    const newCommune = availableCommunes.includes(formData.commune as any) ? formData.commune : availableCommunes[0] || "";
    
    setFormData(prev => ({
      ...prev,
      region,
      commune: newCommune
    }));
    
    // Limpiar errores
    if (errors.region) {
      setErrors(prev => ({ ...prev, region: "" }));
    }
    if (errors.commune) {
      setErrors(prev => ({ ...prev, commune: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es requerida"
    }

    if (!formData.region) {
      newErrors.region = "La región es requerida"
    }

    if (!formData.commune) {
      newErrors.commune = "La comuna es requerida"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      company: formData.company === "none" ? "" : formData.company
    };

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <ResponsiveContainer className="w-full max-w-2xl mx-auto">
      <Card className="w-full">
        <CardHeader className="p-3 sm:p-4 lg:p-6 pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{client ? "Editar Cliente" : "Nuevo Cliente"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Nombre y RUT */}
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 2 }}
            gap="md"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Nombre/Razón Social *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 text-sm sm:text-base ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut" className="text-sm sm:text-base">RUT</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="rut"
                  type="text"
                  placeholder="12.345.678-9"
                  value={formData.rut}
                  onChange={(e) => handleChange("rut", e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
          </ResponsiveGrid>

          {/* Teléfono y Email */}
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 2 }}
            gap="md"
          >
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm sm:text-base">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`pl-10 text-sm sm:text-base ${errors.phone ? "border-red-500" : ""}`}
                />
              </div>
              {errors.phone && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertDescription>{errors.phone}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`pl-10 text-sm sm:text-base ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>
          </ResponsiveGrid>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm sm:text-base">Dirección (Calle) *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                placeholder="Calle y número"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`pl-10 text-sm sm:text-base ${errors.address ? "border-red-500" : ""}`}
              />
            </div>
            {errors.address && (
              <Alert variant="destructive" className="text-xs sm:text-sm">
                <AlertDescription>{errors.address}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Región y Comuna */}
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 2 }}
            gap="md"
          >
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm sm:text-base">Región *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={formData.region} onValueChange={handleRegionChange}>
                  <SelectTrigger className={`pl-10 text-sm sm:text-base ${errors.region ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(regionCommuneMap).map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.region && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertDescription>{errors.region}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune" className="text-sm sm:text-base">Comuna *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={formData.commune} onValueChange={(value) => handleChange("commune", value)}>
                  <SelectTrigger className={`pl-10 text-sm sm:text-base ${errors.commune ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar comuna" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCommunes().map((commune) => (
                      <SelectItem key={commune} value={commune}>
                        {commune}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.commune && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertDescription>{errors.commune}</AlertDescription>
                </Alert>
              )}
            </div>
          </ResponsiveGrid>

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm sm:text-base">Empresa</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Select value={formData.company} onValueChange={(value) => handleChange("company", value)}>
                <SelectTrigger className="pl-10 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin empresa</SelectItem>
                  <SelectItem value="Améstica Ltda">Améstica Ltda</SelectItem>
                  <SelectItem value="Multifugas">Multifugas</SelectItem>
                  <SelectItem value="Servifugas">Servifugas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones */}
          <ResponsiveFlex 
            direction="responsive"
            justify="end"
            gap="md"
            className="pt-3 sm:pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
            >
              {loading ? "Guardando..." : client ? "Actualizar" : "Crear"}
            </Button>
          </ResponsiveFlex>
        </form>
      </CardContent>
    </Card>
    </ResponsiveContainer>
  )
}
