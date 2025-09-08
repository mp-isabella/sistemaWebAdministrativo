'use client';

import { RoleRedirect } from '@/components/auth/role-redirect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '../styles/unified-design.css';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <RoleRedirect>
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header Unificado */}
          <div className="section-header">
            <div>
              <h1 className="section-title">
                <span className="text-blue-600">Estadísticas</span> y Analytics
              </h1>
              <p className="section-subtitle">
                Panel avanzado de métricas y análisis del negocio
              </p>
            </div>
            <div className="header-actions">
              <Button className="btn-primary">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </div>

          {/* Tarjetas principales */}
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="stat-value">85%</div>
              <div className="stat-label">Productividad</div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-icon">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="stat-value">+12%</div>
              <div className="stat-label">Crecimiento</div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-icon">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="stat-value">4.8/5</div>
              <div className="stat-label">Satisfacción</div>
            </div>

            <div className="stat-card stat-card-danger">
              <div className="stat-icon">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="stat-value">24%</div>
              <div className="stat-label">ROI</div>
            </div>
          </div>

          {/* Panel de métricas avanzadas */}
          <div className="unified-card">
            <div className="unified-card-header">
              <h2 className="unified-card-title">
                <BarChart3 className="h-5 w-5" />
                Métricas Avanzadas
              </h2>
            </div>
            <div className="unified-card-content">
              <p className="text-slate-600">
                Panel de estadísticas avanzadas disponible solo para administradores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RoleRedirect>
  );
}
