import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { CustomerComingSoon, type AuthAudience } from '@/components/auth/AuthRoleToggle'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { signUpBusiness, getApiErrorMessage } from '@/lib/api'
import { setSession } from '@/lib/auth'

interface AccountForm {
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

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AccountForm>()

  const mutation = useMutation({
    mutationFn: ({ email, password }: AccountForm) => signUpBusiness(email, password),
    onSuccess: (data) => {
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        onboarded: false,
      })
      navigate('/onboarding')
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not create account. Email may already be in use.')),
  })

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        audience === 'business'
          ? 'Step 1 of 2 — set your login credentials, then complete business onboarding'
          : 'Join LoyalGenie as a customer'
      }
      audience={audience}
      onAudienceChange={setAudience}
    >
      {audience === 'customer' ? (
        <CustomerComingSoon />
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

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Business email</Label>
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
                autoComplete="new-password"
                placeholder="Min 8 characters"
                {...register('password', { required: true, minLength: 8 })}
              />
              {errors.password?.type === 'minLength' && (
                <p className="text-xs text-v-danger">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: true,
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-v-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating account...' : 'Continue to onboarding →'}
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
