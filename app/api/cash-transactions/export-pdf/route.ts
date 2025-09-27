import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import puppeteer from 'puppeteer'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      transactions, 
      summary, 
      filters, 
      groupedData,
      title = 'Reporte de Transacciones de Caja',
      subtitle = `Generado el ${new Date().toLocaleDateString('es-CL')}`
    } = body

    // Generate PDF content using a simple HTML template
    const pdfContent = generatePDFContent({
      transactions,
      summary,
      filters,
      groupedData,
      title,
      subtitle
    })

    // Generate actual PDF using Puppeteer
    const pdfBuffer = await generatePDF(pdfContent)

    // Return the PDF as a blob
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-caja-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf"`,
      },
    })

  } catch (error) {
    
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}

async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
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
    
    return Buffer.from(pdfBuffer)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

function generatePDFContent(data: any) {
  const { transactions, summary, filters, groupedData, title, subtitle } = data

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

  const getFilterText = () => {
    const activeFilters = []
    if (filters.type) activeFilters.push(`Tipo: ${filters.type}`)
    if (filters.category) activeFilters.push(`Categoría: ${filters.category}`)
    if (filters.paymentMethod) activeFilters.push(`Método: ${filters.paymentMethod}`)
    if (filters.dateFrom || filters.dateTo) {
      const dateRange = []
      if (filters.dateFrom) dateRange.push(formatDate(filters.dateFrom))
      if (filters.dateTo) dateRange.push(formatDate(filters.dateTo))
      activeFilters.push(`Período: ${dateRange.join(' - ')}`)
    }
    return activeFilters.length > 0 ? activeFilters.join(' | ') : 'Sin filtros aplicados'
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.6;
          font-size: 12px;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin: 0;
        }
        
        .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 10px 0 0 0;
        }
        
        .company-info {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
        }
        
        .filters {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 11px;
        }
        
        .summary {
          display: table;
          width: 100%;
          margin-bottom: 30px;
          border-collapse: collapse;
        }
        
        .summary-row {
          display: table-row;
        }
        
        .summary-card {
          display: table-cell;
          width: 25%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 15px;
          text-align: center;
          vertical-align: top;
        }
        
        .summary-card.income {
          border-left: 4px solid #10b981;
        }
        
        .summary-card.expense {
          border-left: 4px solid #ef4444;
        }
        
        .summary-card.balance {
          border-left: 4px solid #3b82f6;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          margin: 5px 0;
        }
        
        .summary-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .income .summary-value { color: #10b981; }
        .expense .summary-value { color: #ef4444; }
        .balance .summary-value { color: #3b82f6; }
        
        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 10px;
        }
        
        .transactions-table th,
        .transactions-table td {
          border: 1px solid #e5e7eb;
          padding: 6px;
          text-align: left;
        }
        
        .transactions-table th {
          background: #f9fafb;
          font-weight: bold;
          color: #374151;
        }
        
        .transactions-table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .amount-income {
          color: #10b981;
          font-weight: bold;
        }
        
        .amount-expense {
          color: #ef4444;
          font-weight: bold;
        }
        
        .grouped-section {
          margin-top: 30px;
          page-break-before: always;
        }
        
        .group-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 15px;
          padding: 10px;
          background: #eff6ff;
          border-radius: 6px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
        }
        
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">Améstica Servicios Técnicos</div>
        </div>
        <h1 class="title">${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>

      <div class="filters">
        <strong>Filtros aplicados:</strong> ${getFilterText()}
      </div>

      <div class="summary">
        <div class="summary-row">
          <div class="summary-card income">
            <div class="summary-label">Ingresos Totales</div>
            <div class="summary-value">${formatCurrency(summary.income)}</div>
          </div>
          <div class="summary-card expense">
            <div class="summary-label">Gastos Totales</div>
            <div class="summary-value">${formatCurrency(summary.expense)}</div>
          </div>
          <div class="summary-card balance">
            <div class="summary-label">Balance Neto</div>
            <div class="summary-value">${formatCurrency(summary.balance)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Transacciones</div>
            <div class="summary-value">${summary.count}</div>
          </div>
        </div>
      </div>

      ${groupedData ? `
        <div class="grouped-section">
          <h2 class="group-title">Resumen Agrupado</h2>
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Transacciones</th>
                <th>Ingresos</th>
                <th>Gastos</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${groupedData.map((group: any) => `
                <tr>
                  <td><strong>${group.key}</strong></td>
                  <td>${group.count}</td>
                  <td class="amount-income">${formatCurrency(group.income)}</td>
                  <td class="amount-expense">${formatCurrency(group.expense)}</td>
                  <td class="${group.balance >= 0 ? 'amount-income' : 'amount-expense'}">${formatCurrency(group.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="page-break"></div>
      <h2 class="group-title">Detalle de Transacciones</h2>
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Método de Pago</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Registrado por</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map((transaction: any) => `
            <tr>
              <td>${formatDate(transaction.date)}</td>
              <td>${transaction.description}</td>
              <td>${transaction.category}</td>
              <td>${transaction.paymentMethod}</td>
              <td>${transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}</td>
              <td class="${transaction.type === 'INCOME' ? 'amount-income' : 'amount-expense'}">
                ${transaction.type === 'INCOME' ? '+' : '-'}${formatCurrency(transaction.amount)}
              </td>
              <td>${transaction.createdBy?.name || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
}
