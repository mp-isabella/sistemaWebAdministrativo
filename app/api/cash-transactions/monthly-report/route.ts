import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
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
    const { month, year } = body

    if (!month || !year) {
      return NextResponse.json({ error: 'Mes y año son requeridos' }, { status: 400 })
    }

    // Obtener transacciones del mes específico
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const transactions = await prisma.cashTransaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calcular estadísticas
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expense

    // Análisis por categorías
    const categoryAnalysis = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Sin categoría'
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0, count: 0 }
      }
      
      if (transaction.type === 'INCOME') {
        acc[category].income += transaction.amount
      } else {
        acc[category].expense += transaction.amount
      }
      acc[category].count += 1
      
      return acc
    }, {} as Record<string, { income: number, expense: number, count: number }>)

    // Análisis por método de pago
    const paymentMethodAnalysis = transactions.reduce((acc, transaction) => {
      const method = transaction.paymentMethod || 'Sin método'
      if (!acc[method]) {
        acc[method] = { income: 0, expense: 0, count: 0 }
      }
      
      if (transaction.type === 'INCOME') {
        acc[method].income += transaction.amount
      } else {
        acc[method].expense += transaction.amount
      }
      acc[method].count += 1
      
      return acc
    }, {} as Record<string, { income: number, expense: number, count: number }>)

    // Generar contenido del PDF
    const pdfContent = generateMonthlyReportContent({
      month,
      year,
      transactions,
      summary: {
        income,
        expense,
        balance,
        count: transactions.length
      },
      categoryAnalysis,
      paymentMethodAnalysis
    })

    // Generar PDF usando Puppeteer
    const pdfBuffer = await generatePDF(pdfContent)

    // Retornar el PDF
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-mensual-${month}-${year}.pdf"`,
      },
    })

  } catch (error) {
    
    return NextResponse.json({ error: 'Error generando reporte mensual' }, { status: 500 })
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

function generateMonthlyReportContent(data: any) {
  const { month, year, transactions, summary, categoryAnalysis, paymentMethodAnalysis } = data

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

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

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte Mensual de Caja</title>
      <style>
        @page {
          size: A4;
           margin: 10mm;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 5px;
            font-size: 8px;
          }
          .header { 
            padding-bottom: 10px; 
            margin-bottom: 15px; 
          }
          .company-name { font-size: 14px; }
          .title { font-size: 16px; }
          .subtitle { font-size: 10px; }
          .summary { margin-bottom: 15px; }
          .summary-card { 
            padding: 8px; 
            font-size: 9px; 
          }
          .summary-value { font-size: 12px; }
          .summary-label { font-size: 8px; }
          .analysis-section { margin-bottom: 15px; }
          .section-title { 
            font-size: 12px; 
            margin-bottom: 8px; 
            padding: 6px; 
          }
          .analysis-table { 
            margin-bottom: 10px; 
            font-size: 7px; 
          }
          .analysis-table th,
          .analysis-table td { 
            padding: 3px; 
          }
          .transactions-table { 
            font-size: 6px; 
            margin-top: 10px; 
          }
          .transactions-table th,
          .transactions-table td { 
            padding: 2px; 
          }
        }
        
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 10px;
          color: #333;
          line-height: 1.3;
          font-size: 10px;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
        }
        
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
          margin: 0;
        }
        
        .subtitle {
          font-size: 11px;
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        
        .summary {
          display: table;
          width: 100%;
          margin-bottom: 20px;
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
          padding: 10px;
          text-align: center;
          vertical-align: top;
        }
        
        .summary-card.income {
          border-left: 3px solid #10b981;
        }
        
        .summary-card.expense {
          border-left: 3px solid #ef4444;
        }
        
        .summary-card.balance {
          border-left: 3px solid #3b82f6;
        }
        
        .summary-value {
          font-size: 14px;
          font-weight: bold;
          margin: 3px 0;
        }
        
        .summary-label {
          font-size: 9px;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .income .summary-value { color: #10b981; }
        .expense .summary-value { color: #ef4444; }
        .balance .summary-value { color: #3b82f6; }
        
        .analysis-section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
          padding: 8px;
          background: #eff6ff;
          border-radius: 4px;
        }
        
        .analysis-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8px;
        }
        
        .analysis-table th,
        .analysis-table td {
          border: 1px solid #e5e7eb;
          padding: 4px;
          text-align: left;
        }
        
        .analysis-table th {
          background: #f9fafb;
          font-weight: bold;
          color: #374151;
        }
        
        .analysis-table tr:nth-child(even) {
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
        
        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 7px;
        }
        
        .transactions-table th,
        .transactions-table td {
          border: 1px solid #e5e7eb;
          padding: 3px;
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
        
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Améstica Servicios Técnicos</div>
        <h1 class="title">Reporte Mensual de Caja</h1>
        <p class="subtitle">${months[month - 1]} ${year}</p>
        <p class="subtitle">Generado el ${new Date().toLocaleDateString('es-CL')}</p>
      </div>

      <div class="summary">
        <div class="summary-row">
          <div class="summary-card income">
            <div class="summary-label">Ingresos del Mes</div>
            <div class="summary-value">${formatCurrency(summary.income)}</div>
          </div>
          <div class="summary-card expense">
            <div class="summary-label">Gastos del Mes</div>
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

      <div class="analysis-section">
        <h2 class="section-title">Análisis por Categorías</h2>
        <table class="analysis-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Transacciones</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(categoryAnalysis).map(([category, data]: [string, any]) => `
              <tr>
                <td><strong>${category}</strong></td>
                <td>${data.count}</td>
                <td class="amount-income">${formatCurrency(data.income)}</td>
                <td class="amount-expense">${formatCurrency(data.expense)}</td>
                <td class="${data.income - data.expense >= 0 ? 'amount-income' : 'amount-expense'}">
                  ${formatCurrency(data.income - data.expense)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="analysis-section">
        <h2 class="section-title">Análisis por Método de Pago</h2>
        <table class="analysis-table">
          <thead>
            <tr>
              <th>Método de Pago</th>
              <th>Transacciones</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(paymentMethodAnalysis).map(([method, data]: [string, any]) => `
              <tr>
                <td><strong>${method}</strong></td>
                <td>${data.count}</td>
                <td class="amount-income">${formatCurrency(data.income)}</td>
                <td class="amount-expense">${formatCurrency(data.expense)}</td>
                <td class="${data.income - data.expense >= 0 ? 'amount-income' : 'amount-expense'}">
                  ${formatCurrency(data.income - data.expense)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>
      <h2 class="section-title">Detalle de Transacciones</h2>
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Método</th>
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
