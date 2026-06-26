import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  buildDateOfBirth,
  DateOfBirthFields,
  validateDateOfBirth,
} from '@/components/auth/DateOfBirthFields'
import { BottomNav } from '@/components/customer/bottom-nav'
import { getApiErrorMessage } from '@/lib/api'
import { parseDateOfBirth, PROFILE_FIELD_LABELS } from '@/lib/customer-profile'
import { getUser, setSession } from '@/lib/auth'
import { useCustomerProfile, useUpdateCustomerProfile } from '@/hooks/useCustomerData'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'

interface EditProfileForm {
  name: string
  gender: 'male' | 'female' | 'other' | ''
  dobDay: string
  dobMonth: string
  dobYear: string
  email: string
}

export function CustomerProfileEditPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useCustomerProfile()
  const updateMutation = useUpdateCustomerProfile()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const form = useForm<EditProfileForm>({
    defaultValues: { name: '', gender: '', dobDay: '', dobMonth: '', dobYear: '', email: '' },
  })

  useEffect(() => {
    if (!profile) return
    const dob = parseDateOfBirth(profile.dateOfBirth)
    form.reset({
      name: profile.name,
      gender: (profile.gender as EditProfileForm['gender']) ?? '',
      dobDay: dob.day,
      dobMonth: dob.month,
      dobYear: dob.year,
      email: profile.email ?? '',
    })
  }, [profile, form])

  const isPending = updateMutation.isPending

  function onSubmit(data: EditProfileForm) {
    setError('')
    setSaved(false)

    const dateOfBirth = buildDateOfBirth(data.dobDay, data.dobMonth, data.dobYear)
    if ((data.dobDay || data.dobMonth || data.dobYear) && !dateOfBirth) {
      setError('Enter a valid date of birth')
      return
    }

    updateMutation.mutate(
      {
        name: data.name.trim(),
        gender: data.gender ? data.gender : null,
        dateOfBirth: dateOfBirth ?? null,
        email: data.email.trim() || null,
      },
      {
        onSuccess: (result) => {
          const current = getUser('customer')
          setSession(result.token, {
            userId: result.userId,
            email: result.email,
            role: 'customer',
            name: result.name,
            phone: result.phone ?? current?.phone,
            profileComplete: result.profileComplete,
          })
          setSaved(true)
          if (result.profileComplete) {
            setTimeout(() => navigate('/customer/profile', { replace: true }), 600)
          }
        },
        onError: (err) => setError(getApiErrorMessage(err, 'Could not save profile. Please try again.')),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <Loader2 className="size-8 text-[#5b0e81] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="px-5 pt-14 pb-6 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate('/customer/profile')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#5b0e81] mb-6 bg-transparent border-0 cursor-pointer p-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Edit profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Add the details below when you&apos;re ready. All fields can be saved at any time.
        </p>

        {profile && !profile.profileComplete && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold mb-1">Profile incomplete</p>
            <p className="text-xs text-amber-800">
              Still needed:{' '}
              {profile.missingFields.map(f => PROFILE_FIELD_LABELS[f]).join(', ')}
            </p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
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
              {...form.register('gender')}
            >
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date of birth</Label>
            <Controller
              name="dobDay"
              control={form.control}
              rules={{
                validate: () => {
                  const { dobDay, dobMonth, dobYear } = form.getValues()
                  if (!dobDay && !dobMonth && !dobYear) return true
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
            <Label htmlFor="email">Email</Label>
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

          {saved && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              Profile saved successfully.
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full rounded-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
