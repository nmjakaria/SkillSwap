import { authClient } from "@/lib/auth-client"
import { getUserToken } from "./session"

// Shared Types & Interfaces

export interface User {
  _id: string
  name: string
  email: string
  bio?: string
  interests?: string[]
}

export interface Skill {
  _id: string
  title: string
  shortDescription: string
  fullDescription: string
  category: string
  level: string
  availability: string
  imageUrl?: string
  tags: string[]
  ownerId: string
  views: number
  createdAt: string
}

// Request / Response payloads
export interface UpdateProfileRequest {
  bio?: string
  interests?: string[]
}

export interface CreateSkillRequest {
  title: string
  shortDescription: string
  category: string
  level: string
  availability: string
  imageUrl?: string
  fullDescription?: string
  tags?: string[]
}

export interface GenerateDescriptionRequest {
  title: string
  shortDescription: string
  category: string
  length: "short" | "medium" | "long"
}

export interface GenerateDescriptionResponse {
  fullDescription: string
  tags: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * Shared API client wrapper that sends requests to the Express backend.
 * Automatically attaches Authorization header if a BetterAuth JWT token is available.
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params,  ...restOptions } = options

  // 1. Build URL with query parameters if any
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 2. Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  // Retrieve JWT from BetterAuth client if running in the browser
  const token = await getUserToken()
  console.log("token from getUserToken():", token)

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const mergedHeaders = {
    ...headers,
  }

  // 3. Perform fetch request
  const response = await fetch(url, {
    ...restOptions,
    headers: mergedHeaders,
  })

  // 4. Handle response status
  if (!response.ok) {
    let errorMessage = "An error occurred"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }

  // Handle empty bodies or 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}
