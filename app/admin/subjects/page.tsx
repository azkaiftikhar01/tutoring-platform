import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import { SubjectsTable } from "./subjects-table"

export default async function AdminSubjects() {
  // Fetch subjects from database
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container px-4 py-6 md:px-6 md:py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">Manage tutoring subjects</p>
        </div>
        <Link href="/admin/subjects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </Link>
      </div>
      <SubjectsTable subjects={subjects} />
    </div>
  )
}
