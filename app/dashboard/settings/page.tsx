// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Save, Settings, User } from "lucide-react";
import '../styles/unified-design.css';

export default function SettingsPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Unificado */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              <span className="text-blue-600">Configuración</span> del Sistema
            </h1>
            <p className="section-subtitle">
              Gestiona la configuración de tu cuenta y preferencias
            </p>
          </div>
          <div className="header-actions">
            <Button className="btn-primary">
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="unified-card">
          <div className="unified-card-header">
            <h2 className="unified-card-title">
              <Settings className="h-5 w-5" />
              Configuración de Usuario
            </h2>
          </div>
          <div className="unified-card-content">
            <div className="unified-form max-w-lg mx-auto">
              <div className="form-group">
                <label className="form-label">
                  <User className="mr-2 h-4 w-4" />
                  Nombre
                </label>
                <Input
                  placeholder="Usuario Demo"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </label>
                <Input
                  placeholder="usuario@demo.com"
                  type="email"
                  className="form-input"
                />
              </div>

              <Button className="btn-primary w-full">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
