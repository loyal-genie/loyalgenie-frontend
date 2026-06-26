import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { PhoneInput } from '@/components/auth/PhoneInput'
import {
  sendOtp,
  loginCustomerWithOtp,
  fetchBusinessBySlug,
  getApiErrorMessage,
} from '@/lib/api'
import { setSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'

type Step = 'phone' | 'otp'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionReason = searchParams.get('reason')
  const businessSlug = searchParams.get('b')
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const fromQuery = searchParams.get('from')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname
    ?? (fromQuery && fromQuery.startsWith('/') ? fromQuery : null)
    ?? '/customer'

  const { data: joinBusiness } = useQuery({
    queryKey: ['business-join', businessSlug],
    queryFn: () => fetchBusinessBySlug(businessSlug!),
    enabled: Boolean(businessSlug),
    retry: false,
  })

  const businessId = joinBusiness?.id as string | undefined
  const businessName = (joinBusiness?.name as string | undefined) ?? null

  function goToCustomerHome() {
    if (businessId) {
      navigate(`/customer/business/${businessId}`, { replace: true })
      return
    }
    navigate(from.startsWith('/customer') ? from : '/customer', { replace: true })
  }

  function saveSession(data: {
    token: string
    userId: string
    email: string
    name?: string
    phone?: string
    profileComplete?: boolean
  }) {
    setSession(data.token, {
      userId: data.userId,
      email: data.email,
      role: 'customer',
      name: data.name,
      phone: data.phone,
      profileComplete: data.profileComplete !== false,
    })
  }

  const sendMutation = useMutation({
    mutationFn: () => sendOtp(phone),
    onSuccess: () => {
      setError('')
      setStep('otp')
      setOtp('')
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not send OTP. Please try again.')),
  })

  const loginMutation = useMutation({
    mutationFn: () => loginCustomerWithOtp(phone, otp),
    onSuccess: async (data) => {
      setError('')
      if (!data.token || !data.userId) {
        setError('Could not sign in. Please try again.')
        return
      }
      saveSession({
        token: data.token,
        userId: data.userId,
        email: data.email ?? '',
        name: data.name,
        phone: data.phone,
        profileComplete: data.profileComplete,
      })
      await goToCustomerHome()
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.')),
  })

  const isPending = sendMutation.isPending || loginMutation.isPending

  function handleSendOtp() {
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    sendMutation.mutate()
  }

  const title = businessName ? `Join ${businessName}` : 'Welcome'
  const subtitle = step === 'phone'
    ? businessName
      ? 'Enter your mobile number to join the loyalty program'
      : 'Enter your mobile number to continue'
    : 'Enter the OTP sent to your phone'

  return (
    <AuthShell title={title} subtitle={subtitle} showRoleToggle={false}>
      {sessionReason === 'session_expired' && step === 'phone' && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Your session expired. Sign in again to continue playing.
        </p>
      )}

      {step === 'phone' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <PhoneInput id="phone" value={phone} onChange={setPhone} disabled={isPending} />
          </div>
          {error && (
            <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}
          <Button type="button" variant="primary" className="w-full" disabled={isPending} onClick={handleSendOtp}>
            {sendMutation.isPending ? 'Sending OTP...' : 'Continue'}
          </Button>
        </div>
      )}

      {step === 'otp' && (
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
            onClick={() => { setError(''); loginMutation.mutate() }}
          >
            {loginMutation.isPending ? 'Verifying...' : 'Continue'}
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
    </AuthShell>
  )
}
