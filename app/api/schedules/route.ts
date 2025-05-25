import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { subjectId, startTime, endTime } = await request.json()

    const schedule = await prisma.schedule.create({
      data: {
        subjectId,
        startTime,
        endTime,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        subject: true,
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
