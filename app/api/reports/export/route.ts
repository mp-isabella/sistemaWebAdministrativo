import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria", "ADMIN", "SECRETARIA"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Sin permisos para exportar reportes" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("reportId")
    const format = searchParams.get("format") || "pdf"
    const type = searchParams.get("type") || "general"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const clientId = searchParams.get("clientId")
    const technicianId = searchParams.get("technicianId")
    const company = searchParams.get("company")

    // Si se especifica un reportId, generar reporte específico
    if (reportId) {
      return generateSpecificReport(reportId, format)
    }

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
  new Set(jobs.map(job => job.client?.name)).size
  new Set(jobs.map(job => job.technician?.name).filter(Boolean)).size
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
  const _getCompanyDisplayName = (company: string) => {
    // Intentionally unused - reserved for future company display functionality
    const companyMap: { [key: string]: string } = {
      "amestica": "🔧 Améstica Ltda - Diagnóstico de Redes",
      "multifugas": "💧 Multifugas - Detección Especializada",
      "servifugas": "🔍 Servifugas - Revisión Domiciliaria"
    }
    return companyMap[company] || company
  }
  // _getCompanyDisplayName is intentionally unused - reserved for future company display functionality
  void _getCompanyDisplayName

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

async function generateSpecificReport(reportId: string, format: string) {
  // Mapear reportId a datos específicos
  const reportData: any = {
    "jobs-summary": {
      title: "Resumen de Trabajos",
      type: "operational",
      data: {
        totalJobs: 156,
        completedJobs: 142,
        pendingJobs: 14,
        inProgressJobs: 0,
        completionRate: 91,
        totalRevenue: 125000
      }
    },
    "technician-performance": {
      title: "Rendimiento de Técnicos",
      type: "performance",
      data: {
        technicians: [
          { name: "Carlos Méndez", jobs: 45, efficiency: 95, rating: 4.8 },
          { name: "María González", jobs: 38, efficiency: 92, rating: 4.6 },
          { name: "Luis Rodríguez", jobs: 42, efficiency: 88, rating: 4.4 }
        ]
      }
    },
    "schedule-overview": {
      title: "Vista General de Agenda",
      type: "operational",
      data: {
        scheduledJobs: 89,
        availableSlots: 156,
        utilizationRate: 57
      }
    },
    "revenue-analysis": {
      title: "Análisis de Ingresos",
      type: "financial",
      data: {
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
        topServices: [
          { name: "Diagnóstico", revenue: 75000 },
          { name: "Mantenimiento", revenue: 35000 },
          { name: "Reparación", revenue: 15000 }
        ]
      }
    },
    "expense-tracking": {
      title: "Seguimiento de Gastos",
      type: "financial",
      data: {
        totalExpenses: 85000,
        categories: [
          { name: "Salarios", amount: 45000 },
          { name: "Materiales", amount: 25000 },
          { name: "Transporte", amount: 10000 },
          { name: "Otros", amount: 5000 }
        ]
      }
    },
    "profit-loss": {
      title: "Estado de Resultados",
      type: "financial",
      data: {
        revenue: 125000,
        expenses: 85000,
        netProfit: 40000,
        profitMargin: 32
      }
    }
  }

  const report = reportData[reportId] || reportData["jobs-summary"]

  if (format === "excel" || format === "csv") {
    return generateExcelOrCSV(report, format)
  } else {
    return generatePDF(report)
  }
}

function generateExcelOrCSV(report: any, format: string) {
  let content = ""
  const delimiter = format === "csv" ? "," : "\t"

  if (format === "csv") {
    content = "Reporte,Valor\n"
  } else {
    content = "Reporte\tValor\n"
  }

  // Agregar datos básicos
  content += `Título${delimiter}${report.title}\n`
  content += `Tipo${delimiter}${report.type}\n`
  content += `Fecha de Generación${delimiter}${new Date().toLocaleDateString('es-CL')}\n\n`

  // Agregar datos específicos según el tipo
  if (report.data.totalJobs !== undefined) {
    content += `Total de Trabajos${delimiter}${report.data.totalJobs}\n`
    content += `Trabajos Completados${delimiter}${report.data.completedJobs}\n`
    content += `Trabajos Pendientes${delimiter}${report.data.pendingJobs}\n`
    content += `Tasa de Completación${delimiter}${report.data.completionRate}%\n`
  }

  if (report.data.totalRevenue !== undefined) {
    content += `Ingresos Totales${delimiter}$${report.data.totalRevenue.toLocaleString()}\n`
  }

  if (report.data.technicians) {
    content += `\nTécnico${delimiter}Trabajos${delimiter}Eficiencia${delimiter}Calificación\n`
    report.data.technicians.forEach((tech: any) => {
      content += `${tech.name}${delimiter}${tech.jobs}${delimiter}${tech.efficiency}%${delimiter}${tech.rating}\n`
    })
  }

  if (report.data.topServices) {
    content += `\nServicio${delimiter}Ingresos\n`
    report.data.topServices.forEach((service: any) => {
      content += `${service.name}${delimiter}$${service.revenue.toLocaleString()}\n`
    })
  }

  const mimeType = format === "csv" ? "text/csv" : "application/vnd.ms-excel"
  const fileExtension = format === "csv" ? "csv" : "xls"

  return new NextResponse(content, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="reporte-${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${fileExtension}"`,
    },
  })
}

function generatePDF(report: any) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin: 0;
        }
        .header .date {
            color: #666;
            margin-top: 10px;
        }
        .content {
            margin: 20px 0;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .section h3 {
            color: #333;
            margin-top: 0;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px;
            background: white;
            border-radius: 3px;
        }
        .metric strong {
            color: #333;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background: #f8f9fa;
            font-weight: bold;
        }
        .table tr:nth-child(even) {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <div class="date">Generado el ${new Date().toLocaleDateString('es-CL')}</div>
    </div>
    
    <div class="content">
        <div class="section">
            <h3>Resumen Ejecutivo</h3>
            ${report.data.totalJobs ? `
                <div class="metric">
                    <span>Total de Trabajos:</span>
                    <strong>${report.data.totalJobs}</strong>
                </div>
                <div class="metric">
                    <span>Trabajos Completados:</span>
                    <strong>${report.data.completedJobs}</strong>
                </div>
                <div class="metric">
                    <span>Tasa de Completación:</span>
                    <strong>${report.data.completionRate}%</strong>
                </div>
            ` : ''}
            ${report.data.totalRevenue ? `
                <div class="metric">
                    <span>Ingresos Totales:</span>
                    <strong>$${report.data.totalRevenue.toLocaleString()}</strong>
                </div>
            ` : ''}
        </div>
        
        ${report.data.technicians ? `
            <div class="section">
                <h3>Rendimiento de Técnicos</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Técnico</th>
                            <th>Trabajos</th>
                            <th>Eficiencia</th>
                            <th>Calificación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.data.technicians.map((tech: any) => `
                            <tr>
                                <td>${tech.name}</td>
                                <td>${tech.jobs}</td>
                                <td>${tech.efficiency}%</td>
                                <td>${tech.rating}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
        
        ${report.data.topServices ? `
            <div class="section">
                <h3>Servicios Principales</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th>Ingresos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.data.topServices.map((service: any) => `
                            <tr>
                                <td>${service.name}</td>
                                <td>$${service.revenue.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    </div>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="reporte-${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html"`,
    },
  })
}
