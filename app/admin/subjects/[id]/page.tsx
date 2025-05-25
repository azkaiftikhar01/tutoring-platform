"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

type Subject = {
  id: string
  name: string
  description: string | null
  price: number
  sessionMode: string[]
  location: string | null
}

export default function EditSubject({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [sessionModes, setSessionModes] = useState({
    ONLINE: false,
    IN_HOUSE: false,
  })

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`/api/subjects/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch subject")
        }

        const data = await response.json()
        setSubject(data)

        // Set session modes
        setSessionModes({
          ONLINE: data.sessionMode.includes("ONLINE"),
          IN_HOUSE: data.sessionMode.includes("IN_HOUSE"),
        })
      } catch (error) {
        setError("Failed to load subject")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubject()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const location = formData.get("location") as string

    // Get selected session modes
    const modes = Object.entries(sessionModes)
      .filter(([_, isChecked]) => isChecked)
      .map(([mode]) => mode)

    if (modes.length === 0) {
      setError("Please select at least one session mode")
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/subjects/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price,
          sessionMode: modes,
          location: modes.includes("IN_HOUSE") ? location : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update subject")
      }

      router.push("/admin/subjects")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update subject")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex justify-center items-center h-64">
          <p>Loading subject...</p>
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error || "Subject not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Subject</h1>
        <p className="text-muted-foreground">Update subject details</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>Update the details for this tutoring subject</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input id="name" name="name" defaultValue={subject.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} defaultValue={subject.description || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={subject.price} required />
            </div>
            <div className="space-y-2">
              <Label>Session Mode</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online"
                    checked={sessionModes.ONLINE}
                    onCheckedChange={(checked) => setSessionModes({ ...sessionModes, ONLINE: checked === true })}
                  />
                  <Label htmlFor="online" className="font-normal">
                    Online
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-house"
                    checked={sessionModes.IN_HOUSE}
                    onCheckedChange={(checked) => setSessionModes({ ...sessionModes, IN_HOUSE: checked === true })}
                  />
                  <Label htmlFor="in-house" className="font-normal">
                    In-House
                  </Label>
                </div>
              </div>
            </div>
            {sessionModes.IN_HOUSE && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={subject.location || "Chaklala Scheme 3"} required />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/subjects")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
