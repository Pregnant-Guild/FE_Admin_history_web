/**
 * Role-Based Access Control Configuration
 * Định nghĩa routes theo role và quyền truy cập
 */

export type UserRole = "ADMIN" | "MOD" | "HISTORIAN" | "USER"

export interface RouteConfig {
  path: string
  allowedRoles: UserRole[]
  label?: string
}

/**
 * Public routes - không cần authentication
 */
export const PUBLIC_ROUTES = [
  "/signin",
  "/signup",
  "/reset-password",
  "/error-403",
  "/error-404",
  "/error-500",
]


export const PROTECTED_ROUTES: RouteConfig[] = [
  // Dashboard
  {
    path: "/",
    allowedRoles: ["ADMIN", "MOD", "HISTORIAN", "USER"],
    label: "Dashboard",
  },

  // Admin/MOD + Historian routes
  {
    path: "/user-table",
    allowedRoles: ["ADMIN", "MOD"],
    label: "User Management",
  },
  {
    path: "/applications-tables",
    allowedRoles: ["ADMIN", "MOD"],
    label: "Applications",
  },

  // All authenticated users
  {
    path: "/profile",
    allowedRoles: ["ADMIN", "MOD", "HISTORIAN", "USER"],
    label: "User Profile",
  },
  {
    path: "/calendar",
    allowedRoles: ["ADMIN", "MOD", "HISTORIAN", "USER"],
    label: "Calendar",
  },
  {
    path: "/line-chart",
    allowedRoles: ["ADMIN", "MOD", "HISTORIAN", "USER"],
    label: "Line Chart",
  },
  {
    path: "/bar-chart",
    allowedRoles: ["ADMIN", "MOD", "HISTORIAN", "USER"],
    label: "Bar Chart",
  },
]

/**
 * Kiểm tra user role có được phép truy cập route không
 */
export const canAccessRoute = (
  userRoles: UserRole[] | undefined,
  routePath: string
): boolean => {
  // Nếu không có role, không được truy cập
  if (!userRoles || userRoles.length === 0) {
    return false
  }

  // Public routes không cần check
  if (PUBLIC_ROUTES.includes(routePath)) {
    return true
  }

  // Tìm route config theo độ dài path giảm dần để tránh route '/' khớp với tất cả
  const routeConfig = PROTECTED_ROUTES
    .slice()
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (route) =>
        routePath === route.path ||
        (route.path !== "/" && routePath.startsWith(route.path + "/"))
    )

  // Nếu route không được định nghĩa, cho phép (mặc định)
  if (!routeConfig) {
    return true
  }

  // Check xem user có role được phép không
  return userRoles.some((role) => routeConfig.allowedRoles.includes(role))
}

/**
 * Lấy danh sách routes cho user role
 */
export const getAvailableRoutes = (userRoles: UserRole[] | undefined): RouteConfig[] => {
  if (!userRoles || userRoles.length === 0) {
    return []
  }

  return PROTECTED_ROUTES.filter((route) =>
    userRoles.some((role) => route.allowedRoles.includes(role))
  )
}

/**
 * Kiểm tra user có role nào không
 */
export const hasRole = (userRoles: UserRole[] | undefined, role: UserRole): boolean => {
  return userRoles?.includes(role) ?? false
}

/**
 * Kiểm tra user có ít nhất một trong các role không
 */
export const hasAnyRole = (
  userRoles: UserRole[] | undefined,
  roles: UserRole[]
): boolean => {
  return userRoles?.some((role) => roles.includes(role)) ?? false
}

/**
 * Kiểm tra user có tất cả các role không
 */
export const hasAllRoles = (
  userRoles: UserRole[] | undefined,
  roles: UserRole[]
): boolean => {
  return roles.every((role) => userRoles?.includes(role))
}
