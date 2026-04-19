import { NextRequest, NextResponse } from "next/server"
import { PUBLIC_ROUTES, canAccessRoute, UserRole } from "./src/config/routes.config"

/**
 * Middleware để kiểm tra authentication và authorization
 * Chạy TRƯỚC khi render page
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Kiểm tra nếu là public route
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Nếu user đã login, không cho vào signin/signup
    const userDataCookie = request.cookies.get("userDataRedux")
    if (userDataCookie && (pathname === "/signin" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // 2. Kiểm tra token (cookies)
  const token = request.cookies.get("token") || request.cookies.get("access_token")
  const userDataCookie = request.cookies.get("userDataRedux")

  // 3. Nếu không có token, redirect về signin
  if (!token) {
    const signinUrl = new URL("/signin", request.url)
    signinUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(signinUrl)
  }

  // 4. Kiểm tra role-based access
  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie.value)
      const userRoles: UserRole[] = userData.roles?.map((r: any) => r.name) || []

      // Kiểm tra user có quyền truy cập route này không
      if (!canAccessRoute(userRoles, pathname)) {
        // Redirect về dashboard hoặc 403 page
        return NextResponse.redirect(new URL("/error-403", request.url))
      }
    } catch (error) {
      console.error("Error parsing user data in middleware:", error)
      // Nếu lỗi parse, vẫn cho qua (để tránh infinite redirect)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

/**
 * Cấu hình matcher - middleware chỉ chạy cho những routes này
 */
export const config = {
  matcher: [
    /*
     * Chạy middleware cho tất cả paths ngoại trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
