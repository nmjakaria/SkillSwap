"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sparkles, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed", error)
    }
  }

  // Define navigation items based on login status
  const navItems = session
    ? [
        { name: "Home", href: "/" },
        { name: "Explore", href: "/explore" },
        { name: "Add Skill", href: "/skills/add" },
        { name: "My Skills", href: "/skills/manage" },
        { name: "Profile", href: "/profile" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Explore", href: "/explore" },
      ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-102">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal text-white shadow-md shadow-teal/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Skill<span className="text-coral">Swap</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-teal/10 text-teal"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Auth Button */}
        <div className="hidden md:flex items-center space-x-4">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          ) : session ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground hidden lg:inline-block">
                Welcome, <span className="text-foreground font-semibold">{session.user?.name}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-coral/20 text-coral hover:bg-coral/10 hover:text-coral transition-colors cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="bg-teal hover:bg-teal/90 text-white transition-all shadow-md shadow-teal/10 cursor-pointer">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border/50 bg-background px-4 pt-2 pb-4 space-y-1 shadow-lg transition-all">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-all",
                  isActive
                    ? "bg-teal/10 text-teal"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            )
          })}
          <div className="pt-4 border-t border-border/50">
            {session ? (
              <div className="space-y-3">
                <div className="px-3 text-sm text-muted-foreground">
                  Logged in as <span className="font-semibold text-foreground">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center px-3 py-2 text-base font-medium text-coral rounded-md hover:bg-coral/10 transition-all cursor-pointer"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Button asChild className="w-full bg-teal text-white cursor-pointer" onClick={() => setIsOpen(false)}>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
