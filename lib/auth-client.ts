// Secret key for JWT
const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

// Get session (client-side)
export async function getClientSession() {
  try {
    const response = await fetch("/api/auth/session", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return null
      }
      throw new Error("Failed to fetch session")
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Session fetch error:", error)
    return null
  }
}

// Client-side logout
export async function clientLogout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error("Failed to logout")
    }
    
    window.location.href = "/login"
  } catch (error) {
    console.error("Logout error:", error)
  }
}
