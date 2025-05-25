"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen, LogOut } from "lucide-react"
import { clientLogout } from "@/lib/auth-client"

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await clientLogout()
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg font-bold">Tutoring Platform</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium ${pathname === "/admin/dashboard" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/subjects"
                className={`text-sm font-medium ${pathname === "/admin/subjects" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                Subjects
              </Link>
              <Link
                href="/admin/schedules"
                className={`text-sm font-medium ${pathname === "/admin/schedules" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                Schedules
              </Link>
              <Link
                href="/admin/bookings"
                className={`text-sm font-medium ${pathname === "/admin/bookings" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                Bookings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`text-sm font-medium ${pathname === "/" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                Home
              </Link>
              <Link
                href="/subjects"
                className={`text-sm font-medium ${pathname === "/subjects" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                Subjects
              </Link>
              <Link
                href="/bookings"
                className={`text-sm font-medium ${pathname === "/bookings" ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`}
              >
                My Bookings
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {(isAdmin || pathname.includes("/bookings")) && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
