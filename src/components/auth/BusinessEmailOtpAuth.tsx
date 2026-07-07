import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import {
  sendBusinessEmailOtp,
  loginBusinessWithEmailOtp,
  getApiErrorMessage,
  type BusinessAuthIntent,
} from '@/lib/api'
import { setSession } from '@/lib/auth'

type Step = 'email' | 'otp'

interface EmailForm {
  email: string
}

interface BusinessEmailOtpAuthProps {
  intent: BusinessAuthIntent
  title: string
  subtitle: string
  emailStepSubtitle: string
  otpStepSubtitle: string
  footer: React.ReactNode
  banner?: React.ReactNode
}

export function BusinessEmailOtpAuth({
  intent,
  title,
  subtitle,
  emailStepSubtitle,
  otpStepSubtitle,
  footer,
  banner,
}: BusinessEmailOtpAuthProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionReason = searchParams.get('reason')
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [accountNotFound, setAccountNotFound] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/vendor/dashboard'

  const emailForm = useForm<EmailForm>()

  const sendMutation = useMutation({
    mutationFn: (targetEmail: string) => sendBusinessEmailOtp(targetEmail, intent),
    onSuccess: () => {
      setError('')
      setAccountNotFound(false)
      setStep('otp')
      setOtp('')
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { status?: number } }
      if (intent === 'signin' && apiErr?.response?.status === 404) {
        setAccountNotFound(true)
        setError('')
      } else {
        setAccountNotFound(false)
        setError(getApiErrorMessage(err, 'Could not send OTP. Please try again.'))
      }
    },
  })

  const loginMutation = useMutation({
    mutationFn: (code: string) => loginBusinessWithEmailOtp(email, code, intent),
    onSuccess: (data) => {
      setError('')
      setSession(data.token!, {
        userId: data.userId!,
        email: data.email!,
        role: 'business',
        onboarded: Boolean(data.onboarded),
      })

      if (intent === 'signup' || data.isNewUser) {
        navigate('/onboarding', { replace: true })
        return
      }

      navigate(data.onboarded ? from : '/onboarding', { replace: true })
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.')),
  })

  const isPending = sendMutation.isPending || loginMutation.isPending

  function handleSendOtp() {
    const value = emailForm.getValues('email').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address')
      return
    }
    setEmail(value)
    setError('')
    setAccountNotFound(false)
    sendMutation.mutate(value)
  }

  const stepTitle = step === 'email' ? title : 'Verify your email'
  const stepSubtitle = step === 'email' ? emailStepSubtitle || subtitle : otpStepSubtitle

  return (
    <AuthShell
      title={stepTitle}
      subtitle={stepSubtitle}
      showRoleToggle={false}
      audience="business"
    >
      {banner}
      {sessionReason === 'session_expired' && step === 'email' && intent === 'signin' && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Your session expired. Sign in again to continue.
        </p>
      )}

      {step === 'email' && (
        <form
          onSubmit={emailForm.handleSubmit(() => handleSendOtp())}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Business email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourbusiness.com"
              {...emailForm.register('email', { required: 'Email is required' })}
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-v-danger">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          {accountNotFound && (
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
              <p className="text-amber-800 font-medium">No account found for this email.</p>
              <p className="text-amber-700">
                Don't have an account?{' '}
                <Link to="/business/signup" className="font-semibold underline text-amber-900 hover:text-v-purple">
                  Sign up here
                </Link>
              </p>
            </div>
          )}

          {error && !accountNotFound && (
            <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
            {sendMutation.isPending ? 'Sending OTP...' : 'Continue'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <div className="space-y-5">
          <p className="text-sm text-v-text-2 text-center">
            OTP sent to <span className="font-semibold text-v-text">{email}</span>
          </p>
          <div className="space-y-2">
            <Label className="text-center block">Enter 6-digit OTP</Label>
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={isPending}
              onComplete={(code) => {
                if (!isPending) {
                  setError('')
                  loginMutation.mutate(code)
                }
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}
          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={isPending || otp.length !== 6}
            onClick={() => { setError(''); loginMutation.mutate(otp) }}
          >
            {loginMutation.isPending ? 'Verifying...' : 'Continue'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-v-purple font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
            >
              Change email
            </button>
            <button
              type="button"
              className="text-v-text-2 hover:text-v-purple font-medium bg-transparent border-0 cursor-pointer disabled:opacity-50"
              disabled={sendMutation.isPending}
              onClick={handleSendOtp}
            >
              {sendMutation.isPending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-v-text-2 mt-6 text-center">{footer}</p>
    </AuthShell>
  )
}
