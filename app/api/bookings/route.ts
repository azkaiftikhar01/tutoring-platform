import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { subjectId, scheduleId, sessionType, location } = await request.json()

    // Check if the schedule is available
    const existingBooking = await prisma.booking.findFirst({
      where: {
        scheduleId,
        status: { not: "CANCELLED" },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ message: "This time slot is already booked" }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.userId as string,
        subjectId,
        scheduleId,
        sessionType,
        location,
        status: "CONFIRMED",
      },
    })

    // TODO: Send confirmation email with session details

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.userId as string,
      },
      include: {
        subject: true,
        schedule: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
