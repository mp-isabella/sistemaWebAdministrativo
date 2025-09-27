'use client';

import { AlertCircle, CheckCircle, Database } from 'lucide-react';
import { useState } from 'react';

export default function DatabaseSetupPage() {
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSetupDatabase = async () => {
        setIsConfiguring(true);
        try {
            const response = await fetch('/api/setup-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: 'Error conectando con el servidor'
            });
        } finally {
            setIsConfiguring(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Configuración de Base de Datos
                    </h1>
                    <p className="text-gray-600">
                        Configura la base de datos para que el sistema funcione correctamente
                    </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900 mb-2">
                                Error de Conexión a Base de Datos
                            </h3>
                            <p className="text-red-700 text-sm mb-3">
                                El sistema no puede conectarse a la base de datos. Esto es normal en el primer despliegue.
                            </p>
                            <p className="text-red-700 text-sm">
                                <strong>Solución:</strong> Configura la variable de entorno DATABASE_URL en Vercel.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            📋 Pasos para Solucionar
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full mr-3 mt-1">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Crear Base de Datos</h3>
                                    <p className="text-sm text-gray-600">
                                        Ve a tu proyecto en Vercel Dashboard → Storage → Create Database → PostgreSQL
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full mr-3 mt-1">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Configurar Variables de Entorno</h3>
                                    <p className="text-sm text-gray-600">
                                        Settings → Environment Variables → Agregar DATABASE_URL
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full mr-3 mt-1">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Configurar Base de Datos</h3>
                                    <p className="text-sm text-gray-600">
                                        Una vez configurada la DATABASE_URL, haz clic en el botón de abajo
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            🚀 Configuración Automática
                        </h3>
                        <p className="text-blue-700 text-sm mb-4">
                            Una vez que hayas configurado la DATABASE_URL en Vercel, haz clic en el botón para configurar automáticamente las tablas y datos iniciales.
                        </p>

                        <button
                            onClick={handleSetupDatabase}
                            disabled={isConfiguring}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isConfiguring ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    <Database className="h-4 w-4 mr-2" />
                                    Configurar Base de Datos
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div className={`border rounded-lg p-4 ${result.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-start">
                                {result.success ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                                )}
                                <div>
                                    <h3 className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'
                                        } mb-2`}>
                                        {result.success ? '✅ Configuración Exitosa' : '❌ Error en Configuración'}
                                    </h3>

                                    {result.success ? (
                                        <div>
                                            <p className="text-green-700 text-sm mb-3">
                                                La base de datos se ha configurado correctamente. Ahora puedes hacer login con:
                                            </p>
                                            <div className="bg-white rounded p-3 text-sm">
                                                <p><strong>👑 Administrador:</strong> admin@amestica.cl / admin123</p>
                                                <p><strong>📝 Secretaria:</strong> secretaria@amestica.cl / secretaria123</p>
                                                <p><strong>🔧 Técnico:</strong> tecnico@amestica.cl / tecnico123</p>
                                            </div>
                                            <a
                                                href="/login"
                                                className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                            >
                                                Ir al Login
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-red-700 text-sm">
                                            {result.error || 'Error desconocido'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            📚 Opciones de Base de Datos
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Vercel PostgreSQL:</strong> Gratuito, integrado con Vercel</p>
                            <p><strong>Supabase:</strong> Gratuito, fácil de configurar</p>
                            <p><strong>Railway:</strong> Gratuito, PostgreSQL en la nube</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
