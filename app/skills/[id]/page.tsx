"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { apiClient, Skill } from "@/lib/api-client"
import { SkillCard, SkillCardSkeleton } from "@/components/skill-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Tag,
  Clock,
  BarChart2,
  Eye,
  CalendarDays,
  ArrowLeft,
  User,
} from "lucide-react"

// The API currently returns `ownerId` as a raw ObjectId string.
// TODO: Ask the backend to either:
//   a) Populate ownerId → { _id, name, bio } on GET /api/skills/:id, OR
//   b) Expose a public GET /api/users/:id endpoint so this page can fetch owner details.
// Until then we show a safe placeholder. Do NOT hardcode or fake owner data.

interface SkillWithOwner extends Skill {
  owner?: { _id: string; name: string; bio?: string }
}

export default function SkillDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const {
    data: skill,
    isLoading,
    error,
  } = useQuery<SkillWithOwner>({
    queryKey: ["skill", id],
    queryFn: () => apiClient<SkillWithOwner>(`/api/skills/${id}`),
    enabled: !!id,
  })

  const { data: relatedData, isLoading: relatedLoading } = useQuery<Partial<Skill>[]>({
    queryKey: ["skill-related", id],
    queryFn: async () => {
      const res = await apiClient<any>(`/api/skills/${id}/related`)
      return Array.isArray(res) ? res : res?.items ?? []
    },
    enabled: !!id,
  })

  const relatedSkills: Partial<Skill>[] = relatedData ?? []

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-[12px]" />
          <Skeleton className="h-10 w-2/3" />
          <div className="flex gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (error || !skill) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Skill not found</h2>
        <p className="text-muted-foreground">
          This skill may have been removed or the link is incorrect.
        </p>
        <Button asChild className="bg-teal hover:bg-teal/90 text-white">
          <Link href="/explore">Back to Explore</Link>
        </Button>
      </div>
    )
  }

  // ── Detail ────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Back navigation */}
      <Button asChild variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground -ml-2 cursor-pointer">
        <Link href="/explore">
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </Button>

      {/* Hero image or gradient fallback */}
      {skill.imageUrl ? (
        <div className="w-full h-64 sm:h-80 rounded-[12px] overflow-hidden border border-border/40 shadow-md">
          <img
            src={skill.imageUrl}
            alt={skill.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-64 sm:h-80 rounded-[12px] bg-gradient-to-br from-teal/20 via-teal/10 to-coral/10 flex items-center justify-center border border-border/20 shadow-sm">
          <span className="text-5xl font-extrabold text-teal/20 select-none tracking-tighter">
            {skill.title?.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      {/* Title + badges */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {skill.title}
        </h1>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-teal/10 text-teal border-teal/20 hover:bg-teal/10">
            {skill.category}
          </Badge>
          <Badge className="bg-coral/10 text-coral border-coral/20 hover:bg-coral/10">
            {skill.level}
          </Badge>
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {skill.availability}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {skill.views} views
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Added {new Date(skill.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <Separator className="border-border/30" />

      {/* Owner information */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border/30 bg-muted/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
          <User className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offered by</p>
          {skill.owner?.name ? (
            <p className="font-semibold text-foreground">{skill.owner.name}</p>
          ) : (
            // TODO: Backend does not currently populate owner details on GET /api/skills/:id.
            // The response only contains `ownerId` (raw ObjectId). Once the backend either:
            //   a) populates `.populate('ownerId', 'name bio')` on this route, or
            //   b) a public GET /api/users/:id endpoint exists,
            // replace this placeholder with the real owner name.
            <p className="text-sm text-muted-foreground italic">
              Owner details not yet available — backend needs to populate owner info.
            </p>
          )}
        </div>
      </div>

      {/* Short description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">About this skill</h2>
        <p className="text-muted-foreground leading-relaxed">{skill.shortDescription}</p>
      </div>

      {/* Full AI-generated description */}
      {skill.fullDescription && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Full Description</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap rounded-xl border border-border/30 bg-muted/20 p-6">
            {skill.fullDescription}
          </div>
        </div>
      )}

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Tag className="h-4 w-4" /> Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {skill.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-3 py-1 text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="border-border/30" />

      {/* Related Skills */}
      <div className="space-y-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BarChart2 className="h-5 w-5 text-teal" />
          Related Skills
        </h2>

        {relatedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkillCardSkeleton key={i} />
            ))}
          </div>
        ) : relatedSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedSkills.map((s) => (
              <SkillCard key={s._id} skill={s} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No related skills found for this topic yet.
          </p>
        )}
      </div>
    </div>
  )
}
