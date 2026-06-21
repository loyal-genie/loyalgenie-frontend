import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreditCard, Globe, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { VendorPageHeader } from '@/components/vendor/VendorPageHeader'
import { VendorSettingsBilling } from '@/components/vendor/VendorSettingsBilling'
import { VendorSettingsQrTab } from '@/components/vendor/VendorSettingsQrTab'
import { ProfileImageUpload } from '@/components/vendor/ProfileImageUpload'
import { useBusinessProfile, useUpdateBusinessProfile } from '@/hooks/useBusinessProfile'
import { getApiErrorMessage, type BusinessProfile, type BusinessProfileUpdate } from '@/lib/api'
import { brandColors, businessTypes } from '@/content/onboarding'

type SettingsTab = 'profile' | 'billing' | 'qr'

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Business Profile', icon: <Star className="w-3.5 h-3.5" /> },
  { key: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { key: 'qr', label: 'QR Code', icon: <Globe className="w-3.5 h-3.5" /> },
]

function profileToForm(p: BusinessProfile): BusinessProfileUpdate {
  return {
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    businessType: p.businessType,
    ownerName: p.ownerName,
    mobile: p.mobile,
    whatsapp: p.whatsapp,
    email: p.email,
    city: p.city,
    pincode: p.pincode,
    landmark: p.landmark,
    address: p.address,
    mapLink: p.mapLink,
    operatingHours: p.operatingHours,
    weeklyOff: p.weeklyOff,
    branchName: p.branchName,
    branchCity: p.branchCity,
    branchAddress: p.branchAddress,
    brandColor: p.brandColor,
    instagram: p.instagram,
    facebook: p.facebook,
    website: p.website,
    googleReview: p.googleReview,
    rating: p.rating ?? null,
    logoData: p.logoData,
    coverBannerData: p.coverBannerData,
    interiorPhotosData: p.interiorPhotosData ?? [],
    exteriorPhotosData: p.exteriorPhotosData ?? [],
  }
}

