import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin puede crear empresas
    if (session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()

    const { 
      name, 
      type, 
      logo, 
      primaryColor, 
      secondaryColor,
      address,
      phone,
      email,
      website,
      taxId
    } = body

    // Validar datos requeridos
    if (!name || !type) {
      return NextResponse.json({ error: "Nombre y tipo de empresa son requeridos" }, { status: 400 })
    }

    // Verificar que el nombre no exista
    const existingCompany = await prisma.company.findFirst({
      where: { name }
    })

    if (existingCompany) {
      return NextResponse.json({ error: "Ya existe una empresa con ese nombre" }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        name,
        type,
        logo,
        primaryColor,
        secondaryColor,
        address,
        phone,
        email,
        website,
        taxId
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
