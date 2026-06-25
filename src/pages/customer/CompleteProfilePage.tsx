import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import {
  buildDateOfBirth,
  DateOfBirthFields,
  validateDateOfBirth,
} from '@/components/auth/DateOfBirthFields'
import { completeCustomerProfile, getApiErrorMessage } from '@/lib/api'
import { getUser, setSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'

interface ProfileForm {
  name: string
  gender: 'male' | 'female' | 'other' | ''
  dobDay: string
  dobMonth: string
  dobYear: string
  email: string
}

export function CompleteProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const from = searchParams.get('from') ?? '/customer'

  const form = useForm<ProfileForm>({
    defaultValues: { name: '', gender: '', dobDay: '', dobMonth: '', dobYear: '', email: '' },
  })

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => {
      const dateOfBirth = buildDateOfBirth(data.dobDay, data.dobMonth, data.dobYear)
      if (!dateOfBirth) throw new Error('Enter a valid date of birth')
      return completeCustomerProfile({
        name: data.name,
        gender: data.gender as 'male' | 'female' | 'other',
        dateOfBirth,
        email: data.email.trim() || undefined,
      })
    },
    onSuccess: (data) => {
      const current = getUser('customer')
      setSession(data.token, {
        userId: data.userId,
        email: data.email,
        role: 'customer',
        name: data.name,
        phone: data.phone ?? current?.phone,
        profileComplete: true,
      })
      navigate(from.startsWith('/customer') ? from : '/customer', { replace: true })
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not save your profile. Please try again.')),
  })

  const isPending = profileMutation.isPending

  return (
    <div className="min-h-dvh flex flex-col px-6 py-8 bg-[#f6f3ff]">
      <Link
        to={from.startsWith('/customer') ? from : '/customer'}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-v-text-2 hover:text-v-purple mb-6 no-underline w-fit transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <Link to="/customer" className="inline-flex items-center gap-2 text-v-text font-black text-xl mb-8 no-underline w-fit">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border border-gold/35"
          style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)' }}
        >
          🧞
        </span>
        Loyal<span className="text-v-purple">Genie</span>
      </Link>

      <div className="max-w-md w-full mx-auto">
        <h1 className="text-2xl font-extrabold text-v-text mb-2">Complete your profile</h1>
        <p className="text-v-text-2 text-sm mb-8">Tell us a bit about yourself</p>

        <form
          onSubmit={form.handleSubmit((d) => {
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
              className="rounded-full"
              {...form.register('name', { required: 'Name is required', minLength: 2 })}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-v-danger">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              className="w-full h-11 rounded-full border border-v-border bg-white px-4 text-sm text-v-text focus:outline-none focus:ring-2 focus:ring-v-purple/40"
              {...form.register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {form.formState.errors.gender && (
              <p className="text-xs text-v-danger">{form.formState.errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date of birth</Label>
            <Controller
              name="dobDay"
              control={form.control}
              rules={{
                validate: () => {
                  const { dobDay, dobMonth, dobYear } = form.getValues()
                  return validateDateOfBirth(dobDay, dobMonth, dobYear)
                },
              }}
              render={({ field: dayField }) => (
                <Controller
                  name="dobMonth"
                  control={form.control}
                  render={({ field: monthField }) => (
                    <Controller
                      name="dobYear"
                      control={form.control}
                      render={({ field: yearField }) => (
                        <DateOfBirthFields
                          day={dayField.value}
                          month={monthField.value}
                          year={yearField.value}
                          onDayChange={dayField.onChange}
                          onMonthChange={monthField.onChange}
                          onYearChange={yearField.onChange}
                          disabled={isPending}
                          error={form.formState.errors.dobDay?.message}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-v-text-2 font-normal">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              className="rounded-full"
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

          <Button type="submit" variant="primary" className="w-full rounded-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save & continue →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
