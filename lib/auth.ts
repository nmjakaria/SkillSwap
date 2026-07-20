import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"
import { jwt } from "better-auth/plugins"

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error("MONGODB_URI is not set in environment variables")
}

const mongoDbName = process.env.MONGODB_DB_NAME || "skillswap_bd"

// Global caching for MongoClient to prevent connection exhaustion in serverless environments
let client: MongoClient
let db: any

const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient
  _mongoDb?: any
}

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(mongoUri)
  db = client.db(mongoDbName)
} else {
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(mongoUri)
    globalWithMongo._mongoDb = globalWithMongo._mongoClient.db(mongoDbName)
  }
  client = globalWithMongo._mongoClient
  db = globalWithMongo._mongoDb
}

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

