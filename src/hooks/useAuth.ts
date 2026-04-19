import { useAppSelector } from '@/store/store';

import {
  canAccessRoute,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getAvailableRoutes,
  UserRole,
} from "@/config/routes.config"

/**
 * Hook để kiểm tra authentication và authorization
 */
export const useAuth = () => {
  const user = useAppSelector((state) => state.user.data)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  const userRoles = user?.roles?.map((r) => r.name) as UserRole[] | undefined

  return {
    user,
    isAuthenticated,
    userRoles,

    /**
     * Kiểm tra user có role cụ thể không
     */
    hasRole: (role: UserRole) => hasRole(userRoles, role),

    /**
     * Kiểm tra user có ít nhất một trong các role không
     */
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(userRoles, roles),

    /**
     * Kiểm tra user có tất cả các role không
     */
    hasAllRoles: (roles: UserRole[]) => hasAllRoles(userRoles, roles),

    /**
     * Kiểm tra user có quyền truy cập route không
     */
    canAccessRoute: (path: string) => canAccessRoute(userRoles, path),

    /**
     * Kiểm tra user là admin
     */
    isAdmin: () => hasRole(userRoles, "ADMIN"),

    /**
     * Kiểm tra user là moderator
     */
    isModerator: () => hasRole(userRoles, "MOD"),

    /**
     * Kiểm tra user là historian
     */
    isHistorian: () => hasRole(userRoles, "HISTORIAN"),

    /**
     * Lấy danh sách routes user có thể truy cập
     */
    getAvailableRoutes: () => getAvailableRoutes(userRoles),
  }
}
