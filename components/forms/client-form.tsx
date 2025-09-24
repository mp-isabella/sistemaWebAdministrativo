"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AutocompleteSelect } from "@/components/ui/autocomplete-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ResponsiveContainer, { ResponsiveFlex, ResponsiveGrid } from "@/components/ui/responsive-container"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useResponsive } from "@/hooks/use-responsive"
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes"
import { Building, CreditCard, Mail, MapPin, Phone, User } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from "react"

export interface ClientData {
  name: string;
  rut?: string;
  phone: string;
  email?: string;
  address: string;
  region: string;
  commune: string;
  company?: string;
  status?: string;
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

  // Use the destructured variables to avoid unused variable warnings
  console.log('Responsive state:', { isMobile, isTablet });

  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    phone: "",
    email: "",
    address: "",
    region: "",
    commune: "",
    company: "none",
    status: "active"
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Obtener comunas disponibles según la región seleccionada
  const getAvailableCommunes = useCallback(() => {
    return [...(regionCommuneMap[formData.region as keyof typeof regionCommuneMap] || [])];
  }, [formData.region, regionCommuneMap]);

  // Opciones para los campos con autocompletado
  const regionOptions = useMemo(() =>
    Object.keys(regionCommuneMap).map(region => ({
      value: region,
      label: region
    })), [regionCommuneMap]
  );

  const communeOptions = useMemo(() => {
    const availableCommunes = getAvailableCommunes();
    return availableCommunes.map(commune => ({
      value: commune,
      label: commune
    }));
  }, [getAvailableCommunes]);

  const companyOptions = useMemo(() => [
    { value: "none", label: "Sin empresa" },
    { value: "Améstica Ltda", label: "Améstica Ltda" },
    { value: "Multifugas", label: "Multifugas" },
    { value: "Servifugas", label: "Servifugas" }
  ], []);

  // Update form data when client changes
  useEffect(() => {
    if (client) {

      // Mapear los datos del cliente al formulario
      const formDataToSet = {
        name: client?.name || "",
        rut: client?.rut || "",
        phone: client?.phone || "",
        email: client?.email || "",
        address: client?.address || "",
        region: client?.region || "",
        commune: client?.commune || "",
        company: (client?.company && client?.company !== "" && client?.company !== null) ? client?.company : "none",
        status: client?.status || "active"
      };

      setFormData(formDataToSet);
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
        company: "none",
        status: "active"
      })
    }
  }, [client])

  // Efecto adicional para manejar la lógica de región y comuna cuando se cargan datos
  useEffect(() => {
    if (client && client.region && client.commune) {

      // Verificar si la comuna existe en la región
      const availableCommunes = regionCommuneMap[client.region as keyof typeof regionCommuneMap] || [];
      const communeExists = availableCommunes.some(commune => commune === client.commune);

      if (!communeExists && availableCommunes.length > 0) {

        setFormData(prev => ({
          ...prev,
          commune: ""
        }));
      }
    }
  }, [client, regionCommuneMap])

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
          <form onSubmit={handleSubmit} className="client-form space-y-3 sm:space-y-4">
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
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <AutocompleteSelect
                    value={formData.region}
                    onValueChange={handleRegionChange}
                    placeholder="Seleccionar región"
                    options={regionOptions}
                    className={`pl-10 text-sm sm:text-base h-11 ${errors.region ? "border-red-500" : ""}`}
                    emptyMessage="No se encontraron regiones."
                  />
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
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <AutocompleteSelect
                    value={formData.commune}
                    onValueChange={(value) => handleChange("commune", value)}
                    placeholder="Seleccionar comuna"
                    options={communeOptions}
                    className={`pl-10 text-sm sm:text-base h-11 ${errors.commune ? "border-red-500" : ""}`}
                    emptyMessage="No se encontraron comunas."
                    disabled={!formData.region}
                  />
                </div>
                {errors.commune && (
                  <Alert variant="destructive" className="text-xs sm:text-sm">
                    <AlertDescription>{errors.commune}</AlertDescription>
                  </Alert>
                )}
              </div>
            </ResponsiveGrid>

            {/* Empresa y Estado */}
            <ResponsiveGrid
              cols={{ mobile: 1, tablet: 2, desktop: 2 }}
              gap="md"
            >
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm sm:text-base">Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <AutocompleteSelect
                    value={formData.company}
                    onValueChange={(value) => handleChange("company", value)}
                    placeholder="Seleccionar empresa"
                    options={companyOptions}
                    className="pl-10 text-sm sm:text-base h-11"
                    emptyMessage="No se encontraron empresas."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm sm:text-base">Estado</Label>
                <div className="relative">
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ResponsiveGrid>

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
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-sm sm:text-base"
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
