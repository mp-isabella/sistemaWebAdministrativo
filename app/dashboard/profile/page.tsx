import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import '../styles/unified-design.css';
import { User, Mail, Shield, Edit } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Unificado */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              <span className="text-blue-600">Mi</span> Perfil
            </h1>
            <p className="section-subtitle">
              Información personal y configuración de cuenta
            </p>
          </div>
          <div className="header-actions">
            <Button className="btn-primary">
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="unified-card">
          <div className="unified-card-header">
            <h2 className="unified-card-title">
              <User className="h-5 w-5" />
              Información Personal
            </h2>
          </div>
          <div className="unified-card-content">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder-user.jpg" alt="Usuario Demo" />
                  <AvatarFallback>UD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Cambiar Foto
                </Button>
              </div>
              
              {/* Información */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Nombre</p>
                      <p className="text-slate-900">Usuario Demo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="text-slate-900">usuario@demo.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Rol</p>
                      <p className="text-slate-900">Administrador</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
