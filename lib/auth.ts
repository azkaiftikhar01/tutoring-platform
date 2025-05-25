import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"

// Secret key for JWT
const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

// Hash password
export async function hashPassword(password: string) {
  return hash(password, 10)
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

// Create session (server-side only)
export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const session = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt.getTime() / 1000)
    .sign(key)

  cookies().set("session", session, {
    httpOnly: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })

  return session
}

// Get session (client-side compatible)
export async function getSession() {
  // This function will be used on the server
  if (typeof window === "undefined") {
    const session = cookies().get("session")?.value

    if (!session) return null

    try {
      const { payload } = await jwtVerify(session, key, {
        algorithms: ["HS256"],
      })

      return payload
    } catch (error) {
      return null
    }
  }

  // For client components, we'll use an API endpoint
  try {
    const response = await fetch("/api/auth/session")
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    return null
  }
}

// Check if user is authenticated (server-side only)
export async function checkAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

// Check if user is admin (server-side only)
export async function checkAdmin() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  return session
}

// Logout (server-side only)
export async function logout() {
  cookies().delete("session")
  redirect("/login")
}
