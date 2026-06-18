import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { OtpInput } from '@/components/auth/OtpInput'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { sendOtp, signUpCustomer, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface SignUpForm {
  name: string
  dateOfBirth: string
  email: string
  phone: string
}

type Step = 'details' | 'otp'

export function SignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('details')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [savedDetails, setSavedDetails] = useState<SignUpForm | null>(null)

  const form = useForm<SignUpForm>({
    defaultValues: { name: '', dateOfBirth: '', email: '', phone: '' },
  })

  const sendMutation = useMutation({
    mutationFn: (phone: string) => sendOtp(phone, 'signup'),
    onSuccess: () => {
      setError('')
      setStep('otp')
      setOtp('')
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not send OTP. Please try again.')),
  })

  const signUpMutation = useMutation({
    mutationFn: (details: SignUpForm) =>
      signUpCustomer({
        name: details.name,
        phone: details.phone,
        dateOfBirth: details.dateOfBirth,
        email: details.email.trim() || undefined,
        otp,
      }),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'customer',
        name: data.name,
        phone: data.phone,
      })
      navigate('/customer', { replace: true })
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not create account. Please try again.')),
  })

  const isPending = sendMutation.isPending || signUpMutation.isPending

  function onSubmitDetails(data: SignUpForm) {
    if (data.phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setSavedDetails(data)
    sendMutation.mutate(data.phone)
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join LoyalGenie and start winning rewards at your favourite spots"
      showRoleToggle={false}
    >
      {step === 'details' ? (
        <form onSubmit={form.handleSubmit(onSubmitDetails)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Priya Sharma"
              {...form.register('name', { required: 'Name is required', minLength: 2 })}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-v-danger">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              {...form.register('dateOfBirth', { required: 'Date of birth is required' })}
            />
            {form.formState.errors.dateOfBirth && (
              <p className="text-xs text-v-danger">{form.formState.errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Controller
              name="phone"
              control={form.control}
              rules={{ required: 'Phone is required', minLength: 10 }}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-v-danger">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-v-text-2 font-normal">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              {...form.register('email', {
                validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email',
              })}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-v-danger">{form.formState.errors.email.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
            {sendMutation.isPending ? 'Sending OTP...' : 'Verify mobile & continue →'}
          </Button>
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-v-text-2 text-center">
            OTP sent to{' '}
            <span className="font-semibold text-v-text">
              +91 {savedDetails?.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}
            </span>
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
            disabled={isPending || otp.length !== 6 || !savedDetails}
            onClick={() => {
              setError('')
              if (savedDetails) signUpMutation.mutate(savedDetails)
            }}
          >
            {signUpMutation.isPending ? 'Creating account...' : 'Create account & explore →'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-v-purple font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              onClick={() => { setStep('details'); setOtp(''); setError('') }}
            >
              Edit details
            </button>
            <button
              type="button"
              className="text-v-text-2 hover:text-v-purple font-medium bg-transparent border-0 cursor-pointer disabled:opacity-50"
              disabled={sendMutation.isPending || !savedDetails}
              onClick={() => savedDetails && sendMutation.mutate(savedDetails.phone)}
            >
              {sendMutation.isPending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-v-text-2 mt-6 text-center">
        Already have an account?{' '}
        <Link to="/signin" className="text-v-purple font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
