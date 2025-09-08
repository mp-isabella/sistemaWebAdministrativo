import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admin y secretaria pueden exportar cotizaciones
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para exportar cotizaciones' }, { status: 403 })
    }

    const quoteId = params.id

    if (!quoteId) {
      return NextResponse.json({ error: 'ID de cotización requerido' }, { status: 400 })
    }

    // Obtener la cotización con todos sus datos
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        company: true,
        items: true,
        createdBy: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Generar HTML de la cotización
    const quoteHTML = `
      <html>
        <head>
          <title>Cotización ${quote.quoteNumber}</title>
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
            .quote-details {
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
            .validity {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>COTIZACIÓN</h1>
            <h2>${quote.company?.name || 'Empresa'}</h2>
          </div>
          
          <div class="quote-details">
            <div class="row">
              <span class="label">Número de Cotización:</span>
              <span class="value">${quote.quoteNumber}</span>
            </div>
            <div class="row">
              <span class="label">Cliente:</span>
              <span class="value">${quote.client?.name || 'Cliente'}</span>
            </div>
            <div class="row">
              <span class="label">Fecha:</span>
              <span class="value">${new Date(quote.date).toLocaleDateString('es-CL')}</span>
            </div>
            <div class="row">
              <span class="label">Válida hasta:</span>
              <span class="value">${new Date(quote.validUntil).toLocaleDateString('es-CL')}</span>
            </div>
            <div class="row">
              <span class="label">Estado:</span>
              <span class="value">${quote.status}</span>
            </div>
          </div>

          <div class="validity">
            <strong>⚠️ IMPORTANTE:</strong> Esta cotización es válida hasta el ${new Date(quote.validUntil).toLocaleDateString('es-CL')}
          </div>

          <div class="section">
            <div class="section-title">Items de la Cotización</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${quote.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toLocaleString('es-CL')}</td>
                    <td>$${item.total.toLocaleString('es-CL')}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                  <td><strong>$${(quote.items.reduce((sum, item) => sum + item.total, 0) * (1 - (quote.taxRate || 0) / 100)).toLocaleString('es-CL')}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>IVA (${quote.taxRate || 19}%):</strong></td>
                  <td><strong>$${(quote.items.reduce((sum, item) => sum + item.total, 0) * ((quote.taxRate || 0) / 100)).toLocaleString('es-CL')}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>TOTAL:</strong></td>
                  <td><strong>$${quote.items.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-CL')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${quote.notes ? `
          <div class="section">
            <div class="section-title">Notas Adicionales</div>
            <p>${quote.notes}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>Esta cotización es un documento oficial de ${quote.company?.name || 'Empresa'}</p>
            <p>Generado por: ${quote.createdBy.name}</p>
            <p>Fecha: ${new Date().toLocaleDateString('es-CL')} - Hora: ${new Date().toLocaleTimeString('es-CL')}</p>
          </div>
        </body>
      </html>
    `

    // Configurar headers optimizados
    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="cotizacion-${quote.quoteNumber}.html"`,
      'Content-Length': quoteHTML.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return new NextResponse(quoteHTML, { headers })

  } catch (error) {
    console.error('Error exporting quote:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
