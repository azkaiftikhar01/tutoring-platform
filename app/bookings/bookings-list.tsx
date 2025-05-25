"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Wifi } from "lucide-react"
import { format } from "date-fns"

type Booking = {
  id: string
  sessionType: string
  location: string | null
  status: string
  subject: {
    name: string
    price: number
  }
  schedule: {
    startTime: string
    endTime: string
  }
}

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings")

        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const data = await response.json()
        setBookings(data)
      } catch (error) {
        setError("Failed to load bookings")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading your bookings...</p>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm mb-4">{error}</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No bookings found</h2>
        <p className="text-muted-foreground mb-6">You haven't booked any tutoring sessions yet.</p>
        <Link href="/subjects">
          <Button>Browse Subjects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{booking.subject.name}</CardTitle>
              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
            </div>
            <CardDescription>
              {booking.sessionType === "ONLINE" ? "Online Session" : "In-House Session"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(booking.schedule.startTime), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(booking.schedule.startTime), "h:mm a")} -{" "}
                {format(new Date(booking.schedule.endTime), "h:mm a")}
              </span>
            </div>
            {booking.sessionType === "IN_HOUSE" && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{booking.location}</span>
              </div>
            )}
            {booking.sessionType === "ONLINE" && (
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span>Check your email for the Zoom link</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href={`/bookings/${booking.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
