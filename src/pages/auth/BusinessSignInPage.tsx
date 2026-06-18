import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { signInBusiness, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface BusinessSignInForm {
  email: string
  password: string
}

export function BusinessSignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const form = useForm<BusinessSignInForm>()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/vendor/dashboard'

  const mutation = useMutation({
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
      form.setError('root', { message: msg })
    },
  })

  return (
    <AuthShell
      title="Business sign in"
      subtitle="Sign in to your business dashboard"
      showRoleToggle={false}
      audience="business"
    >
      <form
        onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Business email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            {...form.register('email', { required: 'Email is required' })}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-v-danger">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/business/forgot-password"
              className="text-xs font-semibold text-v-purple hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...form.register('password', { required: 'Password is required' })}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-v-danger">{form.formState.errors.password.message}</p>
          )}
        </div>

        {form.formState.errors.root && (
          <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-sm text-v-text-2 mt-6 text-center">
        New to LoyalGenie?{' '}
        <Link to="/business/signup" className="text-v-purple font-semibold hover:underline">
          Create business account
        </Link>
      </p>
    </AuthShell>
  )
}
