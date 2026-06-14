import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { CustomerComingSoon, type AuthAudience } from '@/components/auth/AuthRoleToggle'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { signInBusiness } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface SignInForm {
  email: string
  password: string
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') === 'customer' ? 'customer' : 'business') as AuthAudience
  const [audience, setAudience] = useState<AuthAudience>(initialRole)
  const [error, setError] = useState('')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/vendor/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>()

  const mutation = useMutation({
    mutationFn: (data: SignInForm) => signInBusiness(data.email, data.password),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        onboarded: data.onboarded ?? true,
      })
      navigate(data.onboarded === false ? '/onboarding' : from, { replace: true })
    },
    onError: () => setError('Invalid email or password. Please try again.'),
  })

  return (
    <AuthShell
      title="Welcome back"
      subtitle={audience === 'business' ? 'Sign in to your business dashboard' : 'Sign in to your customer wallet'}
      audience={audience}
      onAudienceChange={setAudience}
    >
      {audience === 'customer' ? (
        <CustomerComingSoon />
      ) : (
        <>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-xs text-v-danger">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-xs text-v-danger">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
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
