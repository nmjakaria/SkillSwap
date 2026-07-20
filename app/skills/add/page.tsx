"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { apiClient, GenerateDescriptionRequest, GenerateDescriptionResponse, CreateSkillRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  Plus,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Programming",
  "Design",
  "Languages",
  "Cooking",
  "Music",
  "Business",
  "Fitness",
  "Other",
] as const

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const
const LENGTHS = ["short", "medium", "long"] as const

type LengthOption = (typeof LENGTHS)[number]

// ── Zod schema for the core skill info fields ─────────────────────────────
const skillSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  shortDescription: z.string().min(20, "Short description must be at least 20 characters"),
  category: z.enum(CATEGORIES, { error: "Please select a category" }),
  level: z.enum(LEVELS, { error: "Please select a skill level" }),
  availability: z.string().min(3, "Availability must be at least 3 characters"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type SkillFormValues = z.infer<typeof skillSchema>

export default function AddSkillPage() {
  const router = useRouter()

  // ── Generated content state (outside form schema) ─────────────────────
  const [selectedLength, setSelectedLength] = useState<LengthOption>("medium")
  const [fullDescription, setFullDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── React Hook Form ───────────────────────────────────────────────────
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      category: undefined,
      level: undefined,
      availability: "",
      imageUrl: "",
    },
  })

  // ── Mutations ─────────────────────────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: (payload: GenerateDescriptionRequest) =>
      apiClient<GenerateDescriptionResponse>("/api/ai/generate-description", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateSkillRequest) =>
      apiClient<{ _id: string }>("/api/skills", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  })

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleGenerate = async (regenerate = false) => {
    // Validate the fields the AI needs before calling
    const { title, shortDescription, category } = form.getValues()
    const titleValid = title && title.length >= 3
    const descValid = shortDescription && shortDescription.length >= 20
    const catValid = !!category

    if (!titleValid || !descValid || !catValid) {
      toast.error("Please fill in Title, Short Description, and Category before generating.")
      // Trigger validation on those fields so inline errors appear
      form.trigger(["title", "shortDescription", "category"])
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateMutation.mutateAsync({
        title,
        shortDescription,
        category,
        length: selectedLength,
      })
      setFullDescription(result.fullDescription)
      setTags(result.tags ?? [])
      setHasGenerated(true)
      toast.success(regenerate ? "Description regenerated!" : "Description generated!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate description. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const onSubmit = async (values: SkillFormValues) => {
    if (!hasGenerated) {
      toast.error("Generate a description first before submitting.")
      return
    }
    setIsSubmitting(true)
    try {
      const payload: CreateSkillRequest = {
        title: values.title,
        shortDescription: values.shortDescription,
        category: values.category,
        level: values.level,
        availability: values.availability,
        imageUrl: values.imageUrl || undefined,
        fullDescription,
        tags,
      }
      const result = await createMutation.mutateAsync(payload)
      toast.success("Skill created successfully!")
      router.push(`/skills/${result._id}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to create skill. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Add a Skill</h1>
        <p className="text-muted-foreground text-sm">
          Describe what you can teach. Use the AI assistant to generate a rich full description.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Section 1: Core skill info ─────────────────────────── */}
          <section className="space-y-5 rounded-xl border border-border/40 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Skill Information</h2>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Advanced Guitar Techniques"
                      className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Short Description */}
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe what you'll teach (used by the AI to generate the full description)"
                      rows={3}
                      className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category + Level side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/80 focus:ring-teal/30 focus:border-teal">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/80 focus:ring-teal/30 focus:border-teal">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEVELS.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Availability */}
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Weekends, weekday evenings after 6 PM"
                      className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL (optional) */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/my-skill-image.jpg"
                      className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    A public image URL to display on your skill card. Leave blank for an auto-generated banner.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* ── Section 2: AI Description Generator ───────────────── */}
          <section className="space-y-5 rounded-xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal" />
                  AI Description Generator
                </h2>
                <p className="text-xs text-muted-foreground">
                  Generate a detailed description using your title, short description, and category.
                </p>
              </div>
              {hasGenerated && (
                <span className="flex items-center gap-1 text-xs font-medium text-teal shrink-0">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Generated
                </span>
              )}
            </div>

            {/* Length toggle */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description length</p>
              <div className="flex gap-2">
                {LENGTHS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSelectedLength(len)}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all cursor-pointer capitalize",
                      selectedLength === len
                        ? "bg-teal text-white border-teal shadow-sm shadow-teal/20"
                        : "bg-background/50 text-muted-foreground border-border/60 hover:border-teal/40 hover:text-foreground"
                    )}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate / Regenerate buttons — visually distinct from Submit */}
            <div className="flex flex-wrap gap-3">
              {!hasGenerated ? (
                <Button
                  type="button"
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating || isSubmitting}
                  className="gap-2 bg-teal/10 hover:bg-teal text-teal hover:text-white border-teal/20 border shadow-none cursor-pointer transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Description
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating || isSubmitting}
                  className="gap-2 border-teal/30 text-teal hover:bg-teal/10 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Regenerating…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Generated output — only visible after first generation */}
            {hasGenerated && (
              <div className="space-y-5 pt-2">
                <Separator className="border-border/30" />

                {/* Editable full description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Description{" "}
                    <span className="text-xs text-muted-foreground font-normal">(editable — review before saving)</span>
                  </label>
                  <Textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    rows={8}
                    className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal resize-y font-mono text-sm"
                    placeholder="Generated description will appear here…"
                    disabled={isGenerating}
                  />
                </div>

                {/* Tags as removable chips */}
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Suggested Tags{" "}
                      <span className="text-xs text-muted-foreground font-normal">(click × to remove)</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer transition-colors"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    All tags removed. You can regenerate to get new suggestions.
                  </p>
                )}
              </div>
            )}

            {/* Gate hint when description not yet generated */}
            {!hasGenerated && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
                <span className="font-medium">⚠</span>
                You must generate a description at least once before submitting.
              </p>
            )}
          </section>

          {/* ── Submit button — visually distinct from Generate ────── */}
          <div className="flex items-center justify-between gap-4">
            <p className={cn(
              "text-xs transition-colors",
              hasGenerated ? "text-teal font-medium" : "text-muted-foreground"
            )}>
              {hasGenerated ? "✓ Ready to publish" : "Generate a description to unlock submission"}
            </p>
            <Button
              type="submit"
              disabled={!hasGenerated || isSubmitting || isGenerating}
              className={cn(
                "min-w-[140px] gap-2 font-semibold transition-all cursor-pointer shadow-md",
                hasGenerated
                  ? "bg-coral hover:bg-coral/90 text-white shadow-coral/10"
                  : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Publish Skill
                </>
              )}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  )
}
