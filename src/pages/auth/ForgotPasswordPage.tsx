import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthShell } from '@/components/auth/AuthShell'
import { type AuthAudience } from '@/components/auth/AuthRoleToggle'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { resetPasswordByEmail, getApiErrorMessage } from '@/lib/api'

interface ForgotForm {
  email: string
  password: string
  confirmPassword: string
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = (searchParams.get('role') === 'customer' ? 'customer' : 'business') as AuthAudience
  const [done, setDone] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ForgotForm>()

  const mutation = useMutation({
    mutationFn: ({ email, password }: ForgotForm) => resetPasswordByEmail(role, email, password),
    onSuccess: () => setDone(true),
  })

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your account email and choose a new password."
      audience={role}
      onAudienceChange={() => {}}
      showRoleToggle={false}
    >
      {done ? (
        <div className="space-y-5">
          <p className="text-sm text-v-text-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
            Your password has been updated. You can sign in with your new password.
          </p>
          <Button variant="primary" className="w-full" onClick={() => navigate(`/signin?role=${role}`, { replace: true })}>
            Go to sign in
          </Button>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={role === 'customer' ? 'you@email.com' : 'you@yourbusiness.com'}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && (
                <p className="text-xs text-v-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="Min 8 characters"
                {...register('password', { required: true, minLength: 8 })}
              />
              {errors.password?.type === 'minLength' && (
                <p className="text-xs text-v-danger">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
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

            {mutation.isError && (
              <p className="text-sm text-v-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {getApiErrorMessage(mutation.error, 'Could not reset password. Try again.')}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Reset password'}
            </Button>
          </form>

          <p className="text-sm text-v-text-2 mt-6 text-center">
            Remember your password?{' '}
            <Link to={`/signin?role=${role}`} className="text-v-purple font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
