import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Client {
  name: string
  email: string
  phone: string
  address: string
  company?: string
}

interface Company {
  type: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  date: Date
  dueDate?: Date | null
  subtotal: number
  tax: number
  total: number
  notes?: string | null
  client: Client
  company: Company
  items: InvoiceItem[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden exportar facturas
    if (
      !session?.user ||
      !["admin", "secretaria"].includes((session.user as { role: string }).role)
    ) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        company: true,
        items: true,
        createdBy: true
      }
    }) as Invoice | null

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }

    // Validar que existan los datos necesarios
    if (!invoice.client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 })
    }

    if (!invoice.items || invoice.items.length === 0) {
      return NextResponse.json({ error: "La factura no tiene items" }, { status: 400 })
    }

    const getCompanyConfig = (companyType: string) => {
      const configs = {
        AMESTICA: {
          name: 'AMESTICA LIMITADA',
          service: 'Servicio de detección y reparación de filtraciones de agua potable',
          rut: '76.508.960-3',
          address: 'Hamburgo 1398, Ñuñoa.',
          email: 'amesticaltda@gmail.com',
          phone: '222660040',
          colors: {
            primary: '#2563eb',
            secondary: '#dbeafe',
            text: '#1d4ed8'
          },
          logoHtml: `
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <div style="width: 32px; height: 32px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 16px; height: 16px; background: #2563eb; border-radius: 50%;"></div>
                </div>
              </div>
              <div>
                <h1 style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;">AMESTICA</h1>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">SERVICIOS PROFESIONALES</p>
              </div>
            </div>
          `
        },
        MULTIFUGAS: {
          name: 'MULTIFUGAS',
          service: 'Servicio de detección y reparación de filtraciones',
          rut: '78.135.216-0',
          address: 'Av. Américo Vespucio 3121, Macul, Santiago.',
          email: 'multifugas@gmail.com',
          phone: '+569 78868002',
          colors: {
            primary: '#059669',
            secondary: '#d1fae5',
            text: '#047857'
          },
          logoHtml: `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px; font-weight: bold; color: #2563eb;">Multi</span>
              <div style="width: 32px; height: 32px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 8px; height: 8px; background: #2563eb; border-radius: 50%;"></div>
                </div>
              </div>
              <span style="font-size: 24px; font-weight: bold; color: #2563eb;">Fugas</span>
            </div>
          `
        },
        SERVIFUGAS: {
          name: 'SERVIFUGAS SPA',
          service: 'Servicio de detección de filtraciones en agua potable y reparación de cañerías',
          rut: '78.135.232-2',
          address: 'Lo Barnechea 1559.',
          email: 'Servifugas1@gmail.com',
          phone: '+569 92492720',
          colors: {
            primary: '#059669',
            secondary: '#d1fae5',
            text: '#047857'
          },
          logoHtml: `
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 48px; height: 48px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 18px;">S</span>
              </div>
              <div>
                <h1 style="font-size: 24px; font-weight: bold; color: #059669; margin: 0;">ServiFugas</h1>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">Detección de Fugas de Agua</p>
              </div>
            </div>
          `
        }
      }

      return configs[companyType as keyof typeof configs] || configs.AMESTICA
    }

    if (!invoice.company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 400 })
    }

    const companyConfig = getCompanyConfig(invoice.company.type)

    const formatCurrency = (amount: number) => {
      if (!amount || isNaN(amount)) return '$0'
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(amount)
    }

    const formatDate = (dateString: string | Date | null) => {
      if (!dateString) return 'No especificado'
      try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString
        if (isNaN(date.getTime())) return 'Fecha inválida'
        return date.toLocaleDateString('es-CL')
      } catch (error) {
        return 'Fecha inválida'
      }
    }

    const safeString = (value: any) => {
      if (value === null || value === undefined) return ''
      return String(value).replace(/[<>]/g, '')
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura ${safeString(invoice.invoiceNumber)}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            padding: 30px;
            background: ${companyConfig.colors.secondary};
            border-bottom: 3px solid ${companyConfig.colors.primary};
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-info {
            flex: 1;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-title {
            font-size: 36px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
          }
          .client-section {
            padding: 30px;
            border-bottom: 1px solid #e5e7eb;
          }
          .client-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .content-section {
            padding: 30px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th,
          .table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
          }
          .table th {
            background: #f9fafb;
            font-weight: bold;
          }
          .table td.quantity,
          .table td.price,
          .table td.total {
            text-align: center;
          }
          .table td.price,
          .table td.total {
            text-align: right;
          }
          .totals {
            display: flex;
            justify-content: flex-end;
            margin: 30px 0;
          }
          .totals-table {
            width: 300px;
          }
          .totals-table td {
            padding: 8px 0;
            border: none;
          }
          .totals-table .total-row {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            color: ${companyConfig.colors.text};
          }
          .notes {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .conditions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .conditions h4 {
            color: #92400e;
            margin-bottom: 10px;
          }
          .conditions ul {
            color: #92400e;
            padding-left: 20px;
          }
          .conditions li {
            margin-bottom: 5px;
          }
          .footer {
            padding: 20px 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media print {
            body {
              background: white;
            }
            .container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="header-content">
              <div class="company-info">
                ${companyConfig.logoHtml}
                <div style="margin-top: 20px; font-size: 14px;">
                  <p><strong>RUT:</strong> ${safeString(companyConfig.rut)}</p>
                  <p><strong>Dirección:</strong> ${safeString(companyConfig.address)}</p>
                  <p><strong>Email:</strong> ${safeString(companyConfig.email)}</p>
                  <p><strong>Teléfono:</strong> ${safeString(companyConfig.phone)}</p>
                </div>
              </div>
              <div class="invoice-info">
                <h2 class="invoice-title">FACTURA</h2>
                <div style="font-size: 14px;">
                  <p><strong>Número:</strong> ${safeString(invoice.invoiceNumber)}</p>
                  <p><strong>Fecha:</strong> ${formatDate(invoice.date)}</p>
                  <p><strong>Vencimiento:</strong> ${formatDate(invoice.dueDate || null)}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Información del Cliente -->
          <div class="client-section">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Información del Cliente</h3>
            <div class="client-grid">
              <div>
                <p><strong>Nombre:</strong> ${safeString(invoice.client.name)}</p>
                <p><strong>Email:</strong> ${safeString(invoice.client.email)}</p>
                <p><strong>Teléfono:</strong> ${safeString(invoice.client.phone)}</p>
              </div>
              <div>
                <p><strong>Dirección:</strong> ${safeString(invoice.client.address)}</p>
                ${invoice.client.company ? `<p><strong>Empresa:</strong> ${safeString(invoice.client.company)}</p>` : ''}
              </div>
            </div>
          </div>

          <!-- Contenido Principal -->
          <div class="content-section">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">Detalle de Servicios</h3>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th class="quantity">Cantidad</th>
                  <th class="price">Precio Unit.</th>
                  <th class="total">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item: InvoiceItem) => `
                  <tr>
                    <td>${safeString(item.description)}</td>
                    <td class="quantity">${safeString(item.quantity)}</td>
                    <td class="price">${formatCurrency(item.unitPrice)}</td>
                    <td class="total">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Totales -->
            <div class="totals">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td style="text-align: right;">${formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr>
                  <td>IVA (19%):</td>
                  <td style="text-align: right;">${formatCurrency(invoice.tax)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td style="text-align: right; color: ${companyConfig.colors.text};">${formatCurrency(invoice.total)}</td>
                </tr>
              </table>
            </div>

            ${invoice.notes ? `
              <div class="notes">
                <h4 style="font-weight: bold; margin-bottom: 10px;">Observaciones:</h4>
                <p style="font-size: 14px; color: #374151;">${safeString(invoice.notes)}</p>
              </div>
            ` : ''}

            <!-- Condiciones de Pago -->
            <div class="conditions">
              <h4>CONDICIONES DE PAGO</h4>
              <ul>
                <li>Factura válida por 30 días desde la fecha de emisión</li>
                <li>Pago mediante transferencia bancaria o efectivo</li>
                <li>En caso de pago atrasado se aplicarán intereses</li>
                <li>Para consultas sobre esta factura, contactar a ${safeString(companyConfig.email)}</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Factura generada el ${formatDate(new Date())} - Sistema Administrativo</p>
          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="factura-${safeString(invoice.invoiceNumber)}.html"`
      }
    })

  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor"
    }, { status: 500 })
  }
}
