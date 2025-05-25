"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { CheckCircle, Clock, MapPin, Wifi } from "lucide-react"
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

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID not provided")
      setIsLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch booking")
        }

        const data = await response.json()
        setBooking(data)
      } catch (error) {
        setError("Failed to load booking details")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p>Loading confirmation details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error || "Booking not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
              <CardDescription>Your tutoring session has been successfully booked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-t border-b py-4">
                <h3 className="font-semibold text-lg mb-4">Session Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Subject:</span> {booking.subject.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.schedule.startTime), "MMMM d, yyyy")} at{" "}
                      {format(new Date(booking.schedule.startTime), "h:mm a")} -{" "}
                      {format(new Date(booking.schedule.endTime), "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.sessionType === "ONLINE" ? (
                      <>
                        <Wifi className="h-4 w-4" />
                        <span>Online Session</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>In-House Session at {booking.location}</span>
                      </>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ${booking.subject.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {booking.sessionType === "ONLINE" ? (
                    <>
                      <li>You will receive a confirmation email with a Zoom link for your session.</li>
                      <li>Make sure to test your internet connection and camera before the session.</li>
                      <li>Join the session 5 minutes before the scheduled time.</li>
                    </>
                  ) : (
                    <>
                      <li>You will receive a confirmation email with the address and contact details.</li>
                      <li>The session will take place at {booking.location}.</li>
                      <li>Please arrive 5-10 minutes before your scheduled time.</li>
                    </>
                  )}
                  <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/bookings">
                <Button>View My Bookings</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
