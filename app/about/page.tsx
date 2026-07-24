import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Users, Target, Zap, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-16 flex-grow">

      {/* Hero Section */}
      <section className="space-y-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          About SkillSwap
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We believe that everyone has something valuable to teach and something exciting to learn. SkillSwap is the bridge that connects curious minds.
        </p>
      </section>

      <Separator className="border-border/30" />

      {/* Our Mission */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Our mission is to democratize education by creating a global community where knowledge flows freely. We're building a platform where learning isn't blocked by financial barriers, but instead fueled by mutual exchange and shared passions.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you're a seasoned developer wanting to learn the guitar, or a master chef looking to pick up graphic design, SkillSwap provides the space to make those connections happen.
          </p>
        </div>
        <div className="bg-muted/30 rounded-2xl p-8 border border-border/40 grid grid-cols-2 gap-6 relative overflow-hidden">
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-coral/10 rounded-full blur-3xl" />


          <div className="bg-background rounded-xl p-4 shadow-sm border border-border/30 space-y-2 z-10">
            <Users className="h-5 w-5 text-teal" />
            <h3 className="font-semibold text-foreground">Community First</h3>
            <p className="text-xs text-muted-foreground">Built around real human connections.</p>
          </div>
          <div className="bg-background rounded-xl p-4 shadow-sm border border-border/30 space-y-2 z-10">
            <Zap className="h-5 w-5 text-coral" />
            <h3 className="font-semibold text-foreground">Active Learning</h3>
            <p className="text-xs text-muted-foreground">Learn by doing, side-by-side.</p>
          </div>
          <div className="bg-background rounded-xl p-4 shadow-sm border border-border/30 space-y-2 z-10">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-foreground">Passionate</h3>
            <p className="text-xs text-muted-foreground">Driven by curiosity and growth.</p>
          </div>
          <div className="bg-background rounded-xl p-4 shadow-sm border border-border/30 space-y-2 z-10">
            <Target className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">Goal Oriented</h3>
            <p className="text-xs text-muted-foreground">Helping you reach your potential.</p>
          </div>
        </div>
      </section>

      <Separator className="border-border/30" />

      {/* The Team */}
      <section className="space-y-8 text-center max-w-3xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">The Team</h2>
          <p className="text-muted-foreground leading-relaxed">
            We are a small, passionate team of developers, designers, and lifelong learners who experienced firsthand the frustration of wanting to learn new skills without breaking the bank. SkillSwap was born from our own desire to trade coding knowledge for language lessons. Today, we're dedicated to expanding this model to the world.
          </p>
        </div>

        <div className="bg-teal/5 border border-teal/10 rounded-2xl p-8 space-y-4 mt-8">
          <h3 className="text-xl font-semibold text-foreground">Join the Movement</h3>
          <p className="text-muted-foreground text-sm">
            Ready to share what you know and learn what you love? The community is waiting for you.
          </p>
          <div className="pt-2">
            <Button asChild className="bg-teal hover:bg-teal/90 text-white cursor-pointer px-8">
              <Link href="/register">Create an Account</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
