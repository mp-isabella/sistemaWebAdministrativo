import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Asegurar que la sesión tenga la estructura correcta
    if (session && (session as any).user) {
      return NextResponse.json({
        user: {
          id: (session as any).user.id || null,
          name: (session as any).user.name || null,
          email: (session as any).user.email || null,
          role: (session as any).user.role || null,
        },
        expires: (session as any).expires || null,
      })
    }

    return NextResponse.json(null)
  } catch (error) {

    return NextResponse.json(null)
  }
}
