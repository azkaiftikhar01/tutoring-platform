"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewSubject() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sessionModes, setSessionModes] = useState({
    ONLINE: false,
    IN_HOUSE: false,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
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
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
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
        throw new Error(data.message || "Failed to create subject")
      }

      router.push("/admin/subjects")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create subject")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Subject</h1>
        <p className="text-muted-foreground">Create a new tutoring subject</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>Enter the details for the new tutoring subject</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required />
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
                <Input id="location" name="location" defaultValue="Chaklala Scheme 3" required />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/subjects")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Subject"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
