"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { DatePicker } from "@/components/date-picker"
import { format } from "date-fns"
import { Clock, MapPin, Wifi } from "lucide-react"

type Teacher = {
  id: string
  name: string
  phone: string
  experience: string
}

type Subject = {
  id: string
  name: string
  description: string | null
  price: number | null
  currency: string | null
  sessionMode: string[]
  location: string | null
  schedules: Schedule[]
  teachers: Teacher[]
}

type Schedule = {
  id: string
  startTime: string
  endTime: string
}

export default function SubjectDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableSlots, setAvailableSlots] = useState<Schedule[]>([])

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`/api/subjects/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch subject")
        }

        const data = await response.json()
        setSubject(data)
      } catch (error) {
        setError("Failed to load subject")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubject()
  }, [params.id])

  useEffect(() => {
    if (subject && selectedDate) {
      // Filter schedules for the selected date
      const slots = subject.schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.startTime)
        return (
          scheduleDate.getDate() === selectedDate.getDate() &&
          scheduleDate.getMonth() === selectedDate.getMonth() &&
          scheduleDate.getFullYear() === selectedDate.getFullYear()
        )
      })
      setAvailableSlots(slots)
    } else {
      setAvailableSlots([])
    }
  }, [subject, selectedDate])

  const handleBooking = (scheduleId: string) => {
    router.push(`/booking?subjectId=${subject?.id}&scheduleId=${scheduleId}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p>Loading subject details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error || "Subject not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  // Get all dates that have schedules
  const scheduleDates = subject.schedules.map((schedule) => {
    const date = new Date(schedule.startTime)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  })

  // Remove duplicates and ensure stable dates
  const uniqueDates = Array.from(
    new Set(scheduleDates.map((date) => date.toISOString().split('T')[0]))
  ).map((dateString) => new Date(dateString))

  // Create a stable today date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayString = today.toISOString().split('T')[0]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{subject.name}</h1>
          <p className="text-muted-foreground">
            {subject.sessionMode.includes("ONLINE") && subject.sessionMode.includes("IN_HOUSE")
              ? "Online & In-House"
              : subject.sessionMode.includes("ONLINE")
                ? "Online Only"
                : "In-House Only"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subject Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p>{subject.description || "No description available."}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Price</h3>
                <p className="text-lg">
                  {subject.price != null && subject.currency
                    ? `${subject.price} ${subject.currency}`
                    : subject.price != null
                      ? `${subject.price}`
                      : "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Session Types</h3>
                <div className="flex flex-col gap-2">
                  {subject.sessionMode.includes("ONLINE") && (
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span>Online</span>
                    </div>
                  )}
                  {subject.sessionMode.includes("IN_HOUSE") && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>In-House at {subject.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Teachers</h3>
                {subject.teachers && subject.teachers.length > 0 ? (
                  <ul className="space-y-2">
                    {subject.teachers.map((teacher) => (
                      <li key={teacher.id} className="border rounded p-2">
                        <div><span className="font-semibold">Name:</span> {teacher.name}</div>
                        <div><span className="font-semibold">Phone:</span> {teacher.phone}</div>
                        <div><span className="font-semibold">Experience:</span> {teacher.experience}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No teachers listed for this subject.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
              <CardDescription>Select a date to see available time slots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DatePicker
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  // Disable dates in the past
                  if (date < today) return true

                  // Disable dates that don't have schedules
                  return !uniqueDates.some(
                    (scheduleDate) =>
                      scheduleDate.getDate() === date.getDate() &&
                      scheduleDate.getMonth() === date.getMonth() &&
                      scheduleDate.getFullYear() === date.getFullYear(),
                  )
                }}
                className="rounded-md border"
              />

              {selectedDate && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Available Slots for {format(selectedDate, "MMMM d, yyyy")}</h3>
                  {availableSlots.length === 0 ? (
                    <p>No available slots for this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {availableSlots.map((slot) => (
                        <Card key={slot.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(slot.startTime), "h:mm a")} -{" "}
                                {format(new Date(slot.endTime), "h:mm a")}
                              </span>
                            </div>
                            <Button onClick={() => handleBooking(slot.id)}>Book</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
