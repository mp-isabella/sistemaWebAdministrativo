'use client';

import { Briefcase, Calendar, FileText, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function EmptyDashboard() {
    return (
        <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8 text-center">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    🎉 ¡Bienvenido al Sistema!
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Tu sistema está listo para usar. Comienza agregando tus primeros datos.
                </p>

                {/* Estadísticas vacías */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Trabajos</h3>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-semibold text-green-900 text-sm sm:text-base">Clientes</h3>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">0</p>
                    </div>
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Técnicos</h3>
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">0</p>
                    </div>
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-900 text-sm sm:text-base">Servicios</h3>
                        <p className="text-xl sm:text-2xl font-bold text-orange-600">0</p>
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    🚀 Comienza aquí
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <Link
                        href="/dashboard/workers"
                        className="flex items-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Agregar Técnicos</h3>
                            <p className="text-xs sm:text-sm text-blue-700">Registra tu personal técnico</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/clients"
                        className="flex items-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-green-900 text-sm sm:text-base">Agregar Clientes</h3>
                            <p className="text-xs sm:text-sm text-green-700">Registra tus clientes</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/services"
                        className="flex items-center p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Configurar Servicios</h3>
                            <p className="text-xs sm:text-sm text-purple-700">Define tus servicios</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/calendar"
                        className="flex items-center p-3 sm:p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-orange-900 text-sm sm:text-base">Ver Calendario</h3>
                            <p className="text-xs sm:text-sm text-orange-700">Gestiona tus citas</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/quotes"
                        className="flex items-center p-3 sm:p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-indigo-900 text-sm sm:text-base">Cotizaciones</h3>
                            <p className="text-xs sm:text-sm text-indigo-700">Crea cotizaciones</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className="flex items-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Configuración</h3>
                            <p className="text-xs sm:text-sm text-gray-700">Ajusta el sistema</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Estado del sistema */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                        <h3 className="font-semibold text-green-900 text-sm sm:text-base">Sistema Operativo</h3>
                        <p className="text-xs sm:text-sm text-green-700">
                            El sistema está funcionando correctamente. No hay errores de conexión.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
