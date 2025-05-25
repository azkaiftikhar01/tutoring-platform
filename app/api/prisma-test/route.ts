import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as result`

    return NextResponse.json({
      status: "success",
      message: "Prisma is working correctly",
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Prisma test error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Prisma connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
