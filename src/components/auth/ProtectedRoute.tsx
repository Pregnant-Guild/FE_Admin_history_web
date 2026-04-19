"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/config/routes.config"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  fallback?: ReactNode
}

/**
 * Component để protect routes dựa trên role
 * Sử dụng ở client-side trong layouts hoặc pages
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback,
}) => {
  const router = useRouter()
  const { isAuthenticated, userRoles, hasAnyRole } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/signin")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (fallback) {
      return <>{fallback}</>
    }
    router.replace("/error-403")
    return null
  }

  return <>{children}</>
}

/**
 * Wrapper để render UI dựa trên role
 */
export const RoleGate: React.FC<{
  requiredRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}> = ({ requiredRoles, children, fallback }) => {
  const { hasAnyRole } = useAuth()

  if (!hasAnyRole(requiredRoles)) {
    return <>{fallback || null}</>
  }

  return <>{children}</>
}
