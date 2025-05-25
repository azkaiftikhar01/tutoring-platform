import { PrismaClient } from "@prisma/client"

// Log that we're initializing Prisma
console.log("Initializing Prisma client...")

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

console.log("Prisma client initialized successfully")

// Export both as default and named export
export { prisma }
export default prisma
