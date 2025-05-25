"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { getClientSession } from "@/lib/auth-client"

type Subject = {
  id: string
  name: string
  description: string | null
  price: number
  sessionMode: string[]
  location: string | null
}

type Schedule = {
  id: string
  startTime: string
  endTime: string
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectId = searchParams.get("subjectId")
  const scheduleId = searchParams.get("scheduleId")

  const [subject, setSubject] = useState<Subject | null>(null)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [sessionType, setSessionType] = useState<string>("ONLINE")
  const [city, setCity] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getClientSession()
      setIsLoggedIn(!!session)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!subjectId || !scheduleId) {
      setError("Missing required parameters")
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Fetch subject
        const subjectResponse = await fetch(`/api/subjects/${subjectId}`)
        if (!subjectResponse.ok) {
          throw new Error("Failed to fetch subject")
        }
        const subjectData = await subjectResponse.json()
        setSubject(subjectData)

        // Fetch schedule
        const scheduleResponse = await fetch(`/api/schedules/${scheduleId}`)
        if (!scheduleResponse.ok) {
          throw new Error("Failed to fetch schedule")
        }
        const scheduleData = await scheduleResponse.json()
        setSchedule(scheduleData)

        // Set default session type
        if (subjectData.sessionMode.length === 1) {
          setSessionType(subjectData.sessionMode[0])
        }
      } catch (error) {
        setError("Failed to load booking details")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [subjectId, scheduleId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isLoggedIn) {
      router.push(`/login?redirect=/booking?subjectId=${subjectId}&scheduleId=${scheduleId}`)
      return
    }

    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const notes = formData.get("notes") as string

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId,
          scheduleId,
          sessionType,
          location: sessionType === "IN_HOUSE" ? subject?.location : null,
          name,
          email,
          phone,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking")
      }

      router.push(`/booking/confirmation?id=${data.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!subject || !schedule) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error || "Booking details not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground">Complete your booking details</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Subject</h3>
                <p>{subject.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Date & Time</h3>
                <p>
                  {format(new Date(schedule.startTime), "MMMM d, yyyy")}
                  <br />
                  {format(new Date(schedule.startTime), "h:mm a")} - {format(new Date(schedule.endTime), "h:mm a")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Price</h3>
                <p>${subject.price.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>Please fill in your details to complete the booking</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">{error}</div>}
                {!isLoggedIn && (
                  <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-md text-sm">
                    You need to be logged in to complete your booking. You will be redirected to login.
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" required />
                </div>
                {subject.sessionMode.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        {subject.sessionMode.includes("ONLINE") && <SelectItem value="ONLINE">Online</SelectItem>}
                        {subject.sessionMode.includes("IN_HOUSE") && <SelectItem value="IN_HOUSE">In-House</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {sessionType === "IN_HOUSE" && (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={city} onValueChange={setCity} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                        <SelectItem value="islamabad">Islamabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Complete Booking"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
