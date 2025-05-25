const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Log environment for debugging
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("VERCEL:", process.env.VERCEL)

// Function to run a command and log output
function runCommand(command) {
  console.log(`Running: ${command}`)
  try {
    execSync(command, { stdio: "inherit" })
    console.log(`Successfully ran: ${command}`)
    return true
  } catch (error) {
    console.error(`Error running ${command}:`, error.message)
    return false
  }
}

// Ensure the Prisma directory exists
const prismaDir = path.join(process.cwd(), "node_modules", ".prisma")
if (!fs.existsSync(prismaDir)) {
  console.log("Creating .prisma directory")
  fs.mkdirSync(prismaDir, { recursive: true })
}

// Generate Prisma Client
console.log("Generating Prisma Client...")
const generateSuccess = runCommand("npx prisma generate")
if (!generateSuccess) {
  console.error("Failed to generate Prisma Client")
  process.exit(1)
}

// Push schema to database in production
if (process.env.NODE_ENV === "production") {
  console.log("Pushing schema to database...")
  const pushSuccess = runCommand("npx prisma db push --accept-data-loss")
  if (!pushSuccess) {
    console.error("Failed to push schema to database")
    process.exit(1)
  }
}

// Build Next.js application
console.log("Building Next.js application...")
const buildSuccess = runCommand("next build")
if (!buildSuccess) {
  console.error("Failed to build Next.js application")
  process.exit(1)
}

console.log("Build completed successfully")
