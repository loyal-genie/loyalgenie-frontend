import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { sendOtp, signInCustomer, fetchCheckInPrompt, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

type Step = 'phone' | 'otp'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionReason = searchParams.get('reason')
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const fromQuery = searchParams.get('from')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname
    ?? (fromQuery && fromQuery.startsWith('/') ? fromQuery : null)
    ?? '/customer'

  const sendMutation = useMutation({
    mutationFn: () => sendOtp(phone, 'signin'),
    onSuccess: () => {
      setError('')
      setStep('otp')
      setOtp('')
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Could not send OTP. Please try again.')
      setError(msg)
    },
  })

  const signInMutation = useMutation({
    mutationFn: () => signInCustomer(phone, otp),
    onSuccess: async (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'customer',
        name: data.name,
        phone: data.phone,
      })
      if (from.startsWith('/customer') && from !== '/customer') {
        navigate(from, { replace: true })
        return
      }
      try {
        const prompt = await fetchCheckInPrompt()
        if (prompt.hasPendingCheckIn && prompt.campaignId) {
          navigate(`/customer/check-in?campaign=${prompt.campaignId}`, { replace: true })
          return
        }
      } catch {
        // fall through
      }
      navigate('/customer', { replace: true })
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.')),
  })

  const isPending = sendMutation.isPending || signInMutation.isPending

  function handleSendOtp() {
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    sendMutation.mutate()
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your mobile number"
      showRoleToggle={false}
    >
      {sessionReason === 'session_expired' && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Your session expired. Sign in again to continue playing.
        </p>
      )}

      {step === 'phone' ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={setPhone}
              disabled={isPending}
            />
          </div>

          {error && (
            <div className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p>{error}</p>
              {error.toLowerCase().includes('sign up') && (
                <Link to="/signup" className="text-v-purple font-semibold hover:underline mt-2 inline-block">
                  Create account →
                </Link>
              )}
            </div>
          )}

          <Button type="button" variant="primary" className="w-full" disabled={isPending} onClick={handleSendOtp}>
            {sendMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-v-text-2 text-center">
            OTP sent to <span className="font-semibold text-v-text">+91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
          </p>

          <div className="space-y-2">
            <Label className="text-center block">Enter 6-digit OTP</Label>
            <OtpInput value={otp} onChange={setOtp} disabled={isPending} />
          </div>

          {error && (
            <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={isPending || otp.length !== 6}
            onClick={() => { setError(''); signInMutation.mutate() }}
          >
            {signInMutation.isPending ? 'Verifying...' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-v-purple font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              onClick={() => { setStep('phone'); setOtp(''); setError('') }}
            >
              Change number
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

      <p className="text-sm text-v-text-2 mt-6 text-center">
        New to LoyalGenie?{' '}
        <Link to="/signup" className="text-v-purple font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </AuthShell>
  )
}
