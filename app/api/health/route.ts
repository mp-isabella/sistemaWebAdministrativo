/* import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/database"

export async function GET() {
  try {
    const dbConnected = await checkDatabaseConnection()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
 */