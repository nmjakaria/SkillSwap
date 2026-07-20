import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"
import { jwt } from "better-auth/plugins"

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

let clientPromise: Promise<MongoClient>

if (!globalWithMongo._mongoClient) {
  globalWithMongo._mongoClient = new MongoClient(mongoUri)
  globalWithMongo._mongoClientPromise = globalWithMongo._mongoClient.connect()
}

clientPromise = globalWithMongo._mongoClientPromise!

// Resolved synchronously after the first connect; safe because better-auth
// calls into MongoDB lazily after the server is fully booted.
const client = globalWithMongo._mongoClient
const db = client.db(mongoDbName)

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    dbName: mongoDbName,
  } as any),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt() // Enables JWT generation and JWKS endpoint
  ],
})

