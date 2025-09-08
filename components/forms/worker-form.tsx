"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface Role {
  id: string;
  name: string;
}

interface WorkerFormProps {
  worker?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

interface FormData {
  name: string
  email: string
  phone: string
  role: string
  status: string
  password: string
  confirmPassword: string
}

export default function WorkerForm({ worker, onSubmit, onCancel, loading = false }: WorkerFormProps) {
  // Estados principales
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  
  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    password: "",
    confirmPassword: ""
  })

  // Cargar roles al montar el componente
  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true)
      console.log('🔄 Cargando roles...')
      
      const response = await fetch('/api/roles')
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Roles cargados:', data)
      
      setRoles(data)
      
      // Si es un nuevo trabajador y no hay rol seleccionado, seleccionar el primero
      if (!worker && data.length > 0 && !formData.role) {
        setFormData(prev => ({ ...prev, role: data[0].name }))
        console.log('🎯 Rol inicial seleccionado:', data[0].name)
      }
      
    } catch (error) {
      console.error('❌ Error cargando roles:', error)
      setErrors(prev => ({ ...prev, role: "Error al cargar roles" }))
    } finally {
      setRolesLoading(false)
    }
  }, [worker, formData.role])

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Actualizar formulario cuando cambie el worker
  useEffect(() => {
    if (worker) {
      // Modo edición
      setFormData({
        name: worker.name || "",
        email: worker.email || "",
        phone: worker.phone || "",
        role: worker.role?.name || "",
        status: worker.isActive ? "active" : "inactive",
        password: "",
        confirmPassword: ""
      })
      console.log('📝 Formulario cargado para edición:', worker.name)
    } else {
      // Modo creación - limpiar formulario
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "active",
        password: "",
        confirmPassword: ""
      })
      console.log('🆕 Formulario limpiado para nuevo trabajador')
    }
    setErrors({})
  }, [worker])

  // Manejador de cambios en el formulario
  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }, [errors])

  // Validación del formulario
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    // Validar rol
    if (!formData.role) {
      newErrors.role = "El rol es requerido"
    }

    // Validar contraseña (solo para nuevos trabajadores)
    if (!worker && !formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    // Validar confirmación de contraseña
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    console.log('🔍 Validación del formulario:', { formData, errors: newErrors })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, worker])

  // Manejador de envío del formulario
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('📤 Enviando formulario...')
    
    if (!validateForm()) {
      console.log('❌ Formulario inválido, no se envía')
      return
    }

    // Preparar datos para envío
    const submitData: any = { ...formData }
    if (!submitData.password) {
      delete submitData.password
    }
    delete submitData.confirmPassword

    console.log('✅ Datos a enviar:', submitData)
    onSubmit(submitData)
  }, [formData, validateForm, onSubmit])

  // Función para obtener nombre legible del rol
  const getRoleName = useCallback((roleName: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'SECRETARIA': 'Secretaria',
      'TECNICO': 'Técnico'
    }
    return roleMap[roleName.toUpperCase()] || roleName
  }, [])

  // Función para limpiar formulario
  const clearForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "active",
      password: "",
      confirmPassword: ""
    })
    setErrors({})
    console.log('🧹 Formulario limpiado')
  }, [])

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-gradient-to-br from-slate-50 to-blue-50">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 min-h-0 overflow-y-auto pb-6 px-4">
        {/* Header del formulario */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {worker ? 'Editar Trabajador' : 'Crear Nuevo Trabajador'}
            </h1>
            <p className="text-slate-600 text-lg">
              {worker ? 'Modifica los datos del trabajador existente' : 'Completa el formulario para crear un nuevo trabajador'}
            </p>
          </div>
        </div>

        {/* Sección: Información Personal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Información Personal</h3>
                <p className="text-slate-600">Datos básicos del trabajador</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-4">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Nombre Completo
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ingresa el nombre completo"
                className="h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium"
              />
              {errors.name && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Email */}
            <div className="space-y-4">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Correo Electrónico
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="correo@ejemplo.com"
                className="h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium"
              />
              {errors.email && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-4">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                Teléfono
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+56 9 1234 5678"
                className="h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium"
              />
              {errors.phone && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.phone}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Rol */}
            <div className="space-y-4">
              <Label htmlFor="role" className="text-sm font-semibold text-slate-700">
                Rol
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="h-14 w-full text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium px-4 bg-white"
              >
                <option value="">Seleccionar rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Secretaria">Secretaria</option>
                <option value="Técnico">Técnico</option>
              </select>
              {errors.role && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.role}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Seguridad y Estado */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Seguridad y Estado</h3>
                <p className="text-slate-600">Configuración de acceso y estado del trabajador</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estado */}
            <div className="space-y-4">
              <Label htmlFor="status" className="text-sm font-semibold text-slate-700">
                Estado
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="h-14 w-full text-base border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm font-medium px-4 bg-white"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
              {errors.status && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.status}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-4">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Contraseña
                {!worker && <span className="text-red-500 font-bold">*</span>}
                {worker && <span className="text-slate-500 text-xs ml-2">(Dejar en blanco para mantener la actual)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={worker ? "Dejar en blanco para mantener" : "Ingresa la contraseña"}
                className="h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm font-medium"
              />
              {errors.password && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.password}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Confirmar Contraseña */}
            {!worker && (
              <div className="space-y-4 md:col-span-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                  Confirmar Contraseña
                  <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Confirma la contraseña"
                  className="h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm font-medium"
                />
                {errors.confirmPassword && (
                  <Alert variant="destructive" className="py-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.confirmPassword}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50">
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-14 text-base font-semibold border-2 rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>{worker ? "Actualizar Trabajador" : "Crear Trabajador"}</span>
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Error general */}
        {errors.submit && (
          <Alert variant="destructive" className="py-4 rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{errors.submit}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
