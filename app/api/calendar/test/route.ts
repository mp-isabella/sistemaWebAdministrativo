import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "No autorizado",
        session: null
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "API funcionando correctamente",
      session: {
        user: {
          id: (session as any).user?.id,
          name: (session as any).user?.name,
          email: (session as any).user?.email,
          role: (session as any).user?.role
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error en test endpoint:", error)
    return NextResponse.json({ 
      success: false,
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
