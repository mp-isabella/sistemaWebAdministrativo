import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions as any)
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const liquidation = await (prisma as any).liquidation.findUnique({
            where: { id: params.id },
            include: {
                technician: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        rut: true,
                        address: true,
                        phone: true,
                        email: true
                    }
                },
                items: true,
                advances: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!liquidation) {
            return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
        }

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount)
        }

        const formatDate = (date: Date | string) => {
            const dateObj = typeof date === 'string' ? new Date(date) : date
            return dateObj.toLocaleDateString('es-CL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }

        // Calcular totales
        const totalEarnings = liquidation.items
            .filter((item: any) => item.type === 'EARNINGS')
            .reduce((sum: number, item: any) => sum + item.total, 0)

        const totalDeductions = liquidation.items
            .filter((item: any) => item.type !== 'EARNINGS')
            .reduce((sum: number, item: any) => sum + item.total, 0)

        const totalAdvances = liquidation.advances
            .reduce((sum: number, advance: any) => sum + advance.amount, 0)

        const netAmount = liquidation.baseSalary + totalEarnings - totalDeductions - totalAdvances

        // Configuración de empresas (igual que en liquidation-preview.tsx)
        const getCompanyConfig = (company: any) => {
            const configs = {
                'AMESTICA LIMITADA': {
                    name: 'AMESTICA LIMITADA',
                    displayName: 'AMESTICA LIMITADA',
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
                'MULTIFUGAS': {
                    name: 'MULTIFUGAS',
                    displayName: 'MULTIFUGAS',
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
                'SERVIFUGAS SPA': {
                    name: 'SERVIFUGAS SPA',
                    displayName: 'SERVIFUGAS SPA',
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

            if (company && company.name) {
                const hardcodedConfig = configs[company.name as keyof typeof configs]
                if (hardcodedConfig) {
                    return {
                        ...hardcodedConfig,
                        logo: company.logo || hardcodedConfig.logo,
                        displayName: company.displayName || hardcodedConfig.displayName,
                        service: company.service || hardcodedConfig.service,
                        rut: company.rut || hardcodedConfig.rut,
                        address: company.address || hardcodedConfig.address,
                        email: company.email || hardcodedConfig.email,
                        phone: company.phone || hardcodedConfig.phone,
                        colors: {
                            primary: company.primaryColor || hardcodedConfig.colors.primary,
                            secondary: company.secondaryColor || hardcodedConfig.colors.secondary,
                            accent: company.accentColor || hardcodedConfig.colors.accent
                        }
                    }
                }
            }

            return configs['AMESTICA LIMITADA']
        }

        const companyConfig = getCompanyConfig(liquidation.company)

        // Get base URL for absolute logo paths
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

        // Update logo paths to be absolute URLs
        const updatedCompanyConfig = {
            ...companyConfig,
            logo: `${baseUrl}${companyConfig.logo}`
        }

        // HTML template profesional mejorado
        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Liquidación - ${liquidation.technician?.name || 'Trabajador'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #2c3e50;
            background: #fff;
            padding: 30px;
            margin: 0;
        }
        
        .document-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        .company-header {
            display: flex;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #22c55e;
        }
        
        .company-logo {
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            position: relative;
        }
        
        .company-logo img {
            width: 120px;
            height: 120px;
            object-fit: contain;
            border-radius: 8px;
        }
        
        .company-logo-fallback {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 5px;
        }
        
        .company-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }
        
        .company-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
            color: #555;
        }
        
        .document-title {
            text-align: center;
            margin: 40px 0;
        }
        
        .document-title h1 {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .document-title .period {
            font-size: 16px;
            color: #666;
        }
        
        .info-panels {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-panel {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            position: relative;
        }
        
        .info-panel::after {
            content: '';
            position: absolute;
            right: -10px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #22c55e;
        }
        
        .info-panel:last-child::after {
            display: none;
        }
        
        .panel-title {
            font-size: 16px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 15px;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 5px;
        }
        
        .info-item {
            display: flex;
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            min-width: 80px;
            margin-right: 10px;
        }
        
        .info-value {
            color: #333;
            flex: 1;
        }
        
        .liquidation-summary {
            background: #f8f9fa;
            border: 2px solid #22c55e;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            position: relative;
        }
        
        .summary-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .summary-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .summary-items {
            flex: 1;
            margin-right: 30px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .summary-item:last-child {
            border-bottom: none;
        }
        
        .summary-label {
            font-weight: 600;
            color: #495057;
        }
        
        .summary-value {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .total-section {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            min-width: 200px;
        }
        
        .total-label {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .total-amount {
            font-size: 24px;
            font-weight: bold;
        }
        
        .items-section {
            margin: 30px 0;
        }
        
        .items-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 5px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            font-size: 14px;
        }
        
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .notes-section {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .notes-title {
            color: #ea580c;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
        }
        
        .footer p {
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <div class="document-container">
        <!-- Header de la empresa -->
        <div class="company-header">
            <div class="company-logo">
                <img src="${updatedCompanyConfig.logo}" alt="${updatedCompanyConfig.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="company-logo-fallback" style="display: none;">
                    ${(updatedCompanyConfig.name || 'E').charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="company-info">
                <div class="company-name">${updatedCompanyConfig.displayName}</div>
                <div class="company-description">${updatedCompanyConfig.service}</div>
                <div class="company-details">
                    <div><strong>RUT:</strong> ${updatedCompanyConfig.rut}</div>
                    <div><strong>Teléfono:</strong> ${updatedCompanyConfig.phone}</div>
                    <div><strong>Dirección:</strong> ${updatedCompanyConfig.address}</div>
                    <div><strong>Email:</strong> ${updatedCompanyConfig.email}</div>
                </div>
            </div>
        </div>

        <!-- Título del documento -->
        <div class="document-title">
            <h1>LIQUIDACIÓN DE SUELDO</h1>
            <div class="period">Período: ${formatDate(liquidation.periodStart)} - ${formatDate(liquidation.periodEnd)}</div>
        </div>

        <!-- Paneles de información -->
        <div class="info-panels">
            <div class="info-panel">
                <div class="panel-title">Información del Técnico</div>
                <div class="info-item">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">${liquidation.technician?.name || 'No especificado'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">RUT:</span>
                    <span class="info-value">No especificado</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${liquidation.technician?.email || 'No especificado'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">${liquidation.technician?.phone || 'No especificado'}</span>
                </div>
            </div>
            
            <div class="info-panel">
                <div class="panel-title">Detalles del Período</div>
                <div class="info-item">
                    <span class="info-label">Inicio:</span>
                    <span class="info-value">${formatDate(liquidation.periodStart)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fin:</span>
                    <span class="info-value">${formatDate(liquidation.periodEnd)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sueldo Base:</span>
                    <span class="info-value">${formatCurrency(liquidation.baseSalary)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Trabajador:</span>
                    <span class="info-value">${liquidation.technician?.name || 'No especificado'}</span>
                </div>
            </div>
        </div>

        <!-- Resumen de liquidación -->
        <div class="liquidation-summary">
            <div class="summary-title">Resumen de Liquidación</div>
            <div class="summary-content">
                <div class="summary-items">
                    <div class="summary-item">
                        <span class="summary-label">Sueldo Base:</span>
                        <span class="summary-value">${formatCurrency(liquidation.baseSalary)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Ganancias:</span>
                        <span class="summary-value">${formatCurrency(totalEarnings)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Deducciones:</span>
                        <span class="summary-value">${formatCurrency(totalDeductions)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Anticipos:</span>
                        <span class="summary-value">-${formatCurrency(totalAdvances)}</span>
                    </div>
                </div>
                <div class="total-section">
                    <div class="total-label">TOTAL A PAGAR</div>
                    <div class="total-amount">${formatCurrency(netAmount)}</div>
                </div>
            </div>
        </div>

        <!-- Detalle de items -->
        ${liquidation.items.length > 0 ? `
        <div class="items-section">
            <div class="items-title">Detalle de Items</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${liquidation.items.map((item: any) => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.type}</td>
                            <td>${item.quantity || 0}</td>
                            <td>${formatCurrency(item.unitPrice || 0)}</td>
                            <td>${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- Anticipos -->
        ${liquidation.advances.length > 0 ? `
        <div class="items-section">
            <div class="items-title">Anticipos</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${liquidation.advances.map((advance: any) => `
                        <tr>
                            <td>${formatDate(advance.date)}</td>
                            <td>${advance.description}</td>
                            <td>${formatCurrency(advance.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- Observaciones -->
        ${liquidation.notes ? `
        <div class="notes-section">
            <div class="notes-title">Observaciones</div>
            <p>${liquidation.notes}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>Documento generado el ${formatDate(new Date())}</p>
            <p>Esta liquidación es un documento oficial de ${updatedCompanyConfig.displayName}</p>
        </div>
    </div>
</body>
</html>`

        // Configurar Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        })

        await browser.close()

        return new NextResponse(pdf as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="liquidacion-${(liquidation.technician?.name || 'trabajador').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')}.pdf"`
            }
        })

    } catch (error) {
        
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}