import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Testing Prisma connection...")

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("Prisma query result:", result)

    return NextResponse.json({
      status: "success",
      message: "Prisma is working correctly",
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error("Prisma test error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Prisma connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
