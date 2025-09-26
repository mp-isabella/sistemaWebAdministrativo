"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Building, Calendar, CheckCircle, Clock, DollarSign, User, Wrench } from "lucide-react"
import { useEffect, useState } from "react"

interface TestJob {
    title: string
    description: string
    serviceName: string
    priority: "HIGH" | "MEDIUM" | "LOW"
    totalBudget?: number
    totalWorkAmount?: number
    scheduledAt: Date
    startTime: string
    endTime: string
}

const testJobs: TestJob[] = [
    {
        title: "Detección de fugas de agua",
        description: "Revisión completa del sistema de agua para detectar posibles fugas en la propiedad del cliente",
        serviceName: "Detección de fugas de agua",
        priority: "HIGH",
        totalBudget: 150000,
        totalWorkAmount: 180000,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        startTime: "09:00",
        endTime: "11:00"
    },
    {
        title: "Destape de alcantarillado",
        description: "Servicio de destape y limpieza del sistema de alcantarillado",
        serviceName: "Destape de alcantarillado",
        priority: "MEDIUM",
        totalBudget: 80000,
        totalWorkAmount: 95000,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        startTime: "14:00",
        endTime: "16:00"
    },
    {
        title: "Video inspección de ductos",
        description: "Inspección con cámara de video de los ductos de alcantarillado",
        serviceName: "Video inspección de ductos",
        priority: "LOW",
        totalBudget: 120000,
        totalWorkAmount: 140000,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: "10:00",
        endTime: "12:00"
    },
    {
        title: "Reparación de grifo",
        description: "Reparación completa del grifo de la cocina que tiene fuga constante",
        serviceName: "Reparación de grifo",
        priority: "HIGH",
        totalBudget: 45000,
        totalWorkAmount: 55000,
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        startTime: "08:00",
        endTime: "10:00"
    },
    {
        title: "Instalación de medidor de agua",
        description: "Instalación de nuevo medidor de agua en propiedad residencial",
        serviceName: "Instalación de medidor de agua",
        priority: "MEDIUM",
        totalBudget: 200000,
        totalWorkAmount: 250000,
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startTime: "13:00",
        endTime: "15:00"
    },
    {
        title: "Mantenimiento preventivo",
        description: "Mantenimiento preventivo del sistema de agua y alcantarillado",
        serviceName: "Mantenimiento preventivo",
        priority: "LOW",
        totalBudget: 100000,
        totalWorkAmount: 120000,
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        startTime: "16:00",
        endTime: "18:00"
    },
    {
        title: "Emergencia nocturna",
        description: "Servicio de emergencia para fuga de agua en horario nocturno",
        serviceName: "Servicio de emergencia",
        priority: "HIGH",
        totalBudget: 300000,
        totalWorkAmount: 350000,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: "18:00",
        endTime: "19:00"
    },
    {
        title: "Limpieza de tanque",
        description: "Limpieza y desinfección de tanque de agua",
        serviceName: "Limpieza de tanque",
        priority: "MEDIUM",
        totalBudget: 180000,
        totalWorkAmount: 220000,
        scheduledAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        startTime: "11:00",
        endTime: "13:00"
    }
]

