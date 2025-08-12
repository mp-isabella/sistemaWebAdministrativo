import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (type) where.type = type
    if (category) where.category = category
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          createdBy: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.cashTransaction.count({ where })
    ])

    // Calculate totals
    const totals = await prisma.cashTransaction.aggregate({
      where,
      _sum: {
        amount: true
      }
    })

    const incomeTotal = await prisma.cashTransaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true }
    })

    const expenseTotal = await prisma.cashTransaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true }
    })

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total: totals._sum.amount || 0,
        income: incomeTotal._sum.amount || 0,
        expense: expenseTotal._sum.amount || 0,
        balance: (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0)
      }
    })

  } catch (error) {
    console.error('Error fetching cash transactions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, category, paymentMethod, reference, date, type } = body

    // Validation
    if (!amount || !description || !category || !paymentMethod || !type) {
      return NextResponse.json({ 
        error: 'Campos requeridos: amount, description, category, paymentMethod, type' 
      }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json({ error: 'Tipo debe ser INCOME o EXPENSE' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const transaction = await prisma.cashTransaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        category,
        paymentMethod,
        reference: reference || null,
        date: date ? new Date(date) : new Date(),
        type: type as 'INCOME' | 'EXPENSE',
        createdById: user.id
      },
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ transaction }, { status: 201 })

  } catch (error) {
    console.error('Error creating cash transaction:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
