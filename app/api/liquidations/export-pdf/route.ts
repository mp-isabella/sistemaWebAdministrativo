import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession()
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
                        phone: true,
                        address: true
                    }
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
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

        const netAmount = totalEarnings - totalDeductions - totalAdvances

        // HTML template mejorado con mejor diseño
        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquidación - ${liquidation.technician?.name}</title>
    <style>
        @page {
            margin: 25mm;
            size: A4;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
            background: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
        }
        .company-logo {
            margin-bottom: 15px;
        }
        .company-logo img {
            max-height: 80px;
            max-width: 200px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .company-service {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 15px;
        }
        .company-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #6b7280;
        }
        .separator {
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
        }
        .document-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin: 20px 0;
        }
        .technician-details {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .technician-details h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 16px;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .label {
            font-weight: 600;
            color: #374151;
        }
        .value {
            color: #6b7280;
        }
        .period-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .period-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .period-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .period-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .items-table th {
            background: #1e40af;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
        }
        .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
        }
        .items-table tr:nth-child(even) {
            background: #f8fafc;
        }
        .items-table tr:hover {
            background: #f1f5f9;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-green {
            color: #059669;
        }
        .text-red {
            color: #dc2626;
        }
        .text-orange {
            color: #ea580c;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-earnings {
            background-color: #dcfce7;
            color: #059669;
        }
        .badge-deduction {
            background-color: #fee2e2;
            color: #dc2626;
        }
        .badge-material {
            background-color: #fef3c7;
            color: #d97706;
        }
        .badge-fuel {
            background-color: #fce7f3;
            color: #be185d;
        }
        .badge-loan {
            background-color: #f3e8ff;
            color: #7c3aed;
        }
        .badge-advance {
            background-color: #fff7ed;
            color: #ea580c;
        }
        .summary-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            font-size: 12px;
        }
        .total-section {
            border-left: 4px solid #059669;
            padding-left: 20px;
            text-align: center;
        }
        .total-title {
            font-size: 16px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
        }
        .notes-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            margin-top: 40px;
            padding-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 11px;
        }
        .footer p {
            margin: 5px 0;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .container { max-width: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${liquidation.company?.logo ? `
                <div class="company-logo">
                    <img src="${liquidation.company.logo}" alt="Logo" />
                </div>
            ` : ''}
            <div class="company-name">${liquidation.company?.name || 'EMPRESA'}</div>
            <div class="company-service">${liquidation.company?.service || 'Servicios de detección y reparación de filtraciones'}</div>
            
            <div class="company-info">
                <div>
                    <div><strong>RUT:</strong> ${liquidation.company?.rut || 'N/A'}</div>
                    <div><strong>Dirección:</strong> ${liquidation.company?.address || 'N/A'}</div>
                </div>
                <div>
                    <div><strong>Email:</strong> ${liquidation.company?.email || 'N/A'}</div>
                    <div><strong>Teléfono:</strong> ${liquidation.company?.phone || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="separator"></div>
        
        <div class="document-title">LIQUIDACIÓN DE SERVICIOS</div>
        
        <div class="technician-details">
            <h3>Información del Técnico</h3>
            <div class="details-grid">
                <div class="detail-row">
                    <span class="label">Técnico:</span>
                    <span class="value">${liquidation.technician?.name || 'No especificado'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Período:</span>
                    <span class="value">${formatDate(liquidation.periodStart)} - ${formatDate(liquidation.periodEnd)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Fecha de emisión:</span>
                    <span class="value">${formatDate(liquidation.createdAt.toISOString())}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Generado por:</span>
                    <span class="value">${liquidation.createdBy?.name || 'Sistema'}</span>
                </div>
            </div>
        </div>

        <div class="period-cards">
            <div class="period-card">
                <div class="period-label">Fecha Inicio</div>
                <div class="period-value">${formatDate(liquidation.periodStart)}</div>
            </div>
            <div class="period-card">
                <div class="period-label">Fecha Fin</div>
                <div class="period-value">${formatDate(liquidation.periodEnd)}</div>
            </div>
            <div class="period-card">
                <div class="period-label">Días Trabajados</div>
                <div class="period-value">${Math.ceil((new Date(liquidation.periodEnd).getTime() - new Date(liquidation.periodStart).getTime()) / (1000 * 60 * 60 * 24)) + 1}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Detalle de Ingresos y Deducciones</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th class="text-right">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${liquidation.items.map((item: any) => `
                        <tr>
                            <td>${formatDate(item.createdAt)}</td>
                            <td>${item.description}</td>
                            <td>
                                <span class="badge badge-${item.type}">
                                    ${item.type === 'earnings' ? 'Ingreso' :
                item.type === 'deduction' ? 'Deducción' :
                    item.type === 'material' ? 'Material' :
                        item.type === 'fuel' ? 'Combustible' :
                            item.type === 'loan' ? 'Préstamo' : 'Otro'}
                                </span>
                            </td>
                            <td class="text-right ${item.type === 'earnings' ? 'text-green' : 'text-red'}">
                                ${item.type === 'earnings' ? '+' : '-'}${formatCurrency(item.total)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${liquidation.advances.length > 0 ? `
        <div class="section">
            <div class="section-title">Anticipos Realizados</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th class="text-right">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${liquidation.advances.map((advance: any) => `
                        <tr>
                            <td>${formatDate(advance.date)}</td>
                            <td>${advance.description}</td>
                            <td class="text-right text-orange">-${formatCurrency(advance.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="summary-section">
            <div class="summary-grid">
                <div>
                    <div class="summary-item">
                        <span>Total Ingresos:</span>
                        <span class="text-green">${formatCurrency(totalEarnings)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Total Deducciones:</span>
                        <span class="text-red">-${formatCurrency(totalDeductions)}</span>
                    </div>
                    ${totalAdvances > 0 ? `
                    <div class="summary-item">
                        <span>Total Anticipos:</span>
                        <span class="text-orange">-${formatCurrency(totalAdvances)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="total-section">
                    <div class="total-title">Monto Neto a Pagar</div>
                    <div class="total-amount">${formatCurrency(netAmount)}</div>
                </div>
            </div>
        </div>

        ${liquidation.notes ? `
        <div class="notes-section">
            <div class="section-title">Observaciones</div>
            <p style="margin: 0; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${liquidation.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p><strong>${liquidation.company?.name || 'EMPRESA'}</strong></p>
            <p>Liquidación generada el ${formatDate(new Date().toISOString())}</p>
            <p>Sistema de Gestión</p>
        </div>
    </div>
</body>
</html>
    `

        // Generar PDF usando Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security']
        })

        const page = await browser.newPage()

        // Configurar el contenido HTML
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        })

        // Generar PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '25mm',
                right: '25mm',
                bottom: '25mm',
                left: '25mm'
            }
        })

        await browser.close()

        // Crear nombre de archivo
        const technicianName = liquidation.technician?.name || 'tecnico'
        const fileName = `liquidacion-${technicianName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-${formatDate(liquidation.periodStart)}.pdf`

        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        })

    } catch (error) {
        
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
