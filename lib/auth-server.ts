import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"

// Secret key for JWT
const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

// Create session (server-side only)
export async function createSession(userId: string, role: string) {
  try {
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
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

// Get session (server-side only)
export async function getServerSession() {
  try {
    const session = cookies().get("session")?.value

    if (!session) return null

    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    })

    return payload
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Check if user is authenticated (server-side only)
export async function checkAuth() {
  try {
    const session = await getServerSession()

    if (!session) {
      redirect("/login")
    }

    return session
  } catch (error) {
    console.error("Error checking auth:", error)
    redirect("/login")
  }
}

// Check if user is admin (server-side only)
export async function checkAdmin() {
  try {
    const session = await getServerSession()

    if (!session || session.role !== "ADMIN") {
      redirect("/login")
    }

    return session
  } catch (error) {
    console.error("Error checking admin:", error)
    redirect("/login")
  }
}

// Logout (server-side only)
export async function logout() {
  try {
    cookies().delete("session")
    redirect("/login")
  } catch (error) {
    console.error("Error logging out:", error)
    redirect("/login")
  }
}
