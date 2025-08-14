'use client';

import { RoleRedirect } from '@/components/auth/role-redirect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <RoleRedirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Estadísticas y Analytics
          </h1>
          <p className="text-gray-600">
            Panel avanzado de métricas y análisis del negocio
          </p>
        </div>

        {/* Tarjetas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Productividad
                  </p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Crecimiento
                  </p>
                  <p className="text-2xl font-bold text-gray-900">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Satisfacción
                  </p>
                  <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">24%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel extra */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Avanzadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Panel de estadísticas avanzadas disponible solo para administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleRedirect>
  );
}
