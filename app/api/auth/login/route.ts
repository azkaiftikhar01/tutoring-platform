import { NextResponse } from "next/server"
import { comparePassword } from "@/lib/auth"
import { createSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password, isAdmin } = await request.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is admin when trying to access admin panel
    if (isAdmin && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized access" }, { status: 403 })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    await createSession(user.id, user.role)

    return NextResponse.json({ message: "Login successful" })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
