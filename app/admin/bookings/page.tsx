import { prisma } from "@/lib/prisma"
import { BookingsTable } from "./bookings-table"

export default async function AdminBookings() {
  // Fetch bookings from database with related data
  const bookings = await prisma.booking.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      subject: {
        select: {
          name: true,
        },
      },
      schedule: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage tutoring bookings</p>
      </div>
      <BookingsTable bookings={bookings} />
    </div>
  )
}
