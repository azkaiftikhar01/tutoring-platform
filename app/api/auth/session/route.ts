import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"

export async function GET() {
  try {
    const session = await getServerSession()
    return NextResponse.json(session || null)
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
