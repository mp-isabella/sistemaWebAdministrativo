import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Verificar permisos: solo admin y secretaria pueden exportar cotizaciones
        if (!(session.user as any).role || !["administrador", "secretaria"].includes((session.user as any).role.toLowerCase())) {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const quoteId = searchParams.get('id')
        const status = searchParams.get('status')
        const company = searchParams.get('company')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let quotes: any[] = []

        if (quoteId) {
            // Exportar cotización específica
            const quote = await prisma.quote.findUnique({
                where: { id: quoteId },
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true,
                            company: true,
                            rut: true
                        }
                    },
                    company: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            logo: true,
                            primaryColor: true,
                            secondaryColor: true
                        }
                    },
                    items: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })

            if (!quote) {
                return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
            }

            quotes = [quote]
        } else {
            // Exportar múltiples cotizaciones con filtros
            const where: any = {}

            if (status && status !== 'all') where.status = status
            if (company && company !== 'all') where.companyId = company
            if (startDate || endDate) {
                where.date = {}
                if (startDate) where.date.gte = new Date(startDate)
                if (endDate) where.date.lte = new Date(endDate)
            }

            quotes = await prisma.quote.findMany({
                where,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true,
                            company: true,
                            rut: true
                        }
                    },
                    company: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            logo: true,
                            primaryColor: true,
                            secondaryColor: true
                        }
                    },
                    items: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        }

        if (quotes.length === 0) {
            return NextResponse.json({ error: 'No se encontraron cotizaciones con los filtros especificados' }, { status: 404 })
        }

        // Generar HTML para el reporte
        const html = generateQuotesHTML(quotes, quoteId ? 'single' : 'multiple')

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition": `attachment; filename="cotizaciones-${new Date().toISOString().split("T")[0]}.html"`,
            },
        })

    } catch (error) {

        return NextResponse.json({ error: "Error generando reporte de cotizaciones" }, { status: 500 })
    }
}

