import { Navigate } from 'react-router-dom'

/** Password reset replaced by email OTP sign in. */
export function ForgotPasswordPage() {
  return <Navigate to="/business/signin" replace />
}

/** @deprecated use ForgotPasswordPage at /business/forgot-password */
export const BusinessForgotPasswordPage = ForgotPasswordPage
