import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { name, description, price, currency, sessionMode, location, teachers } = await request.json()

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        price,
        currency,
        sessionMode,
        location,
        teachers: teachers && teachers.length > 0 ? {
          create: teachers.map((t: any) => ({
            name: t.name,
            phone: t.phone,
            experience: t.experience,
          })),
        } : undefined,
      },
      include: {
        teachers: true,
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teachers: true,
      },
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
