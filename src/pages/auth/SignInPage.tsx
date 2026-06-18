import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { PhoneInput } from '@/components/auth/PhoneInput'
import {
  sendOtp,
  loginCustomerWithOtp,
  completeCustomerProfile,
  getApiErrorMessage,
} from '@/lib/api'
import { setSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'

type Step = 'phone' | 'otp' | 'profile'

interface ProfileForm {
  name: string
  gender: 'male' | 'female' | 'other' | ''
  dateOfBirth: string
  email: string
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionReason = searchParams.get('reason')
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [profileToken, setProfileToken] = useState('')
  const [error, setError] = useState('')

  const profileForm = useForm<ProfileForm>({
    defaultValues: { name: '', gender: '', dateOfBirth: '', email: '' },
  })

  const fromQuery = searchParams.get('from')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname
    ?? (fromQuery && fromQuery.startsWith('/') ? fromQuery : null)
    ?? '/customer'

  function goToCustomerHome() {
    navigate(from.startsWith('/customer') ? from : '/customer', { replace: true })
  }

  function saveSession(data: { token: string; userId: string; email: string; name?: string; phone?: string }) {
    setSession(data.token, {
      userId: data.userId,
      email: data.email,
      role: 'customer',
      name: data.name,
      phone: data.phone,
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
      if (data.isNewUser) {
        if (!data.profileToken) {
          setError('Could not start profile setup. Please try again.')
          return
        }
        setProfileToken(data.profileToken)
        setStep('profile')
        return
      }
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
      })
      await goToCustomerHome()
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.')),
  })

  const profileMutation = useMutation({
    mutationFn: (form: ProfileForm) =>
      completeCustomerProfile({
        profileToken,
        name: form.name,
        gender: form.gender as 'male' | 'female' | 'other',
        dateOfBirth: form.dateOfBirth,
        email: form.email.trim() || undefined,
      }),
    onSuccess: async (data) => {
      saveSession(data)
      await goToCustomerHome()
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not save your profile. Please try again.')),
  })

  const isPending = sendMutation.isPending || loginMutation.isPending || profileMutation.isPending

  function handleSendOtp() {
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    sendMutation.mutate()
  }

  const title = step === 'profile' ? 'Complete your profile' : 'Welcome'
  const subtitle = step === 'phone'
    ? 'Enter your mobile number to continue'
    : step === 'otp'
      ? 'Enter the OTP sent to your phone'
      : 'Tell us a bit about yourself'

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

      {step === 'profile' && (
        <form
          onSubmit={profileForm.handleSubmit((d) => {
            setError('')
            profileMutation.mutate(d)
          })}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Priya Sharma"
              {...profileForm.register('name', { required: 'Name is required', minLength: 2 })}
            />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-v-danger">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              className="w-full h-11 rounded-full border border-v-border bg-white px-4 text-sm text-v-text focus:outline-none focus:ring-2 focus:ring-v-purple/40"
              {...profileForm.register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {profileForm.formState.errors.gender && (
              <p className="text-xs text-v-danger">{profileForm.formState.errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              {...profileForm.register('dateOfBirth', { required: 'Date of birth is required' })}
            />
            {profileForm.formState.errors.dateOfBirth && (
              <p className="text-xs text-v-danger">{profileForm.formState.errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-v-text-2 font-normal">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              {...profileForm.register('email', {
                validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email',
              })}
            />
            {profileForm.formState.errors.email && (
              <p className="text-xs text-v-danger">{profileForm.formState.errors.email.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
            {profileMutation.isPending ? 'Saving...' : 'Go to dashboard →'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
