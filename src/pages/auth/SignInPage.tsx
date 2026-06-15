import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { type AuthAudience } from '@/components/auth/AuthRoleToggle'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { signInBusiness, signInCustomer, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface BusinessSignInForm {
  email: string
  password: string
}

interface CustomerSignInForm {
  email: string
  password: string
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') === 'customer' ? 'customer' : 'business') as AuthAudience
  const [audience, setAudience] = useState<AuthAudience>(initialRole)
  const sessionReason = searchParams.get('reason')
  const [error, setError] = useState('')
  const fromQuery = searchParams.get('from')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname
    ?? (fromQuery && fromQuery.startsWith('/') ? fromQuery : null)
    ?? (audience === 'customer' ? '/customer' : '/vendor/dashboard')

  const businessForm = useForm<BusinessSignInForm>()
  const customerForm = useForm<CustomerSignInForm>()

  const businessMutation = useMutation({
    mutationFn: (data: BusinessSignInForm) => signInBusiness(data.email, data.password),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'business',
        onboarded: data.onboarded ?? true,
      })
      navigate(data.onboarded === false ? '/onboarding' : from, { replace: true })
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Invalid email or password. Please try again.')
      setError(msg.includes('404') || msg.toLowerCase().includes('not found')
        ? 'Sign-in service is unavailable. The server may need an update — try again later or contact support.'
        : msg)
    },
  })

  const customerMutation = useMutation({
    mutationFn: (data: CustomerSignInForm) => signInCustomer(data.email, data.password),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'customer',
        name: data.name,
        phone: data.phone,
      })
      navigate(from.startsWith('/customer') ? from : '/customer', { replace: true })
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Invalid email or password. Please try again.')
      setError(msg.includes('404') || msg.toLowerCase().includes('not found')
        ? 'Customer sign-in is unavailable. The server may need an update — try again later.'
        : msg)
    },
  })

  const isPending = businessMutation.isPending || customerMutation.isPending

  return (
    <AuthShell
      title="Welcome back"
      subtitle={audience === 'business' ? 'Sign in to your business dashboard' : 'Sign in to your customer wallet'}
      audience={audience}
      onAudienceChange={(role) => {
        setAudience(role)
        setError('')
      }}
    >
      {sessionReason === 'session_expired' && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Your session expired. Sign in again to continue playing.
        </p>
      )}
      {sessionReason === 'wrong_role' && (
        <p className="mb-4 text-sm text-purple-800 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          This area requires a {audience === 'customer' ? 'customer' : 'business'} account. Sign in with the correct account type.
        </p>
      )}
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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="customer-password">Password</Label>
                <Link
                  to="/forgot-password?role=customer"
                  className="text-xs font-semibold text-v-purple hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="customer-password"
                autoComplete="current-password"
                {...customerForm.register('password', { required: 'Password is required' })}
              />
              {customerForm.formState.errors.password && (
                <p className="text-xs text-v-danger">{customerForm.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-v-text-2 mt-6 text-center">
            New to LoyalGenie?{' '}
            <Link to="/signup?role=customer" className="text-v-purple font-semibold hover:underline">
              Create customer account
            </Link>
          </p>
        </>
      ) : (
        <>
          <form
            onSubmit={businessForm.handleSubmit((d) => {
              setError('')
              businessMutation.mutate(d)
            })}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password?role=business"
                  className="text-xs font-semibold text-v-purple hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                {...businessForm.register('password', { required: 'Password is required' })}
              />
              {businessForm.formState.errors.password && (
                <p className="text-xs text-v-danger">{businessForm.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-v-text-2 mt-6 text-center">
            New to LoyalGenie?{' '}
            <Link to="/signup" className="text-v-purple font-semibold hover:underline">Create business account</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}

/** @deprecated use SignInPage */
export const BusinessSignInPage = SignInPage
