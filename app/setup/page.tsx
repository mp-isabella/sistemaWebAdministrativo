"use client";

import { useState } from 'react';

export default function SetupPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const setupDatabase = async () => {
        setLoading(true);
        setResult(null);

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
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Configuración de Base de Datos
                    </h1>
                    <p className="text-gray-600">
                        Configura los datos iniciales para el sistema
                    </p>
                </div>

                {!result && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">¿Qué hace esto?</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Crea los roles: Administrador, Secretaria, Técnico</li>
                                <li>• Crea las empresas: Amestica Ltda, Multifugas, Servifugas</li>
                                <li>• Crea usuarios con credenciales de acceso</li>
                                <li>• Configura servicios básicos</li>
                            </ul>
                        </div>

                        <button
                            onClick={setupDatabase}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Configurando...' : 'Configurar Base de Datos'}
                        </button>
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        {result.success ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                    <h3 className="font-semibold text-green-900">¡Configuración Exitosa!</h3>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-green-800 text-sm">
                                        La base de datos ha sido configurada correctamente.
                                    </p>

                                    <div className="bg-white border border-green-200 rounded p-3">
                                        <h4 className="font-semibold text-gray-900 mb-2">Credenciales de Acceso:</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Administrador:</span>
                                                <span className="text-gray-600">{result.credentials?.admin}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Secretaria:</span>
                                                <span className="text-gray-600">{result.credentials?.secretaria}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Técnico:</span>
                                                <span className="text-gray-600">{result.credentials?.tecnico}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-green-200">
                                        <a
                                            href="/login"
                                            className="inline-block w-full bg-green-600 text-white text-center py-2 px-4 rounded-lg font-semibold hover:bg-green-700"
                                        >
                                            Ir al Login
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-white text-sm">✗</span>
                                    </div>
                                    <h3 className="font-semibold text-red-900">Error en la Configuración</h3>
                                </div>

                                <p className="text-red-800 text-sm mb-3">
                                    {result.error || 'Error desconocido'}
                                </p>

                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setupDatabase();
                                    }}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700"
                                >
                                    Intentar Nuevamente
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        ← Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    );
}
