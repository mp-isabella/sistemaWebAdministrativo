import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Filtros combinados
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const paymentMethod = searchParams.get('paymentMethod')
    const technicianId = searchParams.get('technicianId')
    const clientId = searchParams.get('clientId')
    const company = searchParams.get('company')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const groupBy = searchParams.get('groupBy') || 'none' // none, category, paymentMethod, technician, client, date
    const exportFormat = searchParams.get('exportFormat') // pdf, excel

    // Build where clause
    const where: any = {}
    
    if (type) where.type = type
    if (category) where.category = category
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    // Include relations for filtering
    const include = {
      createdBy: {
        select: { name: true, email: true }
      }
    }

    // Get transactions with filters
    const transactions = await prisma.cashTransaction.findMany({
      where,
      include,
      orderBy: { date: 'desc' }
    })

    // Apply additional filters that require joins
    let filteredTransactions = transactions

    if (technicianId) {
      filteredTransactions = filteredTransactions.filter(t => t.createdById === technicianId)
    }

    if (clientId || company) {
      // For cash transactions, we need to check if they're related to jobs with specific clients
      // This would require additional logic based on your business rules
      // For now, we'll filter by the transaction creator if they're related to specific clients
    }

    // Calculate totals
    const totals: {
      total: number;
      income: number;
      expense: number;
      count: number;
      balance: number;
    } = {
      total: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      income: filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      expense: filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
      count: filteredTransactions.length,
      balance: 0
    }

    totals.balance = totals.income - totals.expense

    // Group data based on groupBy parameter
    let groupedData = null

    if (groupBy !== 'none') {
      const groups: any = {}

      filteredTransactions.forEach(transaction => {
        let key = ''

        switch (groupBy) {
          case 'category':
            key = transaction.category
            break
          case 'paymentMethod':
            key = transaction.paymentMethod
            break
          case 'technician':
            key = transaction.createdBy.name || 'Sin nombre'
            break
          case 'date':
            key = transaction.date.toISOString().split('T')[0] // YYYY-MM-DD
            break
          case 'month':
            key = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`
            break
          default:
            key = 'Sin agrupar'
        }

        if (!groups[key]) {
          groups[key] = {
            key,
            transactions: [],
            total: 0,
            income: 0,
            expense: 0,
            count: 0
          }
        }

        groups[key].transactions.push(transaction)
        groups[key].total += transaction.amount
        groups[key].count += 1

        if (transaction.type === 'INCOME') {
          groups[key].income += transaction.amount
        } else {
          groups[key].expense += transaction.amount
        }
      })

      // Calculate balance for each group
      Object.values(groups).forEach((group: any) => {
        group.balance = group.income - group.expense
      })

      groupedData = Object.values(groups)
    }

    // Prepare response data
    const responseData: any = {
      transactions: filteredTransactions,
      summary: totals,
      groupedData,
      filters: {
        type,
        category,
        paymentMethod,
        technicianId,
        clientId,
        company,
        dateFrom,
        dateTo,
        groupBy
      },
      metadata: {
        totalRecords: filteredTransactions.length,
        dateRange: {
          from: dateFrom,
          to: dateTo
        },
        generatedAt: new Date().toISOString()
      }
    }

    // If export format is requested, prepare for export
    if (exportFormat === 'pdf') {
      // Add PDF-specific data structure
      responseData.exportData = {
        format: 'pdf',
        title: 'Reporte de Transacciones de Caja',
        subtitle: `Generado el ${new Date().toLocaleDateString('es-CL')}`,
        filters: responseData.filters,
        summary: responseData.summary,
        transactions: responseData.transactions.slice(0, 100) // Limit for PDF
      }
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error generating cash transaction report:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
