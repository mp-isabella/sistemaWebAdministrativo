'use client';

import React from 'react';
import { QuickNavigation } from './quick-navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function SimpleDashboard() {
  const { stats, loading, error, retry } = useDashboardStats();

  if (loading) {
    return (
      <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600 mr-2" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Cargando Dashboard...
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Obteniendo estadísticas del sistema
          </p>
        </div>
        <QuickNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-2" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Error al cargar estadísticas
            </h1>
          </div>
          <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">
            {error}
          </p>
          <button
            onClick={retry}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Reintentar
          </button>
        </div>
        <QuickNavigation />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Estadísticas principales */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8 text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Dashboard Administrativo
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Sistema funcionando correctamente
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Trabajos</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {stats?.overview.totalJobs || 0}
            </p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 text-sm sm:text-base">Clientes</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {stats?.overview.totalClients || 0}
            </p>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Técnicos</h3>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {stats?.overview.totalWorkers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <QuickNavigation />
    </div>
  );
}
