import { Navigate, useLocation } from 'react-router-dom'
import { getUser, isSessionValidForRole, type UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: UserRole
}

export function ProtectedRoute({ children, role = 'business' }: ProtectedRouteProps) {
  const location = useLocation()
  const user = getUser()

  if (!isSessionValidForRole(role)) {
    const signInPath = role === 'customer' ? '/signin' : '/business/signin'
    const params = new URLSearchParams()
    if (user && user.role !== role) {
      params.set('reason', 'wrong_role')
    } else if (user) {
      params.set('reason', 'session_expired')
    }
    const qs = params.toString()
    return <Navigate to={qs ? `${signInPath}?${qs}` : signInPath} state={{ from: location }} replace />
  }

  return <>{children}</>
}
