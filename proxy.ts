import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__secure-better-auth.session_token")

  const { pathname } = request.nextUrl

  const protectedRoutes = [
    "/skills/add",
    "/skills/manage",
    "/profile",
    "/recommendations",
  ]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    // Save the page they were trying to access to redirect them back after logging in
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/skills/add",
    "/skills/manage",
    "/profile",
    "/recommendations",
    "/skills/add/:path*",
    "/skills/manage/:path*",
    "/profile/:path*",
    "/recommendations/:path*",
  ],
}
