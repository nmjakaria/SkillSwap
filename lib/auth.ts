import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"
import { jwt } from "better-auth/plugins"

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  throw new Error("MONGODB_URI is not set in environment variables")
}

const mongoDbName = process.env.MONGODB_DB_NAME || "skillswap_bd"

// Create MongoClient without expecting database name in the connection string path
const client = new MongoClient(mongoUri)
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
