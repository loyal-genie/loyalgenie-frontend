import { Link } from 'react-router-dom'
import { BusinessEmailOtpAuth } from '@/components/auth/BusinessEmailOtpAuth'

export function BusinessSignInPage() {
  return (
    <BusinessEmailOtpAuth
      intent="signin"
      title="Business sign in"
      subtitle="Sign in to your business dashboard"
      emailStepSubtitle="Enter your business email to sign in"
      otpStepSubtitle="Enter the OTP sent to your email"
      footer={
        <>
          New to LoyalGenie?{' '}
          <Link to="/business/signup" className="text-v-purple font-semibold hover:underline">
            Create business account
          </Link>
        </>
      }
    />
  )
}
