import dns from "node:dns"
dns.setServers(["8.8.8.8", "8.8.4.4"])

import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    const currentUrl = request.nextUrl.pathname + request.nextUrl.search
    const loginUrl = new URL("/login", request.url) // change to "/auth/signin" if that's your real route
    loginUrl.searchParams.set("redirect", currentUrl)
    loginUrl.searchParams.set("message", "login_required")
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/skills/add",
    "/skills/add/:path*",
    "/skills/manage",
    "/skills/manage/:path*",
    "/profile",
    "/profile/:path*",
    "/recommendations",
    "/recommendations/:path*",
  ],
}