import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 Validando token de restablecimiento...");

    // Buscar usuario con el token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token no expirado
        },
      },
    });

    if (!user) {
      console.log("❌ Token no válido o expirado");
      return NextResponse.json(
        { error: "Token de restablecimiento no válido o expirado" },
        { status: 400 }
      );
    }

    console.log("✅ Token válido para usuario:", user.email);

    return NextResponse.json(
      { message: "Token válido" },
      { status: 200 }
    );

  } catch (error) {
    console.error("💥 Error al validar token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
