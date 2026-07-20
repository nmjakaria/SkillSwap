"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { apiClient, Skill } from "@/lib/api-client"
import { SkillCard, SkillCardSkeleton } from "@/components/skill-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"

const CATEGORIES = [
  "All",
  "Programming",
  "Design",
  "Languages",
  "Cooking",
  "Music",
  "Business",
  "Fitness",
  "Other",
]

function ExploreContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read search parameters from URL
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const sort = searchParams.get("sort") || "newest"
  const page = parseInt(searchParams.get("page") || "1", 10)

  // Local state for debounced search input
  const [localSearch, setLocalSearch] = useState(search)

  // Sync local search input with URL search param changes (e.g. back navigation)
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        updateQueryParams({ search: localSearch, page: "1" })
      }
    }, 400)

    return () => clearTimeout(handler)
  }, [localSearch])

  // Helper to update URL params
  const updateQueryParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  // Fetch skills via React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["skills", search, category, sort, page],
    queryFn: () =>
      apiClient<any>("/api/skills", {
        params: {
          search,
          category: category === "All" ? "" : category,
          sort,
          page,
          limit: 10,
        },
      }),
  })
  // Extract skills list and pagination stats safely
  const skills: Skill[] = data?.skills || (Array.isArray(data) ? data : [])
  const totalPages = data?.totalPages || 1
  const currentPage = data?.currentPage || page

  const handleCategoryChange = (val: string) => {
    updateQueryParams({ category: val === "All" ? "" : val, page: "1" })
  }

  const handleSortChange = (val: string) => {
    updateQueryParams({ sort: val })
  }

  const handleClearFilters = () => {
    setLocalSearch("")
    router.push(pathname)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl flex-grow flex flex-col space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Explore Skills</h1>
        <p className="text-muted-foreground">
          Search and filter skills shared by community members. Swap your expertise to learn something new.
        </p>
      </div>

      {/* Filters Panel */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border/40 bg-card shadow-sm">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search skills, topics, or keywords..."
            className="pl-9 bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category */}
        <div className="w-full md:w-56">
          <Select value={category || "All"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-background/50 border-border/80 focus:ring-teal/30 focus:border-teal">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full md:w-48">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="bg-background/50 border-border/80 focus:ring-teal/30 focus:border-teal">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters (conditional) */}
        {(search || category || sort !== "newest" || page !== 1) && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground gap-2 cursor-pointer"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        /* Error Message */
        <div className="text-center py-12 border border-dashed border-border/40 rounded-xl bg-card">
          <p className="text-destructive font-medium">Failed to load skills</p>
          <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page or check your connection.</p>
        </div>
      ) : skills.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 border border-dashed border-border/40 rounded-xl bg-card space-y-4 max-w-md mx-auto w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">No skills found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find any skills matching your search parameters. Try adjusting your filters.
            </p>
          </div>
          <Button onClick={handleClearFilters} className="bg-teal hover:bg-teal/90 text-white cursor-pointer">
            Reset Filters
          </Button>
        </div>
      ) : (
        /* Skills Grid */
        <div className="space-y-8 flex-grow flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-grow">
            {skills.map((skill: Skill) => (
              <SkillCard key={skill._id} skill={skill} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQueryParams({ page: String(currentPage - 1) })}
                disabled={currentPage === 1}
                className="cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQueryParams({ page: String(currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="cursor-pointer"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-grow items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  )
}
