import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { jwt } from "better-auth/plugins"

// Vercel serverless functions occasionally fail to resolve MongoDB Atlas's
// SRV DNS records with the default resolver. If you were seeing intermittent
// "querySrv ENOTFOUND" or similar connection errors in production, this fixes it.
// Remove this block if you were never actually hitting that error.
import dns from "node:dns"
dns.setServers(["8.8.8.8", "8.8.4.4"])

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error("MONGODB_URI is not set in environment variables")
}

const mongoDbName = process.env.MONGODB_DB_NAME || "skillswap_bd"

// Global caching for MongoClient to prevent connection exhaustion in serverless environments.
// Applied to BOTH production and development to avoid new connections on every cold start.
const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient
  _mongoClientPromise?: Promise<MongoClient>
}

if (!globalWithMongo._mongoClient) {
  globalWithMongo._mongoClient = new MongoClient(mongoUri)
  globalWithMongo._mongoClientPromise = globalWithMongo._mongoClient.connect()
}

const clientPromise = globalWithMongo._mongoClientPromise!
const client = globalWithMongo._mongoClient
const db = client.db(mongoDbName)

// Build the trusted origins list.
// BETTER_AUTH_TRUSTED_ORIGINS is a comma-separated list of allowed origins,
// e.g. "https://yourapp.vercel.app,https://custom-domain.com"
const trustedOrigins = [
  process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
]

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 5 * 24 * 60 * 60, // 5 Days
    },
  },
  plugins: [
    jwt(), // Enables JWT generation and JWKS endpoint
  ],
})

// Exported for cases where you need to await a fully-connected client elsewhere
// (e.g. scripts or other modules), since `client` above may still be connecting.
export { clientPromise }