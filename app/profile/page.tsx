"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, User, UpdateProfileRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User as UserIcon,
  Mail,
  Loader2,
  Save,
  Plus,
  X,
  Sparkles
} from "lucide-react"

export default function ProfilePage() {
  const queryClient = useQueryClient()
  
  // Local state for edits
  const [bio, setBio] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")

  // Fetch user profile
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["user-profile"],
    queryFn: () => apiClient<User>("/api/users/me"),
  })

  // Sync local state when data loads
  useEffect(() => {
    if (user) {
      setBio(user.bio || "")
      setInterests(user.interests || [])
    }
  }, [user])

  // Mutation for saving profile
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      apiClient<User>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user-profile"], updatedUser)
      toast.success("Profile updated successfully!")
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile. Please try again.")
    },
  })

  const handleAddInterest = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = newInterest.trim()
    if (!trimmed) return
    
    if (interests.includes(trimmed)) {
      toast.error("Interest already added")
      return
    }

    setInterests([...interests, trimmed])
    setNewInterest("")
  }

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove))
  }

  const handleSave = () => {
    updateMutation.mutate({ bio, interests })
  }

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-9 w-40" />
        <div className="space-y-6 rounded-xl border border-border/40 bg-card p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (error || !user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <p className="text-destructive font-medium">Failed to load profile</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or log in again.</p>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────
  const isSaving = updateMutation.isPending

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and interests.
        </p>
      </div>

      <div className="space-y-8 rounded-xl border border-border/40 bg-card p-6 sm:p-8 shadow-sm">
        
        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Name
            </label>
            <div className="px-3 py-2 bg-muted/50 rounded-md border border-border/50 text-sm text-muted-foreground">
              {user.name}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </label>
            <div className="px-3 py-2 bg-muted/50 rounded-md border border-border/50 text-sm text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-semibold text-foreground">
            Bio
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community a bit about yourself..."
            rows={4}
            className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal resize-y"
          />
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Interests
            </label>
            <p className="text-xs text-teal flex items-center gap-1.5 bg-teal/10 w-fit px-2 py-1 rounded-md border border-teal/20">
              <Sparkles className="h-3 w-3" />
              Adding interests helps power your recommendations
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="gap-1.5 pl-2.5 pr-1.5 py-1 text-sm font-medium bg-muted/80 hover:bg-muted"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer transition-colors"
                  aria-label={`Remove interest ${interest}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {interests.length === 0 && (
              <span className="text-sm text-muted-foreground italic py-1">
                No interests added yet.
              </span>
            )}
          </div>

          <form onSubmit={handleAddInterest} className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="e.g. Machine Learning, Cooking, Guitar"
              className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddInterest(e)
                }
              }}
            />
            <Button 
              type="submit" 
              variant="outline" 
              className="gap-2 cursor-pointer border-border/80 hover:bg-muted"
              disabled={!newInterest.trim()}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-coral hover:bg-coral/90 text-white min-w-[120px] cursor-pointer shadow-md shadow-coral/10"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
