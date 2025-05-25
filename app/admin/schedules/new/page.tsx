"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Subject = {
  id: string
  name: string
}

export default function NewSchedule() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects")

        if (!response.ok) {
          throw new Error("Failed to fetch subjects")
        }

        const data = await response.json()
        setSubjects(data)
      } catch (error) {
        setError("Failed to load subjects")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const subjectId = formData.get("subjectId") as string
    const date = formData.get("date") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string

    if (!subjectId) {
      setError("Please select a subject")
      setIsSaving(false)
      return
    }

    // Combine date and time
    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)

    // Validate times
    if (endDateTime <= startDateTime) {
      setError("End time must be after start time")
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create schedule")
      }

      router.push("/admin/schedules")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create schedule")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex justify-center items-center h-64">
          <p>Loading subjects...</p>
        </div>
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <p>No subjects found. Please create a subject first.</p>
          <Button onClick={() => router.push("/admin/subjects/new")}>Create Subject</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Schedule</h1>
        <p className="text-muted-foreground">Create a new tutoring schedule</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>Enter the details for the new tutoring schedule</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select name="subjectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="time" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/schedules")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Schedule"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
