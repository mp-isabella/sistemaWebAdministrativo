"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Shield, User, X } from 'lucide-react'
import { useCallback, useEffect, useState } from "react"
interface Role {
  id: string;
  name: string;
}
interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
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
  company: string
  status: string
  password: string
  confirmPassword: string
}
export default function WorkerForm({ worker, onSubmit, onCancel, loading = false }: WorkerFormProps) {
  // Estados principales
  const [roles, setRoles] = useState<Role[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [initialValuesSet, setInitialValuesSet] = useState(false)
  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    company: "",
    status: "active",
    password: "",
    confirmPassword: ""
  })
  // Cargar roles al montar el componente
  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true)
      const response = await fetch('/api/roles')
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setRoles(data)
      // Si es un nuevo trabajador y no hay rol seleccionado, seleccionar el primero
      if (!worker && data.length > 0 && !formData.role) {
        setFormData(prev => ({ ...prev, role: data[0].name }))
      }
      // En modo edición, no cambiar el rol si ya está establecido
      if (worker && formData.role) {
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, role: "Error al cargar roles" }))
    } finally {
      setRolesLoading(false)
    }
  }, [worker, formData.role])
  // Cargar empresas al montar el componente
  const fetchCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true)
      // Empresas fijas según requerimiento
      const fixedCompanies = [
        { id: "amestica-ltda", name: "Amestica Ltda" },
        { id: "multifugas", name: "Multifugas" },
        { id: "servifugas", name: "Servifugas" }
      ]
      setCompanies(fixedCompanies)
      // Si es un nuevo trabajador y no hay empresa seleccionada, seleccionar la primera
      if (!worker && fixedCompanies.length > 0 && !formData.company) {
        setFormData(prev => ({ ...prev, company: fixedCompanies[0]?.name || "" }))
      }
      // En modo edición, no cambiar la empresa si ya está establecida
      if (worker && formData.company) {
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, company: "Error al cargar empresas" }))
    } finally {
      setCompaniesLoading(false)
    }
  }, [worker, formData.company])
  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])
  // Cargar empresas al montar el componente
  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])
  // Actualizar formulario cuando cambie el worker
  useEffect(() => {
    if (worker) {
      console.log('🔄 Inicializando formulario con datos del trabajador:', worker);
      // Modo edición - asegurar que los datos se carguen correctamente
      const newFormData = {
        name: worker.name || "",
        email: worker.email || "",
        phone: worker.phone || "",
        role: worker.role || "", // El rol viene como string directamente
        company: worker.company || "",
        status: worker.isActive ? "active" : "inactive",
        password: "",
        confirmPassword: ""
      }
      console.log('📝 Datos del formulario establecidos:', newFormData);
      setFormData(newFormData)
      setInitialValuesSet(false) // Resetear para permitir establecer valores iniciales
    } else {
      console.log('🧹 Limpiando formulario para nuevo trabajador');
      // Modo creación - limpiar formulario
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        company: "",
        status: "active",
        password: "",
        confirmPassword: ""
      })
      setInitialValuesSet(false)
    }
    setErrors({})
  }, [worker])

  // Asegurar que los datos del trabajador se establezcan cuando las opciones estén cargadas
  useEffect(() => {
    if (worker && companies.length > 0 && roles.length > 0 && !initialValuesSet) {
      console.log('🔧 Estableciendo valores iniciales con opciones cargadas');
      // Establecer la empresa del trabajador directamente
      setFormData(prev => ({
        ...prev,
        company: worker.company || "",
        role: worker.role || ""
      }))
      setInitialValuesSet(true)
    }
  }, [worker, companies, roles, initialValuesSet])
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
    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }
    // Validar rol - solo requerido si no hay rol establecido
    if (!formData.role || formData.role.trim() === "") {
      newErrors.role = "El rol es requerido"
    }
    // Validar empresa
    if (!formData.company || formData.company.trim() === "") {
      newErrors.company = "La empresa es requerida"
    }
    // Validar contraseña (solo para nuevos trabajadores)
    if (!worker && !formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    // Validar confirmación de contraseña (solo para nuevos trabajadores)
    if (!worker && formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, worker])
  // Manejador de envío del formulario
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    console.log('📋 Validando formulario con datos:', formData);

    if (!validateForm()) {
      console.log('❌ Validación falló');
      return
    }

    // Preparar datos para envío
    const submitData: any = { ...formData }
    if (!submitData.password) {
      delete submitData.password
    }
    delete submitData.confirmPassword

    console.log('✅ Datos preparados para envío:', submitData);
    onSubmit(submitData)
  }, [formData, validateForm, onSubmit, worker])
  // Función para obtener nombre legible del rol
  const getRoleName = useCallback((roleName: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMINISTRADOR': 'Administrador',
      'SECRETARIA': 'Secretaria',
      'TECNICO': 'Técnico'
    }
    return roleMap[roleName.toUpperCase()] || roleName
  }, [])
  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-gradient-to-br from-slate-50 to-blue-50">
      <form onSubmit={handleSubmit} className="worker-form flex-1 flex flex-col space-y-6 min-h-0 overflow-y-auto pb-6 px-4">
        {/* Header del formulario */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-200/50 relative">
          {/* Botón de cerrar */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:scale-110"
            aria-label="Cerrar formulario"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center pr-8">
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
            {/* Empresa */}
            <div className="space-y-4">
              <Label htmlFor="company" className="text-sm font-semibold text-slate-700">
                Empresa
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <select
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                disabled={companiesLoading}
                className="h-14 w-full text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium px-4 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {companiesLoading ? "Cargando empresas..." : "Seleccionar empresa"}
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.company && (
                <Alert variant="destructive" className="py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.company}</AlertDescription>
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
                disabled={rolesLoading}
                className="h-14 w-full text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium px-4 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {rolesLoading ? "Cargando roles..." : "Seleccionar rol"}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {getRoleName(role.name)}
                  </option>
                ))}
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
            {/* Estado - Solo visible al editar */}
            {worker && (
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
            )}
            {/* Contraseña */}
            <div className={`space-y-4 ${!worker ? 'md:col-span-2' : ''}`}>
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
            <button
              type="submit"
              disabled={loading}
              className="worker-form-submit-button flex-1 h-14 text-base font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl border-0"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>{worker ? "Actualizar Trabajador" : "Crear Trabajador"}</span>
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </button>
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