function generateQuotesHTML(quotes: any[], type: 'single' | 'multiple') {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    const getStatusLabel = (status: string) => {
        const statuses = {
            'DRAFT': 'Borrador',
            'SENT': 'Guardada',
            'ACCEPTED': 'Aceptada',
            'REJECTED': 'Rechazada',
            'EXPIRED': 'Expirada'
        }
        return statuses[status as keyof typeof statuses] || status
    }

    const getStatusColor = (status: string) => {
        const colors = {
            'DRAFT': '#6b7280',
            'SENT': '#3b82f6',
            'ACCEPTED': '#10b981',
            'REJECTED': '#ef4444',
            'EXPIRED': '#f59e0b'
        }
        return colors[status as keyof typeof colors] || '#6b7280'
    }

    if (type === 'single') {
        const quote = quotes[0]
        const companyConfig = getCompanyConfig(quote.company?.type || 'AMESTICA')

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización - ${quote.quoteNumber}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid ${companyConfig.colors.primary};
            padding-bottom: 20px;
        }
        .company-info {
            flex: 1;
        }
        .company-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: ${companyConfig.colors.primary};
            margin-bottom: 5px;
        }
        .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        .quote-title {
            text-align: right;
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .quote-subtitle {
            text-align: right;
            font-size: 14px;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${companyConfig.colors.primary};
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .client-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .info-group {
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
        }
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .services-table th,
        .services-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .services-table th {
            background-color: ${companyConfig.colors.primary};
            color: white;
            font-weight: bold;
        }
        .services-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .total-final {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
            border-top: 2px solid #ddd;
            padding-top: 10px;
        }
        .notes {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid ${companyConfig.colors.primary};
            margin-top: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: ${getStatusColor(quote.status)};
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
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
        @media print {
            .no-print { display: none; }
            body { font-size: 12px; }
            .header { margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Imprimir PDF</button>
    
    <div class="header">
        <div class="company-info">
            <img src="${companyConfig.logo}" alt="${companyConfig.name}" class="company-logo">
            <div class="company-name">${companyConfig.name}</div>
            <div class="company-details">
                RUT: ${companyConfig.rut}<br>
                ${companyConfig.address}<br>
                ${companyConfig.email}<br>
                Fono: ${companyConfig.phone}
            </div>
        </div>
        <div class="quote-info">
            <div class="quote-title">COTIZACIÓN</div>
            <div class="quote-subtitle">
                N°: ${quote.quoteNumber}<br>
                Fecha: ${formatDate(quote.date)}<br>
                Válido hasta: ${formatDate(quote.validUntil)}<br>
                Estado: <span class="status-badge">${getStatusLabel(quote.status)}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Información del Cliente</div>
        <div class="client-info">
            <div class="info-group">
                <div class="info-label">Nombre:</div>
                <div class="info-value">${quote.client?.name || quote.clientName || 'No especificado'}</div>
            </div>
            <div class="info-group">
                <div class="info-label">Email:</div>
                <div class="info-value">${quote.client?.email || quote.clientEmail || 'No especificado'}</div>
            </div>
            <div class="info-group">
                <div class="info-label">Teléfono:</div>
                <div class="info-value">${quote.client?.phone || quote.clientPhone || 'No especificado'}</div>
            </div>
            <div class="info-group">
                <div class="info-label">Dirección:</div>
                <div class="info-value">${quote.client?.address || quote.clientAddress || 'No especificada'}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Detalles del Servicio</div>
        <div class="client-info">
            <div class="info-group">
                <div class="info-label">Tipo de Servicio:</div>
                <div class="info-value">${quote.serviceType || 'No especificado'}</div>
            </div>
            <div class="info-group">
                <div class="info-label">Técnico:</div>
                <div class="info-value">${quote.technician || 'No asignado'}</div>
            </div>
            <div class="info-group">
                <div class="info-label">Diagnóstico:</div>
                <div class="info-value">${quote.diagnosis || 'No especificado'}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Servicios y Materiales</div>
        <table class="services-table">
            <thead>
                <tr>
                    <th>Descripción del Servicio</th>
                    <th>Cantidad</th>
                    <th>Precio U.</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${quote.items.map((item: any) => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row">
                <span>Neto:</span>
                <span>${formatCurrency(quote.subtotal)}</span>
            </div>
            <div class="total-row">
                <span>IVA (${quote.taxRate}%):</span>
                <span>${formatCurrency(quote.tax)}</span>
            </div>
            <div class="total-row total-final">
                <span>Total:</span>
                <span>${formatCurrency(quote.total)}</span>
            </div>
        </div>
    </div>

    ${quote.notes ? `
    <div class="section">
        <div class="section-title">Observaciones</div>
        <div class="notes">
            ${quote.notes}
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Cotización generada el ${formatDate(new Date().toISOString())}</p>
        <p>${companyConfig.name} - ${companyConfig.service}</p>
    </div>
</body>
</html>
    `
    } else {
        // Reporte múltiple
        const totalQuotes = quotes.length
        const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0)
        const averageValue = totalQuotes > 0 ? totalValue / totalQuotes : 0

        const statusStats = quotes.reduce((acc: any, quote) => {
            acc[quote.status] = (acc[quote.status] || 0) + 1
            return acc
        }, {})

        quotes.reduce((acc: any, quote) => {
            const companyName = quote.company?.name || 'Sin empresa'
            if (!acc[companyName]) {
                acc[companyName] = { count: 0, total: 0 }
            }
            acc[companyName].count++
            acc[companyName].total += quote.total
            return acc
        }, {})

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Cotizaciones</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
            .container { max-width: none; margin: 0; }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
            line-height: 1.4;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
            background: white;
            color: black;
            padding: 30px;
            text-align: center;
            border-bottom: 2px solid #333;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2rem;
            font-weight: bold;
            color: black;
        }
        
        .header-subtitle {
            font-size: 1.1rem;
            color: #333;
            margin-bottom: 20px;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .header-item {
            flex: 1;
            min-width: 200px;
            margin: 5px;
        }
        
        .header-item strong {
            display: block;
            font-size: 0.9rem;
            margin-bottom: 5px;
            color: #333;
        }
        
        .content {
            padding: 30px;
            background: white;
            color: black;
        }
        
        .stats-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #333;
        }
        
        .stats-section h3 {
            margin: 0 0 15px 0;
            color: black;
            font-size: 1.2rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #333;
            color: black;
        }
        
        .stat-item h4 {
            margin: 0 0 10px 0;
            color: black;
            font-size: 1rem;
        }
        
        .stat-item p {
            margin: 5px 0;
            font-size: 0.9rem;
            color: black;
        }
        
        .quotes-section {
            margin-top: 40px;
        }
        
        .quotes-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: black;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        
        .quotes-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .quotes-table th,
        .quotes-table td {
            border: 1px solid #333;
            padding: 10px;
            text-align: left;
            font-size: 0.9rem;
            color: black;
        }
        
        .quotes-table th {
            background: #f8f9fa;
            font-weight: bold;
            color: black;
        }
        
        .quotes-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
            color: white;
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
            .quotes-table { font-size: 0.8rem; }
            .quotes-table th, .quotes-table td { padding: 6px; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Imprimir PDF</button>
    
    <div class="container">
        <div class="header">
            <h1>REPORTE DE COTIZACIONES</h1>
            <div class="header-subtitle">Análisis completo de cotizaciones del sistema</div>
            <div class="header-info">
                <div class="header-item">
                    <strong>Total de Cotizaciones</strong>
                    ${totalQuotes}
                </div>
                <div class="header-item">
                    <strong>Valor Total</strong>
                    ${formatCurrency(totalValue)}
                </div>
                <div class="header-item">
                    <strong>Valor Promedio</strong>
                    ${formatCurrency(averageValue)}
                </div>
                <div class="header-item">
                    <strong>Fecha de Generación</strong>
                    ${new Date().toLocaleDateString('es-CL')}
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="stats-section">
                <h3>📊 Estadísticas Generales</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>Total de Cotizaciones</h4>
                        <p>${totalQuotes}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Valor Total</h4>
                        <p>${formatCurrency(totalValue)}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Valor Promedio</h4>
                        <p>${formatCurrency(averageValue)}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Estados</h4>
                        ${Object.entries(statusStats).map(([status, count]) => `
                            <p><strong>${status}:</strong> ${count}</p>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="quotes-section">
                <h2 class="quotes-title">Detalle de Cotizaciones</h2>
                <table class="quotes-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Empresa</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotes.map((quote: any) => `
                            <tr>
                                <td>${quote.id}</td>
                                <td>${quote.client?.name || 'N/A'}</td>
                                <td>${quote.company?.name || 'N/A'}</td>
                                <td>
                                    <span class="status-badge">
                                        ${quote.status}
                                    </span>
                                </td>
                                <td>${quote.createdAt ? formatDate(quote.createdAt) : 'N/A'}</td>
                                <td>${formatCurrency(quote.total)}</td>
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
}

function getCompanyConfig(companyType: string) {
    const configs = {
        AMESTICA: {
            name: 'AMESTICA LIMITADA',
            service: 'Servicio de detección y reparación de filtraciones de agua potable',
            rut: '76.508.960-3',
            address: 'Hamburgo 1398, Ñuñoa.',
            email: 'amesticaltda@gmail.com',
            phone: '222660040',
            logo: '/amestica.png',
            colors: {
                primary: '#1e40af',
                secondary: '#3b82f6',
                accent: '#f97316'
            }
        },
        MULTIFUGAS: {
            name: 'MULTIFUGAS',
            service: 'Servicio de detección y reparación de filtraciones de agua potable',
            rut: '78.135.216-0',
            address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
            email: 'multifugas@gmail.com',
            phone: '+569 78868002',
            logo: '/multifugas.png',
            colors: {
                primary: '#1e40af',
                secondary: '#3b82f6',
                accent: '#f97316'
            }
        },
        SERVIFUGAS: {
            name: 'SERVIFUGAS SPA',
            service: 'Servicio de detección de filtraciones en agua potable y reparación de cañerías',
            rut: '78.135.232-2',
            address: 'Lo Barnechea 1559.',
            email: 'Servifugas1@gmail.com',
            phone: '+569 92492720',
            logo: '/servifugas.png',
            colors: {
                primary: '#059669',
                secondary: '#10b981',
                accent: '#1e40af'
            }
        }
    }

    return configs[companyType as keyof typeof configs] || configs.AMESTICA
}
