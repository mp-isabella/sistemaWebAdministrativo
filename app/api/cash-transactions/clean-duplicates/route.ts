import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admin puede limpiar duplicados
    const userRole = (session.user as any).role?.toLowerCase()
    if (!["admin", "administrador"].includes(userRole)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    // Obtener todas las transacciones
    const allTransactions = await prisma.cashTransaction.findMany({
      orderBy: { createdAt: 'asc' }
    })

    // Agrupar por reference y type
    const grouped = allTransactions.reduce((acc: any, transaction) => {
      const key = `${transaction.reference}-${transaction.type}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(transaction)
      return acc
    }, {})

    let duplicatesRemoved = 0
    const duplicatesToRemove: string[] = []

    // Para cada grupo, mantener solo el primero (más antiguo)
    Object.values(grouped).forEach((group: any) => {
      if (group.length > 1) {
        // Ordenar por fecha de creación (más antiguo primero)
        group.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        // Marcar todos excepto el primero para eliminar
        for (let i = 1; i < group.length; i++) {
          duplicatesToRemove.push(group[i].id)
          duplicatesRemoved++
        }
      }
    })

    // Eliminar duplicados
    if (duplicatesToRemove.length > 0) {
      await prisma.cashTransaction.deleteMany({
        where: {
          id: {
            in: duplicatesToRemove
          }
        }
      })
    }

    return NextResponse.json({
      message: `Se eliminaron ${duplicatesRemoved} transacciones duplicadas`,
      duplicatesRemoved,
      totalTransactions: allTransactions.length,
      remainingTransactions: allTransactions.length - duplicatesRemoved
    })

  } catch (error) {

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
