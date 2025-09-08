import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admin y secretaria pueden exportar liquidaciones
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para exportar liquidaciones' }, { status: 403 })
    }

    const liquidationId = params.id

    if (!liquidationId) {
      return NextResponse.json({ error: 'ID de liquidación requerido' }, { status: 400 })
    }

    // Obtener la liquidación con todos sus datos
    const liquidation = await prisma.liquidation.findUnique({
      where: { id: liquidationId },
      include: {
        technician: true,
        company: true,
        items: true,
        advances: true,
        createdBy: true
      }
    })

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
    }

    // Generar HTML de la liquidación
    const liquidationHTML = `
      <html>
        <head>
          <title>Liquidación ${liquidation.liquidationNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-info {
              text-align: center;
              margin-bottom: 20px;
            }
            .liquidation-details {
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #2c3e50;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              width: 200px;
            }
            .value {
              text-align: right;
              width: 150px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .items-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f8f9fa;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LIQUIDACIÓN DE SUELDO</h1>
            <h2>${liquidation.company.name}</h2>
          </div>
          
          <div class="liquidation-details">
            <div class="row">
              <span class="label">Número de Liquidación:</span>
              <span class="value">${liquidation.liquidationNumber}</span>
            </div>
            <div class="row">
              <span class="label">Técnico:</span>
              <span class="value">${liquidation.technician.name}</span>
            </div>
            <div class="row">
              <span class="label">Período:</span>
              <span class="value">${new Date(liquidation.periodStart).toLocaleDateString('es-CL')} - ${new Date(liquidation.periodEnd).toLocaleDateString('es-CL')}</span>
            </div>
            <div class="row">
              <span class="label">Fecha de Generación:</span>
              <span class="value">${new Date(liquidation.createdAt).toLocaleDateString('es-CL')}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Resumen de Liquidación</div>
            <div class="row">
              <span class="label">Sueldo Base:</span>
              <span class="value">$${liquidation.baseSalary.toLocaleString('es-CL')}</span>
            </div>
            <div class="row">
              <span class="label">Total Ganancias:</span>
              <span class="value">$${liquidation.totalEarnings.toLocaleString('es-CL')}</span>
            </div>
            <div class="row">
              <span class="label">Total Deducciones:</span>
              <span class="value">$${liquidation.totalDeductions.toLocaleString('es-CL')}</span>
            </div>
            <div class="row">
              <span class="label">Sueldo Neto:</span>
              <span class="value">$${liquidation.netSalary.toLocaleString('es-CL')}</span>
            </div>
          </div>

          ${liquidation.items.length > 0 ? `
          <div class="section">
            <div class="section-title">Items de Liquidación</div>
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
                ${liquidation.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.type}</td>
                    <td>${item.quantity || '-'}</td>
                    <td>${item.unitPrice ? '$' + item.unitPrice.toLocaleString('es-CL') : '-'}</td>
                    <td>$${item.total.toLocaleString('es-CL')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${liquidation.advances.length > 0 ? `
          <div class="section">
            <div class="section-title">Anticipos</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${liquidation.advances.map(advance => `
                  <tr>
                    <td>${new Date(advance.date).toLocaleDateString('es-CL')}</td>
                    <td>${advance.description}</td>
                    <td>$${advance.amount.toLocaleString('es-CL')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p>Esta liquidación es un documento oficial de ${liquidation.company.name}</p>
            <p>Generado por: ${liquidation.createdBy.name}</p>
            <p>Fecha: ${new Date().toLocaleDateString('es-CL')} - Hora: ${new Date().toLocaleTimeString('es-CL')}</p>
          </div>
        </body>
      </html>
    `

    // Por ahora, devolver HTML (en una implementación real, convertirías a PDF)
    return new NextResponse(liquidationHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="liquidacion-${liquidation.liquidationNumber}.html`,
        'Content-Length': liquidationHTML.length.toString()
      }
    })

  } catch (error) {
    console.error('Error exporting liquidation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
