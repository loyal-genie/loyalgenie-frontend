import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { signUpBusiness, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface BusinessAccountForm {
  email: string
  password: string
  confirmPassword: string
}

export function BusinessSignUpPage() {
  const navigate = useNavigate()
  const form = useForm<BusinessAccountForm>()

  const mutation = useMutation({
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
    onError: (err) => {
      form.setError('root', { message: getApiErrorMessage(err, 'Could not create account. Email may already be in use.') })
    },
  })

  return (
    <AuthShell
      title="Create business account"
      subtitle="Step 1 of 2 — set your login credentials, then complete business onboarding"
      showRoleToggle={false}
      audience="business"
    >
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-v-purple/5 border border-v-purple/15">
        <div className="w-8 h-8 rounded-full bg-v-purple text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
        <div className="text-sm text-v-text-2">
          <span className="font-semibold text-v-text">Account credentials</span>
          <span className="block text-xs mt-0.5">You&apos;ll use this email and password to sign in to your dashboard.</span>
        </div>
        <Check className="w-4 h-4 text-v-purple ml-auto shrink-0 opacity-40" />
      </div>

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
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Min 8 characters"
            {...form.register('password', { required: true, minLength: 8 })}
          />
          {form.formState.errors.password?.type === 'minLength' && (
            <p className="text-xs text-v-danger">Password must be at least 8 characters</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...form.register('confirmPassword', {
              required: true,
              validate: (v) => v === form.watch('password') || 'Passwords do not match',
            })}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-v-danger">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {form.formState.errors.root && (
          <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating account...' : 'Continue to onboarding →'}
        </Button>
      </form>

      <p className="text-sm text-v-text-2 mt-6 text-center">
        Already have an account?{' '}
        <Link to="/business/signin" className="text-v-purple font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
