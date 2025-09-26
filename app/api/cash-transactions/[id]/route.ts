import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const transaction = await prisma.cashTransaction.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { name: true, email: true }
                }
            }
        })

        if (!transaction) {
            return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
        }

        return NextResponse.json(transaction)
    } catch (error) {
        console.error('Error fetching transaction:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { amount, description, category, paymentMethod, reference, date, type } = body

        // Validaciones
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

        // Verificar que la transacción existe
        const existingTransaction = await prisma.cashTransaction.findUnique({
            where: { id }
        })

        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
        }

        // Actualizar la transacción
        const updatedTransaction = await prisma.cashTransaction.update({
            where: { id },
            data: {
                amount: parseFloat(amount),
                description,
                category,
                paymentMethod,
                reference: reference || null,
                date: date ? new Date(date) : new Date(),
                type: type as 'INCOME' | 'EXPENSE'
            },
            include: {
                createdBy: {
                    select: { name: true, email: true }
                }
            }
        })

        return NextResponse.json(updatedTransaction)
    } catch (error) {
        console.error('Error updating transaction:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params

        // Verificar que la transacción existe
        const existingTransaction = await prisma.cashTransaction.findUnique({
            where: { id }
        })

        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
        }

        // Eliminar la transacción
        await prisma.cashTransaction.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Transacción eliminada correctamente',
            success: true
        })
    } catch (error) {
        console.error('Error deleting transaction:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
