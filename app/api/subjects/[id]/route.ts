import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        schedules: true,
        teachers: true,
      },
    })

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error("Error fetching subject:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { name, description, price, sessionMode, location } = await request.json()

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        description,
        price,
        sessionMode,
        location,
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error("Error updating subject:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Delete all schedules associated with the subject
    await prisma.schedule.deleteMany({
      where: { subjectId: id },
    })

    // Delete the subject
    await prisma.subject.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Subject deleted successfully" })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
