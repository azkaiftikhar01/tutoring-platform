import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { BookingsList } from "./bookings-list"
import { checkAuth } from "@/lib/auth-server"

export default async function BookingsPage() {
  // Check if user is authenticated
  await checkAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your tutoring sessions</p>
        </div>

        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading your bookings...</div>}>
          <BookingsList />
        </Suspense>
      </div>
    </div>
  )
}
