import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
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
      select: {
        id: true,
        quoteNumber: true,
        createdAt: true,
        validUntil: true,
        taxRate: true,
        notes: true,
        client: true,
        items: true,
        createdBy: true,
        company: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Generar HTML de la cotización con mejor diseño
    const quoteHTML = `
      <html>
        <head>
          <title>Cotización ${quote.quoteNumber}</title>
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
            .quote-details {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
            }
            .quote-details h3 {
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
            .total-section {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .total-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              min-width: 200px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .total-row.final {
              font-weight: bold;
              font-size: 14px;
              color: #059669;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              margin-top: 8px;
            }
            .validity-notice {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              font-size: 12px;
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
              ${quote.company?.logo ? `
                <div class="company-logo">
                  <img src="${quote.company.logo}" alt="Logo" />
                </div>
              ` : ''}
              <div class="company-name">${quote.company?.name || 'Empresa'}</div>
              <div class="company-service">${quote.company?.service || 'Servicios Profesionales'}</div>
              
              <div class="company-info">
                <div>
                  <div><strong>RUT:</strong> ${quote.company?.rut || 'N/A'}</div>
                  <div><strong>Dirección:</strong> ${quote.company?.address || 'N/A'}</div>
                </div>
                <div>
                  <div><strong>Email:</strong> ${quote.company?.email || 'N/A'}</div>
                  <div><strong>Teléfono:</strong> ${quote.company?.phone || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div class="separator"></div>
            
            <div class="document-title">COTIZACIÓN</div>
            
            <div class="quote-details">
              <h3>Información del Cliente</h3>
              <div class="details-grid">
                <div class="detail-row">
                  <span class="label">Cliente:</span>
                  <span class="value">${quote.client?.name || 'No especificado'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Número:</span>
                  <span class="value">${quote.quoteNumber || quote.id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Fecha:</span>
                  <span class="value">${new Date(quote.createdAt).toLocaleDateString('es-CL')}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Válida hasta:</span>
                  <span class="value">${new Date(quote.validUntil).toLocaleDateString('es-CL')}</span>
                </div>
                ${quote.client?.address ? `
                <div class="detail-row">
                  <span class="label">Dirección:</span>
                  <span class="value">${quote.client.address}</span>
                </div>
                ` : ''}
                ${quote.client?.phone ? `
                <div class="detail-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">${quote.client.phone}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="validity-notice">
              <strong>⚠️ IMPORTANTE:</strong> Esta cotización es válida hasta el ${new Date(quote.validUntil).toLocaleDateString('es-CL')}
            </div>

            <div class="section">
              <div class="section-title">Detalle de Servicios</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Cantidad</th>
                    <th>Descripción</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${quote.items.map(item => `
                    <tr>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td>${item.description}</td>
                      <td style="text-align: right;">$${item.unitPrice.toLocaleString('es-CL')}</td>
                      <td style="text-align: right; font-weight: 600;">$${item.total.toLocaleString('es-CL')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-box">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${(quote.items.reduce((sum, item) => sum + item.total, 0) * (1 - (quote.taxRate || 0) / 100)).toLocaleString('es-CL')}</span>
                  </div>
                  <div class="total-row">
                    <span>IVA (${quote.taxRate || 19}%):</span>
                    <span>$${(quote.items.reduce((sum, item) => sum + item.total, 0) * ((quote.taxRate || 0) / 100)).toLocaleString('es-CL')}</span>
                  </div>
                  <div class="total-row final">
                    <span>TOTAL:</span>
                    <span>$${quote.items.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>
            </div>

            ${quote.notes ? `
            <div class="notes-section">
              <div class="section-title">Notas Adicionales</div>
              <p style="margin: 0; font-size: 12px; line-height: 1.5;">${quote.notes}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p><strong>${quote.company?.name || 'Empresa'}</strong></p>
              <p>Generado por: ${quote.createdBy.name}</p>
              <p>Fecha: ${new Date().toLocaleDateString('es-CL')} - Hora: ${new Date().toLocaleTimeString('es-CL')}</p>
            </div>
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
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
