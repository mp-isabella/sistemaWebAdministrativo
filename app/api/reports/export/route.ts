import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria", "ADMIN", "SECRETARIA"].includes(session.user.role)) {
      return NextResponse.json({ error: "Sin permisos para exportar reportes" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "general"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const clientId = searchParams.get("clientId")
    const technicianId = searchParams.get("technicianId")
    const company = searchParams.get("company")

    // Construir filtros
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    
    if (clientId) {
      where.clientId = clientId
    }
    
    if (technicianId && technicianId !== "all") {
      where.technicianId = technicianId
    }

    // Filtro por empresa (a través del servicio)
    if (company && company !== "all") {
      const companyMap: { [key: string]: string } = {
        "amestica": "Amestica",
        "multifugas": "Multifugas", 
        "servifugas": "Servifugas"
      }
      where.service = {
        name: companyMap[company]
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Generar contenido del PDF
    const companyName = company && company !== "all" ? 
      (company === "amestica" ? "Améstica Ltda" : 
       company === "multifugas" ? "Multifugas" : 
               company === "servifugas" ? "Servifugas" : "Amestica") : 
      "Todas las empresas"

    // Generar HTML para el reporte
    const html = generateReportHTML(jobs, companyName, type, startDate, endDate)

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="reporte-${type}-${new Date().toISOString().split("T")[0]}.html"`,
      },
    })

  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 })
  }
}

function generateReportHTML(jobs: any[], companyName: string, type: string, startDate?: string | null, endDate?: string | null) {
  const totalJobs = jobs.length
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED').length
  const pendingJobs = jobs.filter(job => job.status === 'PENDING').length
  const inProgressJobs = jobs.filter(job => job.status === 'IN_PROGRESS').length
  const totalRevenue = jobs.reduce((sum, job) => sum + (job.service?.price || job.cost || 0), 0)
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0

  // Estadísticas adicionales
  const uniqueClients = new Set(jobs.map(job => job.client?.name)).size
  const uniqueTechnicians = new Set(jobs.map(job => job.technician?.name).filter(Boolean)).size
  const averageRevenue = totalJobs > 0 ? Math.round(totalRevenue / totalJobs) : 0

  // Análisis por empresa/servicio
  const serviceStats = jobs.reduce((acc: any, job) => {
    const serviceName = job.service?.name || 'Sin servicio'
    if (!acc[serviceName]) {
      acc[serviceName] = { count: 0, revenue: 0, completed: 0 }
    }
    acc[serviceName].count++
    acc[serviceName].revenue += job.service?.price || 0
    if (job.status === 'COMPLETED') {
      acc[serviceName].completed++
    }
    return acc
  }, {})

  // Análisis por técnico
  const technicianStats = jobs.reduce((acc: any, job) => {
    const techName = job.technician?.name || 'Sin asignar'
    if (!acc[techName]) {
      acc[techName] = { 
        count: 0, 
        revenue: 0, 
        completed: 0, 
        pending: 0, 
        inProgress: 0,
        avgCompletionTime: 0,
        totalCompletionTime: 0,
        completedJobs: []
      }
    }
    acc[techName].count++
    acc[techName].revenue += job.service?.price || 0
    
    if (job.status === 'COMPLETED') {
      acc[techName].completed++
      if (job.completedAt && job.scheduledAt) {
        const completionTime = new Date(job.completedAt).getTime() - new Date(job.scheduledAt).getTime()
        acc[techName].totalCompletionTime += completionTime
        acc[techName].completedJobs.push(completionTime)
      }
    } else if (job.status === 'PENDING') {
      acc[techName].pending++
    } else if (job.status === 'IN_PROGRESS') {
      acc[techName].inProgress++
    }
    return acc
  }, {})

  // Calcular tiempo promedio de completación por técnico
  Object.keys(technicianStats).forEach(tech => {
    if (technicianStats[tech].completed > 0) {
      technicianStats[tech].avgCompletionTime = Math.round(technicianStats[tech].totalCompletionTime / technicianStats[tech].completed / (1000 * 60 * 60)) // en horas
    }
  })

  // Análisis por cliente
  const clientStats = jobs.reduce((acc: any, job) => {
    const clientName = job.client?.name || 'Cliente no especificado'
    if (!acc[clientName]) {
      acc[clientName] = { 
        count: 0, 
        revenue: 0, 
        completed: 0,
        lastService: null,
        firstService: null
      }
    }
    acc[clientName].count++
    acc[clientName].revenue += job.service?.price || 0
    if (job.status === 'COMPLETED') {
      acc[clientName].completed++
    }
    
    const jobDate = job.scheduledAt || job.createdAt
    if (jobDate) {
      if (!acc[clientName].lastService || new Date(jobDate) > new Date(acc[clientName].lastService)) {
        acc[clientName].lastService = jobDate
      }
      if (!acc[clientName].firstService || new Date(jobDate) < new Date(acc[clientName].firstService)) {
        acc[clientName].firstService = jobDate
      }
    }
    return acc
  }, {})

  // Obtener nombres descriptivos de empresas
  const getCompanyDisplayName = (company: string) => {
    const companyMap: { [key: string]: string } = {
      "amestica": "🔧 Améstica Ltda - Diagnóstico de Redes",
      "multifugas": "💧 Multifugas - Detección Especializada", 
      "servifugas": "🔍 Servifugas - Revisión Domiciliaria"
    }
    return companyMap[company] || company
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReportTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      "general": "Reporte General de Operaciones",
      "revenue": "Reporte Financiero",
      "technicians": "Reporte de Rendimiento de Técnicos",
      "clients": "Reporte de Análisis de Clientes",
      "services": "Reporte de Servicios"
    }
    return titles[type] || "Reporte"
  }

  const generateSpecificContent = () => {
    switch (type) {
      case "revenue":
        return `
          <div class="stats-section">
            <h3>💰 Análisis Financiero</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <h4>Ingresos Totales</h4>
                <p>${formatCurrency(totalRevenue)}</p>
              </div>
              <div class="stat-item">
                <h4>Ingreso Promedio por Trabajo</h4>
                <p>${formatCurrency(averageRevenue)}</p>
              </div>
              <div class="stat-item">
                <h4>Ingresos por Empresa</h4>
                ${Object.entries(serviceStats).map(([service, data]: [string, any]) => `
                  <p><strong>${service}:</strong> ${formatCurrency(data.revenue)}</p>
                `).join('')}
              </div>
            </div>
          </div>
        `
      
      case "technicians":
        return `
          <div class="stats-section">
            <h3>👨‍🔧 Rendimiento de Técnicos</h3>
            <div class="stats-grid">
              ${Object.entries(technicianStats).map(([tech, data]: [string, any]) => `
                <div class="stat-item">
                  <h4>${tech}</h4>
                  <p><strong>Trabajos:</strong> ${data.count}</p>
                  <p><strong>Completados:</strong> ${data.completed}</p>
                  <p><strong>Pendientes:</strong> ${data.pending}</p>
                  <p><strong>En Progreso:</strong> ${data.inProgress}</p>
                  <p><strong>Ingresos:</strong> ${formatCurrency(data.revenue)}</p>
                  <p><strong>Tiempo Promedio:</strong> ${data.avgCompletionTime}h</p>
                </div>
              `).join('')}
            </div>
          </div>
        `
      
      case "clients":
        return `
          <div class="stats-section">
            <h3>🏢 Análisis de Clientes</h3>
            <div class="stats-grid">
              ${Object.entries(clientStats).map(([client, data]: [string, any]) => `
                <div class="stat-item">
                  <h4>${client}</h4>
                  <p><strong>Trabajos:</strong> ${data.count}</p>
                  <p><strong>Completados:</strong> ${data.completed}</p>
                  <p><strong>Ingresos:</strong> ${formatCurrency(data.revenue)}</p>
                  <p><strong>Primer Servicio:</strong> ${data.firstService ? formatDate(data.firstService) : 'N/A'}</p>
                  <p><strong>Último Servicio:</strong> ${data.lastService ? formatDate(data.lastService) : 'N/A'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `
      
      default:
        return `
          <div class="stats-section">
            <h3>📊 Métricas Operativas</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <h4>Total de Trabajos</h4>
                <p>${totalJobs}</p>
              </div>
              <div class="stat-item">
                <h4>Trabajos Completados</h4>
                <p>${completedJobs}</p>
              </div>
              <div class="stat-item">
                <h4>Trabajos Pendientes</h4>
                <p>${pendingJobs}</p>
              </div>
              <div class="stat-item">
                <h4>Trabajos en Progreso</h4>
                <p>${inProgressJobs}</p>
              </div>
              <div class="stat-item">
                <h4>Tasa de Completación</h4>
                <p>${completionRate}%</p>
              </div>
              <div class="stat-item">
                <h4>Ingresos Totales</h4>
                <p>${formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        `
    }
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getReportTitle(type)} - ${companyName}</title>
    <style>
        @media print {
            body { 
                margin: 0; 
                padding: 5px;
                font-size: 8px;
            }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
            .container { 
                max-width: none; 
                margin: 0; 
                box-shadow: none;
            }
            .header { 
                padding: 10px; 
                margin-bottom: 10px;
            }
            .header h1 { font-size: 1.2rem; }
            .header-subtitle { font-size: 0.8rem; }
            .header-info { margin-top: 8px; }
            .header-item { 
                min-width: 120px; 
                margin: 2px; 
            }
            .header-item strong { font-size: 0.7rem; }
            .content { padding: 10px; }
            .stats-section { 
                margin: 10px 0; 
                padding: 8px; 
            }
            .stats-section h3 { 
                font-size: 0.9rem; 
                margin-bottom: 6px; 
            }
            .jobs-section { margin-top: 15px; }
            .jobs-title { 
                font-size: 1rem; 
                margin-bottom: 8px; 
                padding-bottom: 4px; 
            }
            .jobs-table th,
            .jobs-table td { 
                padding: 3px 4px; 
                font-size: 7px; 
            }
            .stat-item { 
                padding: 6px; 
                margin-bottom: 4px; 
            }
            .stat-item h4 { 
                font-size: 0.8rem; 
                margin-bottom: 3px; 
            }
            .stat-item p { 
                font-size: 0.7rem; 
                margin: 1px 0; 
            }
            .stats-grid { 
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                gap: 6px; 
            }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 10px;
            background: white;
            color: black;
            line-height: 1.2;
            font-size: 10px;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
            background: white;
            color: black;
            padding: 15px;
            text-align: center;
            border-bottom: 2px solid #333;
        }
        
        .header h1 {
            margin: 0 0 6px 0;
            font-size: 1.3rem;
            font-weight: bold;
            color: black;
        }
        
        .header-subtitle {
            font-size: 0.9rem;
            color: #333;
            margin-bottom: 10px;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        
        .header-item {
            flex: 1;
            min-width: 120px;
            margin: 2px;
        }
        
        .header-item strong {
            display: block;
            font-size: 0.7rem;
            margin-bottom: 2px;
            color: #333;
        }
        
        .content {
            padding: 15px;
            background: white;
            color: black;
        }
        
        .stats-section {
            margin: 15px 0;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #333;
        }
        
        .stats-section h3 {
            margin: 0 0 8px 0;
            color: black;
            font-size: 1rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 8px;
        }
        
        .stat-item {
            background: white;
            padding: 8px;
            border-radius: 3px;
            border: 1px solid #333;
            color: black;
        }
        
        .stat-item h4 {
            margin: 0 0 6px 0;
            color: black;
            font-size: 0.8rem;
        }
        
        .stat-item p {
            margin: 2px 0;
            font-size: 0.7rem;
            color: black;
        }
        
        .jobs-section {
            margin-top: 20px;
        }
        
        .jobs-title {
            font-size: 1.1rem;
            font-weight: bold;
            color: black;
            margin-bottom: 12px;
            border-bottom: 2px solid #333;
            padding-bottom: 6px;
        }
        
        .jobs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        
        .jobs-table th,
        .jobs-table td {
            border: 1px solid #333;
            padding: 5px 6px;
            text-align: left;
            font-size: 0.7rem;
            color: black;
        }
        
        .jobs-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: black;
        }
        
        .jobs-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-completed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-progress {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: bold;
            z-index: 1000;
            border-radius: 4px;
        }
        
        .print-button:hover {
            background: #555;
        }
        
        @media (max-width: 768px) {
            .header-info { flex-direction: column; }
            .header-item { min-width: auto; }
            .jobs-table { font-size: 0.8rem; }
            .jobs-table th, .jobs-table td { padding: 6px; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Imprimir PDF</button>
    
    <div class="container">
        <div class="header">
            <h1>${getReportTitle(type).toUpperCase()}</h1>
            <div class="header-subtitle">${companyName}</div>
            <div class="header-info">
                <div class="header-item">
                    <strong>Período</strong>
                    ${startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Todos los períodos'}
                </div>
                <div class="header-item">
                    <strong>Total de Trabajos</strong>
                    ${totalJobs}
                </div>
                <div class="header-item">
                    <strong>Ingresos Totales</strong>
                    ${formatCurrency(totalRevenue)}
                </div>
                <div class="header-item">
                    <strong>Tasa de Completación</strong>
                    ${completionRate}%
                </div>
            </div>
        </div>
        
        <div class="content">
            ${generateSpecificContent()}
            
            <div class="jobs-section">
                <h2 class="jobs-title">Detalle de Trabajos</h2>
                <table class="jobs-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Servicio</th>
                            <th>Técnico</th>
                            <th>Estado</th>
                            <th>Fecha Programada</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${jobs.map((job: any) => `
                            <tr>
                                <td>${job.client?.name || 'N/A'}</td>
                                <td>${job.service?.name || 'N/A'}</td>
                                <td>${job.technician?.name || 'Sin asignar'}</td>
                                <td>
                                    ${job.status === 'COMPLETED' ? 'Completado' : 
                                      job.status === 'PENDING' ? 'Pendiente' : 
                                      job.status === 'IN_PROGRESS' ? 'En Progreso' : job.status}
                                </td>
                                <td>${job.scheduledAt ? formatDate(job.scheduledAt) : 'No programada'}</td>
                                <td>${formatCurrency(job.service?.price || 0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
    `
}
