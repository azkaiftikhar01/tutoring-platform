import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import { SchedulesTable } from "./schedules-table"

export default async function AdminSchedules() {
  // Fetch schedules from database with subject info
  const schedules = await prisma.schedule.findMany({
    include: {
      subject: true,
    },
    orderBy: { startTime: "asc" },
  })

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">Manage tutoring schedules</p>
        </div>
        <Link href="/admin/schedules/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </Link>
      </div>
      <SchedulesTable schedules={schedules} />
    </div>
  )
}
