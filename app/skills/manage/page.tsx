"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, Skill } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Eye,
  Trash2,
  ExternalLink,
  Plus,
  AlertTriangle,
  Loader2,
  Layers,
} from "lucide-react"

export default function ManageSkillsPage() {
  const queryClient = useQueryClient()

  // Track which skill is pending deletion (null = dialog closed)
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null)
  // Track which skill ID is mid-delete so we can show a per-row spinner
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Fetch mine ───────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery<Skill[]>({
    queryKey: ["my-skills"],
    queryFn: async () => {
      const res = await apiClient<any>("/api/skills/mine")
      return Array.isArray(res) ? res : res?.items ?? []
    },
  })

  const skills: Skill[] = data ?? []

  // ── Delete mutation ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/api/skills/${id}`, { method: "DELETE" }),
    onMutate: async (id: string) => {
      // Optimistically remove from cache immediately so the UI updates
      // without waiting for the server round-trip
      await queryClient.cancelQueries({ queryKey: ["my-skills"] })
      const previous = queryClient.getQueryData<Skill[]>(["my-skills"])
      queryClient.setQueryData<Skill[]>(["my-skills"], (old) =>
        (old ?? []).filter((s) => s._id !== id)
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData<Skill[]>(["my-skills"], context.previous)
      }
      toast.error("Failed to delete skill. Please try again.")
    },
    onSuccess: () => {
      toast.success("Skill deleted successfully.")
    },
    onSettled: () => {
      setDeletingId(null)
      setPendingDelete(null)
      // Reconcile with server in background to keep cache accurate
      queryClient.invalidateQueries({ queryKey: ["my-skills"] })
    },
  })

  const confirmDelete = () => {
    if (!pendingDelete) return
    setDeletingId(pendingDelete._id)
    deleteMutation.mutate(pendingDelete._id)
  }

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-xl border border-border/40 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border/20 last:border-0">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16 ml-auto" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <p className="text-destructive font-medium">Failed to load your skills.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again later.</p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Skills</h1>
            <p className="text-sm text-muted-foreground">
              {skills.length === 0
                ? "You haven't listed any skills yet."
                : `You have ${skills.length} skill${skills.length !== 1 ? "s" : ""} listed.`}
            </p>
          </div>
          <Button asChild className="bg-teal hover:bg-teal/90 text-white shadow-md shadow-teal/10 gap-2 cursor-pointer">
            <Link href="/skills/add">
              <Plus className="h-4 w-4" />
              Add New Skill
            </Link>
          </Button>
        </div>

        {/* Empty state */}
        {skills.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border/40 rounded-xl bg-card space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
              <Layers className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">No skills yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Share your expertise with the community. Add your first skill to get started.
              </p>
            </div>
            <Button asChild className="bg-teal hover:bg-teal/90 text-white cursor-pointer">
              <Link href="/skills/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Link>
            </Button>
          </div>
        )}

        {/* Skills table — responsive: full table on md+, card rows on mobile */}
        {skills.length > 0 && (
          <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">

            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_80px_100px_100px] gap-4 px-6 py-3 border-b border-border/30 bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Views</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">View</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Delete</span>
            </div>

            {/* Rows */}
            {skills.map((skill, idx) => {
              const isBeingDeleted = deletingId === skill._id
              return (
                <div
                  key={skill._id}
                  className={`
                    flex flex-col md:grid md:grid-cols-[1fr_120px_80px_100px_100px]
                    gap-3 md:gap-4 px-6 py-4
                    ${idx < skills.length - 1 ? "border-b border-border/20" : ""}
                    ${isBeingDeleted ? "opacity-50 pointer-events-none" : ""}
                    transition-opacity duration-200
                  `}
                >
                  {/* Title + level badge (stacked on mobile) */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-foreground truncate">{skill.title}</span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {skill.category} · {skill.level}
                    </span>
                  </div>

                  {/* Category badge */}
                  <div className="hidden md:flex items-center">
                    <Badge className="bg-teal/10 text-teal border-teal/20 hover:bg-teal/10 text-[10px]">
                      {skill.category}
                    </Badge>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground md:justify-end">
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span>{skill.views}</span>
                    <span className="md:hidden text-xs ml-1">views</span>
                  </div>

                  {/* View button */}
                  <div className="flex items-center md:justify-center">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-border/60 hover:bg-muted cursor-pointer w-full md:w-auto"
                    >
                      <Link href={`/skills/${skill._id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </div>

                  {/* Delete button */}
                  <div className="flex items-center md:justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer w-full md:w-auto"
                      disabled={isBeingDeleted || !!deletingId}
                      onClick={() => setPendingDelete(skill)}
                    >
                      {isBeingDeleted ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Confirm Delete Dialog ────────────────────────────────────── */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open: boolean) => { if (!open) setPendingDelete(null) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Skill
            </DialogTitle>
            <DialogDescription className="pt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{pendingDelete?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => setPendingDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2 cursor-pointer"
              onClick={confirmDelete}
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Yes, Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
