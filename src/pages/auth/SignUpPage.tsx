import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { type AuthAudience } from '@/components/auth/AuthRoleToggle'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { signUpBusiness, signUpCustomer, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface BusinessAccountForm {
  email: string
  password: string
  confirmPassword: string
}

interface CustomerAccountForm {
  name: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') === 'customer' ? 'customer' : 'business') as AuthAudience
  const [audience, setAudience] = useState<AuthAudience>(initialRole)
  const [error, setError] = useState('')

  const businessForm = useForm<BusinessAccountForm>()
  const customerForm = useForm<CustomerAccountForm>()

  const businessMutation = useMutation({
    mutationFn: ({ email, password }: BusinessAccountForm) => signUpBusiness(email, password),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'business',
        onboarded: false,
      })
      navigate('/onboarding')
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not create account. Email may already be in use.')),
  })

  const customerMutation = useMutation({
    mutationFn: ({ name, phone, email, password }: CustomerAccountForm) =>
      signUpCustomer({ name, phone, email, password }),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'customer',
        name: data.name,
        phone: data.phone,
      })
      navigate('/customer')
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not create account. Email or phone may already be in use.')),
  })

  const isPending = businessMutation.isPending || customerMutation.isPending

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        audience === 'business'
          ? 'Step 1 of 2 — set your login credentials, then complete business onboarding'
          : 'Join LoyalGenie and start winning rewards at your favourite spots'
      }
      audience={audience}
      onAudienceChange={(role) => {
        setAudience(role)
        setError('')
      }}
    >
      {audience === 'customer' ? (
        <>
          <form
            onSubmit={customerForm.handleSubmit((d) => {
              setError('')
              customerMutation.mutate(d)
            })}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Priya Sharma"
                {...customerForm.register('name', { required: 'Name is required', minLength: 2 })}
              />
              {customerForm.formState.errors.name && (
                <p className="text-xs text-v-danger">{customerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                {...customerForm.register('phone', { required: 'Phone is required', minLength: 10 })}
              />
              {customerForm.formState.errors.phone && (
                <p className="text-xs text-v-danger">{customerForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                {...customerForm.register('email', { required: 'Email is required' })}
              />
              {customerForm.formState.errors.email && (
                <p className="text-xs text-v-danger">{customerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-password">Password</Label>
              <PasswordInput
                id="customer-password"
                autoComplete="new-password"
                placeholder="Min 8 characters"
                {...customerForm.register('password', { required: true, minLength: 8 })}
              />
              {customerForm.formState.errors.password?.type === 'minLength' && (
                <p className="text-xs text-v-danger">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-confirm">Confirm password</Label>
              <PasswordInput
                id="customer-confirm"
                autoComplete="new-password"
                {...customerForm.register('confirmPassword', {
                  required: true,
                  validate: (v) => v === customerForm.watch('password') || 'Passwords do not match',
                })}
              />
              {customerForm.formState.errors.confirmPassword && (
                <p className="text-xs text-v-danger">{customerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create account & explore →'}
            </Button>
          </form>

          <p className="text-sm text-v-text-2 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/signin?role=customer" className="text-v-purple font-semibold hover:underline">Sign in</Link>
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-v-purple/5 border border-v-purple/15">
            <div className="w-8 h-8 rounded-full bg-v-purple text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div className="text-sm text-v-text-2">
              <span className="font-semibold text-v-text">Account credentials</span>
              <span className="block text-xs mt-0.5">You&apos;ll use this email and password to sign in to your dashboard.</span>
            </div>
            <Check className="w-4 h-4 text-v-purple ml-auto shrink-0 opacity-40" />
          </div>

          <form
            onSubmit={businessForm.handleSubmit((d) => {
              setError('')
              businessMutation.mutate(d)
            })}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Business email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                {...businessForm.register('email', { required: 'Email is required' })}
              />
              {businessForm.formState.errors.email && (
                <p className="text-xs text-v-danger">{businessForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="Min 8 characters"
                {...businessForm.register('password', { required: true, minLength: 8 })}
              />
              {businessForm.formState.errors.password?.type === 'minLength' && (
                <p className="text-xs text-v-danger">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                {...businessForm.register('confirmPassword', {
                  required: true,
                  validate: (v) => v === businessForm.watch('password') || 'Passwords do not match',
                })}
              />
              {businessForm.formState.errors.confirmPassword && (
                <p className="text-xs text-v-danger">{businessForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Continue to onboarding →'}
            </Button>
          </form>

          <p className="text-sm text-v-text-2 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/signin" className="text-v-purple font-semibold hover:underline">Sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}

/** @deprecated use SignUpPage */
export const BusinessSignUpPage = SignUpPage