export function VendorSettingsPage() {
  const { data: profile, isLoading } = useBusinessProfile()
  const updateMutation = useUpdateBusinessProfile()
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [tab, setTab] = useState<SettingsTab>('profile')

  const { register, handleSubmit, reset, watch, setValue } = useForm<BusinessProfileUpdate>()

  useEffect(() => {
    if (profile) reset(profileToForm(profile))
  }, [profile, reset])

  const brandColor = watch('brandColor')
  const logoData = watch('logoData') ?? ''
  const coverBannerData = watch('coverBannerData') ?? ''
  const interiorPhotosData = watch('interiorPhotosData') ?? []
  const exteriorPhotosData = watch('exteriorPhotosData') ?? []

  function onSubmit(data: BusinessProfileUpdate) {
    setSaveMessage(null)
    updateMutation.mutate(
      {
        ...data,
        brandColor,
        logoData,
        coverBannerData,
        interiorPhotosData,
        exteriorPhotosData,
      },
      {
      onSuccess: () => setSaveMessage('Profile saved successfully.'),
      onError: (err) => setSaveMessage(getApiErrorMessage(err, 'Failed to save profile.')),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <p className="text-v-text-2 text-sm">Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6">
      <VendorPageHeader
        title="Settings"
        subtitle="Manage your profile, plan, and integrations"
      />

      <div className="flex gap-1 mb-7 bg-v-surface-2 border border-v-border rounded-xl p-1 w-fit overflow-x-auto max-w-full">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border-0',
              tab === t.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-2 hover:text-v-text bg-transparent',
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'billing' && <VendorSettingsBilling />}
      {tab === 'qr' && <VendorSettingsQrTab />}

      {tab === 'profile' && (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1 — Business basics */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-sm font-bold text-v-text mb-1">Tell us about your café</h2>
          <p className="text-xs text-v-text-3 mb-4">The basics — who you are, what you&apos;re called, and how we reach you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-v-danger">*</span></Label>
              <Input id="name" {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register('tagline')} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="w-full rounded-xl px-4 py-2.5 text-sm border border-v-border bg-v-surface text-v-text outline-none focus:border-v-purple resize-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="businessType">Business Type <span className="text-v-danger">*</span></Label>
              <select
                id="businessType"
                {...register('businessType')}
                className="w-full rounded-xl px-4 py-2.5 text-sm border border-v-border bg-v-surface text-v-text outline-none focus:border-v-purple"
              >
                <option value="">Select business type</option>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-v-border">
            <h3 className="text-sm font-bold text-v-text mb-1">Contact information</h3>
            <p className="text-xs text-v-text-3 mb-4">So we know who to ring when the magic&apos;s ready.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ownerName">Owner Name <span className="text-v-danger">*</span></Label>
                <Input id="ownerName" {...register('ownerName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number <span className="text-v-danger">*</span></Label>
                <Input id="mobile" {...register('mobile')} placeholder="+91 9XXXX XXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" {...register('whatsapp')} placeholder="+91 9XXXX XXXXX" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="email">Email Address <span className="text-v-danger">*</span></Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2 — Location & timings */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-sm font-bold text-v-text mb-1">Café Details</h2>
          <p className="text-xs text-v-text-3 mb-4">Where customers find you and when you&apos;re open.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-v-danger">*</span></Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input id="landmark" {...register('landmark')} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <textarea
                id="address"
                rows={2}
                {...register('address')}
                className="w-full rounded-xl px-4 py-2.5 text-sm border border-v-border bg-v-surface text-v-text outline-none focus:border-v-purple resize-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="mapLink">Google Map Link</Label>
              <Input id="mapLink" {...register('mapLink')} />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-v-border">
            <h3 className="text-sm font-bold text-v-text mb-1">Timings</h3>
            <p className="text-xs text-v-text-3 mb-4">So customers know when to visit.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input id="operatingHours" {...register('operatingHours')} placeholder="e.g. Open until 10 PM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Google Rating (0–5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  {...register('rating', { valueAsNumber: true })}
                  placeholder="e.g. 4.7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyOff">Weekly Off Days</Label>
                <Input id="weeklyOff" {...register('weeklyOff')} placeholder="e.g. None / Sunday" />
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 — Branch */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-sm font-bold text-v-text mb-1">Branch</h2>
          <p className="text-xs text-v-text-3 mb-4">Your primary location details.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input id="branchName" {...register('branchName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCity">Branch City</Label>
              <Input id="branchCity" {...register('branchCity')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchAddress">Branch Address</Label>
              <Input id="branchAddress" {...register('branchAddress')} />
            </div>
          </div>
        </Card>

        {/* Step 4 — Brand color */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-sm font-bold text-v-text mb-1">Brand Colour</h2>
          <p className="text-xs text-v-text-3 mb-4">Primary colour your customers see across the LoyalGenie app.</p>
          <div className="flex flex-wrap gap-2">
            {brandColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('brandColor', c)}
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 transition-transform hover:scale-110 cursor-pointer',
                  brandColor === c ? 'border-v-text scale-110' : 'border-transparent',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </Card>

        {/* Step 5 — Brand assets & social */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-sm font-bold text-v-text mb-1">Brand Your Cafe</h2>
          <p className="text-xs text-v-text-3 mb-4">Logo, photos, and social links shown in your customer app profile.</p>
          <div className="space-y-5">
            <ProfileImageUpload
              label="Logo"
              hint="PNG/SVG, transparent background preferred"
              value={logoData}
              onChange={(v) => setValue('logoData', v)}
            />
            <ProfileImageUpload
              label="Cover Banner Image"
              hint="1920×600px recommended"
              value={coverBannerData}
              onChange={(v) => setValue('coverBannerData', v)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileImageUpload
                label="Interior Photos"
                hint="Add a few photos inside"
                values={interiorPhotosData}
                onMultiChange={(v) => setValue('interiorPhotosData', v)}
                multiple
              />
              <ProfileImageUpload
                label="Exterior Photos"
                hint="Add photos outside"
                values={exteriorPhotosData}
                onMultiChange={(v) => setValue('exteriorPhotosData', v)}
                multiple
              />
            </div>

            <div className="pt-4 border-t border-v-border">
              <h3 className="text-sm font-bold text-v-text mb-1">Social media handles</h3>
              <p className="text-xs text-v-text-3 mb-4">Linked inside your customer app profile.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" {...register('instagram')} placeholder="@yourhandle" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" {...register('facebook')} placeholder="@yourpage" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...register('website')} placeholder="https://yoursite.com" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="googleReview">Google Review Link</Label>
                  <Input id="googleReview" {...register('googleReview')} placeholder="Paste your Google review link" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {profile?.qrSlug && (
          <Card className="p-4 bg-v-purple/5 border-v-purple/20">
            <p className="text-xs text-v-text-2">
              Your public join link: <code className="font-mono text-v-purple font-semibold">/{profile.qrSlug}</code>
              {' '}(cannot be changed)
            </p>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button type="submit" variant="primary" disabled={updateMutation.isPending} className="w-full sm:w-auto">
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
          {saveMessage && (
            <p className={cn('text-sm text-center sm:text-left', saveMessage.includes('success') ? 'text-v-success' : 'text-v-danger')}>
              {saveMessage}
            </p>
          )}
        </div>
      </form>
      )}
    </div>
  )
}
