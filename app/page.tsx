"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiClient, Skill } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkillCard, SkillCardSkeleton } from "@/components/skill-card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Repeat,
  Code,
  Palette,
  Globe,
  Utensils,
  Music,
  Briefcase,
  Dumbbell,
  Layers,
  Eye,
  Calendar,
} from "lucide-react"

// Category list with corresponding icons
const CATEGORIES = [
  { name: "Programming", icon: Code, color: "text-teal bg-teal/10" },
  { name: "Design", icon: Palette, color: "text-coral bg-coral/10" },
  { name: "Languages", icon: Globe, color: "text-blue-500 bg-blue-500/10" },
  { name: "Cooking", icon: Utensils, color: "text-warm-yellow bg-warm-yellow/10" },
  { name: "Music", icon: Music, color: "text-purple-500 bg-purple-500/10" },
  { name: "Business", icon: Briefcase, color: "text-indigo-500 bg-indigo-500/10" },
  { name: "Fitness", icon: Dumbbell, color: "text-green-500 bg-green-500/10" },
  { name: "Other", icon: Layers, color: "text-gray-500 bg-gray-500/10" },
]

// Mock skills as a fallback if the backend returns empty or is offline
const MOCK_SKILLS: Partial<Skill>[] = [
  {
    _id: "mock-1",
    title: "React & Next.js Development",
    shortDescription: "Learn to build modern, high-performance web applications using React, Next.js App Router, and Tailwind CSS.",
    category: "Programming",
    level: "Advanced",
    availability: "Weekends",
    views: 142,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "mock-2",
    title: "UI/UX & Brand Design",
    shortDescription: "Master color theory, typography, Figma layouts, and creating premium design systems for web and mobile.",
    category: "Design",
    level: "Intermediate",
    availability: "Flexible",
    views: 98,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "mock-3",
    title: "Conversational Spanish",
    shortDescription: "Practice speaking Spanish with a native speaker. Focus on vocabulary, pronunciation, and everyday dialogue.",
    category: "Languages",
    level: "Beginner",
    availability: "Weekdays evening",
    views: 86,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "mock-4",
    title: "Artisanal Bread Baking",
    shortDescription: "Learn the secrets of sourdough fermentation, sourdough starters, proofing techniques, and baking the perfect crust.",
    category: "Cooking",
    level: "Intermediate",
    availability: "Saturday mornings",
    views: 74,
    createdAt: new Date().toISOString(),
  },
]

// Hero background images
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80", // Collaboration/Learning
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80", // Tech/Design
  "https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&w=1920&q=80", // Cooking
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920&q=80", // Music
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80", // Fitness
]

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ["featuredSkills"],
    queryFn: () => apiClient<any>("/api/skills?sort=popular&page=1"),
    retry: 1,
  })

  // Safely extract popular skills or fallback to mock data
  const rawSkills = data?.items || (Array.isArray(data) ? data : [])
  const displaySkills = rawSkills.length > 0 ? rawSkills.slice(0, 4) : MOCK_SKILLS

  return (
    <div className="flex-1 w-full bg-neutral-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-36 bg-black flex items-center justify-center min-h-[500px]">

        {/* Background Images with Crossfade and Ken Burns */}
        {HERO_IMAGES.map((src, idx) => {
          const isActive = idx === currentImageIndex
          return (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100" : "opacity-0"
                }`}
            >
              <img
                src={src}
                alt="SkillSwap learning"
                className={`w-full h-full object-cover transition-transform duration-[15000ms] ease-linear ${isActive ? "scale-110" : "scale-100"
                  }`}
              />
            </div>
          )
        })}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-8 text-white">
          <Badge className="px-3 py-1 bg-white/10 text-white hover:bg-white/20 border-transparent rounded-full font-medium backdrop-blur-sm shadow-sm">
            Join the Peer-to-Peer Learning Revolution
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-md">
            Trade Your Skills. <br />
            <span className="bg-clip-text text-[#2A9D8F]">
              Learn Anything for Free.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            SkillSwap is a community-driven platform where knowledge is the currency. Teach what you love, master what you want, completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-teal hover:bg-teal/90 text-white shadow-lg shadow-teal/20 cursor-pointer border-0">
              <Link href="/explore">
                Explore Skills
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm cursor-pointer shadow-lg bg-black/20">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {HERO_IMAGES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-8 bg-teal-400" : "w-2 bg-white/40"
                }`}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 border-t border-border/20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="text-muted-foreground">
              Swapping skills is simple, intuitive, and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border border-border/30 bg-background/50 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">1. List Your Skills</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add skills you can teach. Describe your availability, experience level, and use our AI helper to generate details.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border border-border/30 bg-background/50 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10 text-coral">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">2. Find Swappers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse skills offered by other members. Filter by category, difficulty level, or search terms to find what you want.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border border-border/30 bg-background/50 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warm-yellow/10 text-warm-yellow">
                <Repeat className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">3. Swap Knowledge</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get in touch, plan a digital or physical meeting, and start learning. Share your expertise in exchange for theirs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24 border-t border-border/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Browse Categories</h2>
            <p className="text-muted-foreground">
              Explore expertise across creative, technical, and general subjects.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.name}
                  href={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col p-6 rounded-xl border border-border/40 bg-card hover:bg-card/50 hover:border-teal/40 transition-all duration-300 shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.color} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mt-4 font-semibold text-foreground group-hover:text-teal transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Explore skills &rarr;
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-16 sm:py-24 border-t border-border/20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Skills</h2>
              <p className="text-muted-foreground">
                Discover the most popular skill exchanges in our community right now.
              </p>
            </div>
            <Button asChild variant="outline" className="sm:self-end border-border/80 hover:bg-muted cursor-pointer">
              <Link href="/explore">View All Skills</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <SkillCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displaySkills.map((skill: Partial<Skill>) => (
                <SkillCard key={skill._id} skill={skill} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 border-t border-border/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Got questions? We have answers.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="item-1" className="border border-border/40 rounded-xl px-4 bg-card shadow-sm">
              <AccordionTrigger className="text-base font-semibold py-4 hover:no-underline text-foreground">
                What is SkillSwap?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                SkillSwap is a community platform where members trade skills directly. There is no money involved—instead, you share your expertise in one subject (like design or cooking) in return for learning a skill from someone else (like coding or languages).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border/40 rounded-xl px-4 bg-card shadow-sm">
              <AccordionTrigger className="text-base font-semibold py-4 hover:no-underline text-foreground">
                How does the swap process work?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                First, list the skills you are ready to teach. Then, browse skills offered by other members. When you find a skill you want to learn, visit their detail page to check availability. You can message them, set up an exchange, and meet online or in person.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border/40 rounded-xl px-4 bg-card shadow-sm">
              <AccordionTrigger className="text-base font-semibold py-4 hover:no-underline text-foreground">
                Is SkillSwap completely free?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Yes, SkillSwap is entirely free. The core principle is reciprocity—your time and knowledge are the currency used to learn from other members of the community.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border/40 rounded-xl px-4 bg-card shadow-sm">
              <AccordionTrigger className="text-base font-semibold py-4 hover:no-underline text-foreground">
                How does the AI assistant help me?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                When adding a skill, you can click &quot;Generate Description&quot;. Our backend AI assistant will analyze your title, category, and short summary to generate a rich, comprehensive full description and list of tags. You can review, edit, and adjust it before saving.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
