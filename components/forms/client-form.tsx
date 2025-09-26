"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalSelect } from "@/components/ui/modal-select"
import { ResponsiveGrid } from "@/components/ui/responsive-container"
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes"
import { CreditCard, Mail, Phone, User } from 'lucide-react'
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

  // Listener para cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleCloseModal = () => {
      onCancel();
    };

    window.addEventListener('closeModal', handleCloseModal);
    return () => {
      window.removeEventListener('closeModal', handleCloseModal);
    };
  }, [onCancel]);

  // Use the destructured variables to avoid unused variable warnings

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
    <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden client-form-modal">
      {/* Header con botón de cerrar */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {client ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
          aria-label="Cerrar modal"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="client-form space-y-3 sm:space-y-4">
          {/* Nombre y RUT */}
          <ResponsiveGrid
            cols={{ mobile: 1, tablet: 2, desktop: 2 }}
            gap="md"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Nombre/Razón Social *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex items-center justify-center" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 text-sm sm:text-base h-11 ${errors.name ? "border-red-500" : ""}`}
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
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex items-center justify-center" />
                <Input
                  id="rut"
                  type="text"
                  placeholder="12.345.678-9"
                  value={formData.rut}
                  onChange={(e) => handleChange("rut", e.target.value)}
                  className="pl-10 text-sm sm:text-base h-11"
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
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex items-center justify-center" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`pl-10 text-sm sm:text-base h-11 ${errors.phone ? "border-red-500" : ""}`}
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex items-center justify-center" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`pl-10 text-sm sm:text-base h-11 ${errors.email ? "border-red-500" : ""}`}
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
              <Input
                id="address"
                type="text"
                placeholder="Calle y número"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={`text-sm sm:text-base h-11 ${errors.address ? "border-red-500" : ""}`}
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
                <ModalSelect
                  value={formData.region}
                  onValueChange={handleRegionChange}
                  placeholder="Seleccionar región"
                  options={regionOptions}
                  className={`text-sm sm:text-base h-11 ${errors.region ? "border-red-500" : ""}`}
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
                <ModalSelect
                  value={formData.commune}
                  onValueChange={(value) => handleChange("commune", value)}
                  placeholder="Seleccionar comuna"
                  options={communeOptions}
                  className={`text-sm sm:text-base h-11 ${errors.commune ? "border-red-500" : ""}`}
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
                <ModalSelect
                  value={formData.company}
                  onValueChange={(value) => handleChange("company", value)}
                  placeholder="Seleccionar empresa"
                  options={companyOptions}
                  className="text-sm sm:text-base h-11"
                  emptyMessage="No se encontraron empresas."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm sm:text-base">Estado</Label>
              <div className="relative">
                <ModalSelect
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                  placeholder="Seleccionar estado"
                  options={[
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" }
                  ]}
                  className="text-sm sm:text-base h-11"
                  emptyMessage="No se encontraron estados."
                />
              </div>
            </div>
          </ResponsiveGrid>

        </form>
      </div>

      {/* Footer con botones */}
      <div className="flex justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Guardando..." : client ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </div>
  )
}