import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const liquidation = await prisma.liquidation.findUnique({
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
      .filter(item => item.type === 'EARNINGS')
      .reduce((sum, item) => sum + item.total, 0)

    const totalDeductions = liquidation.items
      .filter(item => item.type !== 'EARNINGS')
      .reduce((sum, item) => sum + item.total, 0)

    const totalAdvances = liquidation.advances
      .reduce((sum, advance) => sum + advance.amount, 0)

    const netAmount = totalEarnings - totalDeductions - totalAdvances

    // HTML template que funciona correctamente
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquidación - ${liquidation.technician?.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .company-service {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .company-details {
            font-size: 12px;
            color: #666;
        }
        
        .liquidation-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #1e40af;
        }
        
        .info-section {
            margin-bottom: 20px;
        }
        
        .info-row {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            min-width: 100px;
            display: inline-block;
        }
        
        .period-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .period-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #ddd;
        }
        
        .period-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .period-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 25px 0 15px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
            font-size: 14px;
        }
        
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #333;
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
            font-size: 11px;
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
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border: 1px solid #ddd;
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
            font-size: 14px;
        }
        
        .total-section {
            border-left: 4px solid #059669;
            padding-left: 20px;
            text-align: center;
        }
        
        .total-title {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }
        
        .total-amount {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
        }
        
        .notes-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${liquidation.company?.name || 'EMPRESA'}</div>
        <div class="company-service">Servicios de detección y reparación de filtraciones</div>
        <div class="company-details">
            ${liquidation.company?.address || 'Dirección no especificada'} | 
            ${liquidation.company?.phone || 'Teléfono no especificado'} | 
            ${liquidation.company?.email || 'Email no especificado'}
        </div>
    </div>

    <div class="liquidation-title">LIQUIDACIÓN DE SUELDO</div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Técnico:</span>
            <span>${liquidation.technician?.name || 'No especificado'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Período:</span>
            <span>${formatDate(liquidation.periodStart)} - ${formatDate(liquidation.periodEnd)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha de emisión:</span>
            <span>${formatDate(liquidation.createdAt.toISOString())}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Generado por:</span>
            <span>${liquidation.createdBy?.name || 'Sistema'}</span>
        </div>
    </div>

    <div class="period-details">
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

    <div class="section-title">Detalle de Ingresos y Deducciones</div>
    
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th class="text-right">Monto</th>
            </tr>
        </thead>
        <tbody>
            ${liquidation.items.map(item => `
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

    ${liquidation.advances.length > 0 ? `
    <div class="section-title">Anticipos Realizados</div>
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th class="text-right">Monto</th>
            </tr>
        </thead>
        <tbody>
            ${liquidation.advances.map(advance => `
                <tr>
                    <td>${formatDate(advance.date)}</td>
                    <td>${advance.description}</td>
                    <td class="text-right text-orange">-${formatCurrency(advance.amount)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
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
        <div style="white-space: pre-wrap;">${liquidation.notes}</div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Liquidación generada el ${formatDate(new Date().toISOString())}</p>
        <p>${liquidation.company?.name || 'EMPRESA'} - Sistema de Gestión</p>
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
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    await browser.close()
    
    // Crear nombre de archivo
    const technicianName = liquidation.technician?.name || 'tecnico'
    const fileName = `liquidacion-${technicianName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-${formatDate(liquidation.periodStart)}.pdf`
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('Error generating liquidation PDF:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
