import type React from "react"
import { Navbar } from "@/components/navbar"
import { checkAdmin } from "@/lib/auth-server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is admin
  await checkAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAdmin={true} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
