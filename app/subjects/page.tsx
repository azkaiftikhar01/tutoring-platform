"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

type Subject = {
  id: string
  name: string
  description: string | null
  price: number
  sessionMode: string[]
  location: string | null
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sessionType, setSessionType] = useState("all")
  const [city, setCity] = useState("all")

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects")

        if (!response.ok) {
          throw new Error("Failed to fetch subjects")
        }

        const data = await response.json()
        setSubjects(data)
        setFilteredSubjects(data)
      } catch (error) {
        setError("Failed to load subjects")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  useEffect(() => {
    // Filter subjects based on search query, session type, and city
    let filtered = subjects

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by session type
    if (sessionType !== "all") {
      filtered = filtered.filter((subject) =>
        subject.sessionMode.includes(sessionType === "online" ? "ONLINE" : "IN_HOUSE"),
      )
    }

    // Filter by city (only applies to in-house sessions)
    if (city !== "all" && sessionType !== "online") {
      filtered = filtered.filter(
        (subject) =>
          subject.sessionMode.includes("IN_HOUSE") &&
          subject.location &&
          subject.location.includes("Chaklala Scheme 3"),
      )
    }

    setFilteredSubjects(filtered)
  }, [subjects, searchQuery, sessionType, city])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string
    setSearchQuery(query)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container px-4 py-6 md:px-6 md:py-10">
          <div className="flex justify-center items-center h-64">
            <p>Loading subjects...</p>
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
          <h1 className="text-3xl font-bold">Browse Subjects</h1>
          <p className="text-muted-foreground">Find the perfect tutoring subject for you</p>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Filter Subjects</CardTitle>
              <CardDescription>Find subjects based on your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Input name="query" placeholder="Search subjects..." defaultValue={searchQuery} />
                </div>
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-house">In-House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {sessionType !== "online" && (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                        <SelectItem value="islamabad">Islamabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {error && <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm mb-4">{error}</div>}

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No subjects found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters to find subjects.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>
                    {subject.sessionMode.includes("ONLINE") && subject.sessionMode.includes("IN_HOUSE")
                      ? "Online & In-House"
                      : subject.sessionMode.includes("ONLINE")
                        ? "Online Only"
                        : "In-House Only"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{subject.description || "No description available."}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">${subject.price.toFixed(2)}</p>
                    {subject.sessionMode.includes("IN_HOUSE") && (
                      <p className="text-xs text-muted-foreground">Location: {subject.location}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/subjects/${subject.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
