import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const whereClause: any = {}
    
    if (year && month) {
      // Filtrar por mes y año específicos
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      whereClause.date = {
        gte: startDate,
        lte: endDate
      }
    } else if (year) {
      // Filtrar por año completo
      const startDate = new Date(parseInt(year), 0, 1)
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
      
      whereClause.date = {
        gte: startDate,
        lte: endDate
      }
    }

    // Obtener transacciones agrupadas por mes
    const transactions = await prisma.cashTransaction.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        type: true,
        date: true,
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calcular estadísticas mensuales
    const monthlyStats = new Map<string, {
      month: string
      year: number
      income: number
      expense: number
      balance: number
      transactionCount: number
    }>()

    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = months[date.getMonth()] || "Mes Desconocido"
      
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthName,
          year: date.getFullYear(),
          income: 0,
          expense: 0,
          balance: 0,
          transactionCount: 0
        })
      }

      const stats = monthlyStats.get(monthKey)!
      stats.transactionCount++

      if (transaction.type === 'INCOME') {
        stats.income += transaction.amount
      } else {
        stats.expense += transaction.amount
      }

      stats.balance = stats.income - stats.expense
    })

    const result = Array.from(monthlyStats.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return months.indexOf(b.month) - months.indexOf(a.month)
    })

    return NextResponse.json({ monthlyStats: result })

  } catch (error) {
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
