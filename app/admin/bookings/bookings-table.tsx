"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type Booking = {
  id: string
  sessionType: string
  location: string | null
  status: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  subject: {
    name: string
  }
  schedule: {
    startTime: string
    endTime: string
  }
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      router.refresh()
    } catch (error) {
      console.error("Error updating booking status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                No bookings found.
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.user.name || "N/A"}</div>
                  <div className="text-sm text-muted-foreground">{booking.user.email}</div>
                </TableCell>
                <TableCell>{booking.subject.name}</TableCell>
                <TableCell>
                  <div>{format(new Date(booking.schedule.startTime), "MMM d, yyyy")}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(booking.schedule.startTime), "h:mm a")} -{" "}
                    {format(new Date(booking.schedule.endTime), "h:mm a")}
                  </div>
                </TableCell>
                <TableCell>
                  {booking.sessionType === "ONLINE" ? "Online" : "In-House"}
                  {booking.location && <div className="text-xs text-muted-foreground">{booking.location}</div>}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {booking.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                        disabled={isUpdating}
                      >
                        Confirm
                      </Button>
                    )}
                    {booking.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(booking.id, "CANCELLED")}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
