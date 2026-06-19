import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { BusinessEmailOtpAuth } from '@/components/auth/BusinessEmailOtpAuth'

export function BusinessSignUpPage() {
  return (
    <BusinessEmailOtpAuth
      intent="signup"
      title="Create business account"
      subtitle="Step 1 of 2 — verify your email, then complete business onboarding"
      emailStepSubtitle="Enter your business email to get started"
      otpStepSubtitle="Enter the OTP sent to your email"
      banner={
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-v-purple/5 border border-v-purple/15">
          <div className="w-8 h-8 rounded-full bg-v-purple text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
          <div className="text-sm text-v-text-2">
            <span className="font-semibold text-v-text">Verify your email</span>
            <span className="block text-xs mt-0.5">We&apos;ll send a one-time code to confirm it&apos;s you.</span>
          </div>
          <Check className="w-4 h-4 text-v-purple ml-auto shrink-0 opacity-40" />
        </div>
      }
      footer={
        <>
          Already have an account?{' '}
          <Link to="/business/signin" className="text-v-purple font-semibold hover:underline">
            Sign in
          </Link>
        </>
      }
    />
  )
}
