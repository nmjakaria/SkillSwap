import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-background/50 py-8 md:py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Skill<span className="text-coral">Swap</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground text-center md:text-left max-w-xs">
              Empowering communities to learn, share, and swap expertise. Peer-to-peer knowledge sharing, simplified.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-teal transition-colors">
              Explore Skills
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-teal transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-teal transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {currentYear} SkillSwap. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Built with Next.js, Tailwind and BetterAuth
          </p>
        </div>
      </div>
    </footer>
  )
}
