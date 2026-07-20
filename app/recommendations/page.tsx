"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiClient, Skill } from "@/lib/api-client"
import { SkillCard, SkillCardSkeleton } from "@/components/skill-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sparkles,
  UserCircle,
  AlertCircle
} from "lucide-react"

// Define the response shape for recommendations
interface RecommendationsResponse {
  note?: string
  items?: Skill[]
}

export default function RecommendationsPage() {
  // ── Fetch recommendations ───────────────────────────────────────────────
  const { data, isLoading, error } = useQuery<RecommendationsResponse>({
    queryKey: ["recommendations"],
    queryFn: () => apiClient<RecommendationsResponse>("/api/recommendations"),
  })

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-grow flex flex-col">
        <div className="space-y-1">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Failed to load recommendations</h2>
        <p className="text-sm text-muted-foreground">
          There was a problem fetching your personalized skills. Please try again.
        </p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────
  const hasNote = !!data?.note
  const skills = data?.items || []

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-grow flex flex-col">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-teal" />
          For You
        </h1>
        <p className="text-sm text-muted-foreground">
          Personalized skill recommendations based on your profile and interests.
        </p>
      </div>

      {/* Empty State: Missing Profile Info */}
      {hasNote && (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-xl bg-card space-y-4 max-w-2xl mx-auto w-full shadow-sm mt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
            <UserCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2 px-6">
            <h3 className="text-xl font-semibold text-foreground">Tell us about yourself</h3>
            <p className="text-muted-foreground leading-relaxed">
              {data.note}
            </p>
          </div>
          <div className="pt-4">
            <Button asChild className="bg-teal hover:bg-teal/90 text-white shadow-md shadow-teal/10 cursor-pointer px-8">
              <Link href="/profile">
                Update Profile
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Empty State: No Skills matched (but profile is filled) */}
      {!hasNote && skills.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-xl bg-card space-y-4 mt-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">No recommendations right now</h3>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find any skills matching your current interests. Try adding more interests or explore all skills.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" className="cursor-pointer">
              <Link href="/explore">
                Explore Skills
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      {!hasNote && skills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}
