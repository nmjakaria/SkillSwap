import Link from "next/link"
import { Skill } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar } from "lucide-react"

interface SkillCardProps {
  skill: Partial<Skill>
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="group flex flex-col h-full rounded-[12px] border border-border/40 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-teal/30 transition-all duration-300">
      {/* Banner — real image or teal/coral gradient fallback */}
      {skill.imageUrl ? (
        <div className="h-28 relative overflow-hidden bg-muted">
          <img
            src={skill.imageUrl}
            alt={skill.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.style.display = "none"
              const parent = img.parentElement
              if (parent) {
                parent.className =
                  "h-28 bg-gradient-to-br from-teal/20 to-coral/10 p-4 flex items-end justify-between border-b border-border/10"
              }
            }}
          />
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-teal/20 to-coral/10 p-4 flex items-end justify-between border-b border-border/10 transition-colors duration-300 group-hover:from-teal/30 group-hover:to-coral/20">
          <span className="text-xs font-semibold bg-teal/20 text-teal px-2 py-0.5 rounded-full">
            {skill.category}
          </span>
          <span className="text-xs font-medium bg-coral/20 text-coral px-2 py-0.5 rounded-full">
            {skill.level}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-teal transition-colors duration-200">
            {skill.title}
          </h3>

          {/* Show badges only when they weren't already shown on the gradient banner */}
          {skill.imageUrl && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className="text-teal border-teal/20 bg-teal/5 text-[10px] px-1.5 py-0"
              >
                {skill.category}
              </Badge>
              <Badge
                variant="outline"
                className="text-coral border-coral/20 bg-coral/5 text-[10px] px-1.5 py-0"
              >
                {skill.level}
              </Badge>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {skill.shortDescription}
          </p>
        </div>

        {/* Footer meta + CTA */}
        <div className="flex flex-col space-y-3 pt-2 border-t border-border/20 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {skill.views ?? 0} views
            </span>
            <span className="flex items-center gap-1 max-w-[140px] truncate">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {skill.availability}
            </span>
          </div>

          <Button
            asChild
            size="sm"
            className="w-full bg-teal/10 hover:bg-teal text-teal hover:text-white border-transparent shadow-none font-medium cursor-pointer transition-colors duration-200"
          >
            <Link href={`/skills/${skill._id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export function SkillCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-[12px] border border-border/40 overflow-hidden shadow-sm">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="p-5 flex-grow space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="pt-2 mt-auto">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}
