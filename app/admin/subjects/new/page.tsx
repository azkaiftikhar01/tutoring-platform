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
  const [teachers, setTeachers] = useState<{
    name: string;
    phone: string;
    experience: string;
    [key: string]: string;
  }[]>([
    { name: "", phone: "", experience: "" },
  ])
  const [currency, setCurrency] = useState("")

  const handleTeacherChange = (index: number, field: string, value: string) => {
    setTeachers((prev) => {
      const updated = [...prev]
      updated[index][field] = value
      return updated
    })
  }

  const addTeacher = () => {
    setTeachers((prev) => [...prev, { name: "", phone: "", experience: "" }])
  }

  const removeTeacher = (index: number) => {
    setTeachers((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const priceValue = formData.get("price") as string
    const price = priceValue ? Number.parseFloat(priceValue) : undefined
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

    // Filter out empty teachers
    const filteredTeachers = teachers.filter(t => t.name || t.phone || t.experience)

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
          currency: currency || undefined,
          sessionMode: modes,
          location: modes.includes("IN_HOUSE") ? location : null,
          teachers: filteredTeachers,
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
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="Enter price (optional)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" name="currency" className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="">Select currency (optional)</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="PKR">PKR</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CNY">CNY</option>
                <option value="JPY">JPY</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Session Mode</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online"
                    checked={sessionModes.ONLINE}
                    onCheckedChange={(checked: boolean | "indeterminate") => setSessionModes({ ...sessionModes, ONLINE: checked === true })}
                  />
                  <Label htmlFor="online" className="font-normal">
                    Online
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-house"
                    checked={sessionModes.IN_HOUSE}
                    onCheckedChange={(checked: boolean | "indeterminate") => setSessionModes({ ...sessionModes, IN_HOUSE: checked === true })}
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
            <div className="space-y-2">
              <Label>Teachers</Label>
              {teachers.map((teacher, idx) => (
                <div key={idx} className="border p-3 rounded mb-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Name"
                      value={teacher.name}
                      onChange={e => handleTeacherChange(idx, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      value={teacher.phone}
                      onChange={e => handleTeacherChange(idx, "phone", e.target.value)}
                    />
                    <Input
                      placeholder="Experience"
                      value={teacher.experience}
                      onChange={e => handleTeacherChange(idx, "experience", e.target.value)}
                    />
                    {teachers.length > 1 && (
                      <Button type="button" variant="destructive" onClick={() => removeTeacher(idx)}>-</Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTeacher}>Add Teacher</Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/subjects")}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Subject"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
