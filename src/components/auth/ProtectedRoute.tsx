import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, getUser, type UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: UserRole
}

export function ProtectedRoute({ children, role = 'business' }: ProtectedRouteProps) {
  const location = useLocation()
  const user = getUser()

  if (!isAuthenticated() || !user) {
    const signinPath = role === 'customer' ? '/signin?role=customer' : '/signin'
    return <Navigate to={signinPath} state={{ from: location }} replace />
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'customer' ? '/customer' : '/vendor/dashboard'} replace />
  }

  return <>{children}</>
}
