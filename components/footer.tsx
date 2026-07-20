import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-neutral-bg py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {/* Column 1: Logo & Tagline */}
          <div className="flex flex-col items-start gap-4 col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Skill<span className="text-coral">Swap</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              Trade your skills. Learn anything for free.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Explore</h4>
            <Link href="/explore" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              Explore Skills
            </Link>
            <Link href="/skills/add" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              Add Skill
            </Link>
            <Link href="/explore" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              Categories
            </Link>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Company</h4>
            <Link href="/about" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Legal</h4>
            {/* TODO: Add real Privacy Policy page */}
            <Link href="#" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              Privacy Policy
            </Link>
            {/* TODO: Add real Terms of Service page */}
            <Link href="#" className="text-sm text-foreground/70 hover:text-teal font-medium transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col items-center justify-center">
          <p className="text-sm text-foreground/60 font-medium">
            &copy; 2026 SkillSwap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
