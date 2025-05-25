import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
      },
    })

    if (!schedule) {
      return NextResponse.json({ message: "Schedule not found" }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { subjectId, startTime, endTime } = await request.json()

    const schedule = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        subjectId,
        startTime,
        endTime,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    await prisma.schedule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Schedule deleted successfully" })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