export default function TestJobsPage() {
    const [isCreating, setIsCreating] = useState(false)
    const [isCleaning, setIsCleaning] = useState(false)
    const [results, setResults] = useState<{
        created: number
        failed: number
        total: number
    } | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationResults, setVerificationResults] = useState<any>(null)
    const [clients, setClients] = useState<any[]>([])
    const [companies] = useState([
        { id: "domestica", name: "Empresa Doméstica" },
        { id: "ltda", name: "LTDA" },
        { id: "multifugas", name: "Multifugas" },
        { id: "servifugas", name: "Servifugas" }
    ])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        try {
            const response = await fetch('/api/clients')
            const clientsData = await response.json()
            setClients(clientsData || [])
        } catch (error) {
            console.error('Error cargando clientes:', error)
        } finally {
            setLoading(false)
        }
    }

    const createTestJobs = async () => {
        if (clients.length === 0) {
            alert('No hay clientes disponibles. Crea al menos un cliente primero.')
            return
        }

        setIsCreating(true)
        setResults(null)

        let createdJobs = 0
        let failedJobs = 0

        try {
            for (let i = 0; i < testJobs.length; i++) {
                const jobData = testJobs[i]
                if (!jobData) continue

                // Seleccionar cliente aleatorio
                const randomClient = clients[Math.floor(Math.random() * clients.length)]
                if (!randomClient) continue

                // Seleccionar empresa aleatoria
                const randomCompany = companies[Math.floor(Math.random() * companies.length)]
                if (!randomCompany) continue
                try {
                    const response = await fetch('/api/jobs', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: jobData.title,
                            description: jobData.description,
                            serviceName: jobData.serviceName,
                            clientId: randomClient.id,
                            companyId: randomCompany.id,
                            technicianId: null, // Sin técnico asignado
                            scheduledAt: jobData.scheduledAt.toISOString(),
                            startTime: jobData.startTime,
                            endTime: jobData.endTime,
                            priority: jobData.priority,
                            totalBudget: jobData.totalBudget,
                            totalWorkAmount: jobData.totalWorkAmount
                        })
                    })

                    if (response.ok) {
                        createdJobs++
                    } else {
                        const error = await response.json()
                        console.error(`❌ Error creando trabajo ${jobData.title}:`, error)
                        failedJobs++
                    }
                } catch (error) {
                    console.error(`❌ Error en la creación del trabajo ${jobData.title}:`, error)
                    failedJobs++
                }

                // Pequeña pausa entre creaciones
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            setResults({
                created: createdJobs,
                failed: failedJobs,
                total: testJobs.length
            })

        } catch (error) {
            console.error('Error general:', error)
        } finally {
            setIsCreating(false)
        }
    }

    const cleanupTestJobs = async () => {
        setIsCleaning(true)

        try {
            const response = await fetch('/api/jobs')
            const jobs = await response.json()

            const testJobTitles = testJobs.map(job => job.title)
            const testJobsToDelete = jobs.filter((job: any) => testJobTitles.includes(job.title))
            let deletedCount = 0

            for (const job of testJobsToDelete) {
                try {
                    const deleteResponse = await fetch(`/api/jobs?id=${job.id}`, {
                        method: 'DELETE'
                    })

                    if (deleteResponse.ok) {
                        deletedCount++
                    } else {
                    }
                } catch (error) {
                    console.error(`❌ Error eliminando trabajo ${job.title}:`, error)
                }
            }

            alert(`Se eliminaron ${deletedCount} trabajos de prueba`)

        } catch (error) {
            console.error('Error en la limpieza:', error)
            alert('Error durante la limpieza')
        } finally {
            setIsCleaning(false)
        }
    }

    const verifyTestJobs = async () => {
        setIsVerifying(true)
        setVerificationResults(null)

        try {
            // Verificar trabajos en el calendario
            const jobsResponse = await fetch('/api/jobs')
            const jobs = await jobsResponse.json()

            const testJobTitles = testJobs.map(job => job.title)
            const foundTestJobs = jobs.filter((job: any) => testJobTitles.includes(job.title))

            // Verificar clientes
            const clientsResponse = await fetch('/api/clients')
            const clients = await clientsResponse.json()

            // Verificar trabajadores
            const workersResponse = await fetch('/api/workers')
            const workers = await workersResponse.json()

            const verification = {
                success: true,
                totalJobs: jobs?.length || 0,
                testJobsFound: foundTestJobs.length,
                expectedTestJobs: testJobTitles.length,
                totalClients: clients?.length || 0,
                totalWorkers: workers?.workers?.length || 0,
                pendingJobs: jobs?.filter((job: any) => job.status === 'PENDING').length || 0,
                inProgressJobs: jobs?.filter((job: any) => job.status === 'IN_PROGRESS').length || 0,
                completedJobs: jobs?.filter((job: any) => job.status === 'COMPLETED').length || 0,
                foundJobs: foundTestJobs
            }

            setVerificationResults(verification)
        } catch (error) {
            console.error('Error en la verificación:', error)
            setVerificationResults({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' })
        } finally {
            setIsVerifying(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH': return '🔴'
            case 'MEDIUM': return '🟡'
            case 'LOW': return '🟢'
            default: return '⚪'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Cargando datos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🧪 Trabajos de Prueba
                    </h1>
                    <p className="text-lg text-gray-600">
                        Crea trabajos de prueba para verificar el funcionamiento del sistema
                    </p>
                </div>

                {/* Estado del sistema */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Clientes Disponibles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {clients.length === 0 ? 'No hay clientes' : 'Clientes activos'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Empresas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{companies.length}</div>
                            <p className="text-xs text-gray-500 mt-1">Empresas disponibles</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                Trabajos de Prueba
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{testJobs.length}</div>
                            <p className="text-xs text-gray-500 mt-1">Trabajos preparados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alertas */}
                {clients.length === 0 && (
                    <Alert className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No hay clientes disponibles. Debes crear al menos un cliente antes de crear trabajos de prueba.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Resultados */}
                {results && (
                    <Alert className={`mb-6 ${results.failed > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-semibold">
                                {results.failed === 0 ? '✅ Todos los trabajos se crearon exitosamente' : '⚠️ Algunos trabajos fallaron'}
                            </div>
                            <div className="mt-1 text-sm">
                                Creados: {results.created} | Fallidos: {results.failed} | Total: {results.total}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Resultados de verificación */}
                {verificationResults && (
                    <div className="mb-6">
                        <Alert className={`${verificationResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-semibold">
                                    {verificationResults.success ? '✅ Verificación completada' : '❌ Error en la verificación'}
                                </div>
                                {verificationResults.success ? (
                                    <div className="mt-2 space-y-1 text-sm">
                                        <div>Trabajos de prueba encontrados: {verificationResults.testJobsFound}/{verificationResults.expectedTestJobs}</div>
                                        <div>Total de trabajos en el sistema: {verificationResults.totalJobs}</div>
                                        <div>Clientes: {verificationResults.totalClients} | Trabajadores: {verificationResults.totalWorkers}</div>
                                        <div>Estados: Pendientes: {verificationResults.pendingJobs} | En progreso: {verificationResults.inProgressJobs} | Completados: {verificationResults.completedJobs}</div>
                                    </div>
                                ) : (
                                    <div className="mt-1 text-sm">
                                        Error: {verificationResults.error}
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button
                        onClick={createTestJobs}
                        disabled={isCreating || clients.length === 0}
                        className="flex-1 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
                    >
                        {isCreating ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Creando trabajos...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>🚀 Crear Trabajos de Prueba</span>
                            </div>
                        )}
                    </Button>

                    <Button
                        onClick={verifyTestJobs}
                        disabled={isVerifying}
                        variant="outline"
                        className="flex-1 h-12 text-base font-medium border-2 border-green-300 text-green-700 hover:bg-green-50"
                    >
                        {isVerifying ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                <span>Verificando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>🔍 Verificar Trabajos</span>
                            </div>
                        )}
                    </Button>

                    <Button
                        onClick={cleanupTestJobs}
                        disabled={isCleaning}
                        variant="outline"
                        className="flex-1 h-12 text-base font-medium border-2 border-red-300 text-red-700 hover:bg-red-50"
                    >
                        {isCleaning ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                <span>Limpiando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>🧹 Limpiar Trabajos de Prueba</span>
                            </div>
                        )}
                    </Button>
                </div>

                {/* Lista de trabajos de prueba */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        📋 Trabajos de Prueba Preparados
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {testJobs.map((job, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg font-semibold text-gray-900">
                                            {job.title}
                                        </CardTitle>
                                        <Badge className={`${getPriorityColor(job.priority)} text-xs font-medium`}>
                                            {getPriorityIcon(job.priority)} {job.priority}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm text-gray-600">
                                        {job.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Wrench className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">Servicio:</span>
                                        <span>{job.serviceName}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">Fecha:</span>
                                        <span>{job.scheduledAt.toLocaleDateString('es-CL')}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium">Horario:</span>
                                        <span>{job.startTime} - {job.endTime}</span>
                                    </div>

                                    {(job.totalBudget || job.totalWorkAmount) && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="font-medium">Presupuesto:</span>
                                            <span>
                                                {job.totalBudget && `$${job.totalBudget.toLocaleString('es-CL')}`}
                                                {job.totalBudget && job.totalWorkAmount && ' | '}
                                                {job.totalWorkAmount && `Total: $${job.totalWorkAmount.toLocaleString('es-CL')}`}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Enlaces de verificación */}
                {results && results.created > 0 && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            🔍 Verificar Trabajos Creados
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <a
                                href="/dashboard"
                                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                                <span className="text-blue-600">📊</span>
                                <span className="text-sm font-medium text-blue-900">Dashboard</span>
                            </a>
                            <a
                                href="/dashboard/schedule/calendar"
                                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                                <span className="text-blue-600">📅</span>
                                <span className="text-sm font-medium text-blue-900">Calendario</span>
                            </a>
                            <a
                                href="/dashboard/schedule"
                                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                                <span className="text-blue-600">📋</span>
                                <span className="text-sm font-medium text-blue-900">Lista de Trabajos</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
