import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Plus, Copy, Check } from 'lucide-react'
import {
  OnboardingInput,
  OnboardingTextarea,
  OnboardingSelect,
  OnboardingUpload,
  OnboardingLabel,
  Sparkle,
  onboardingTheme as D,
} from '@/components/onboarding/onboarding-fields'
import { QrStandeeCard } from '@/components/qr/QrStandeeCard'
import { brandColors, businessTypes, formStepsTotal, onboardingSections } from '@/content/onboarding'
import { completeOnboarding, getApiErrorMessage, type OnboardingPayload, type OnboardingResult } from '@/lib/api'
import { getToken, getUser, setSession } from '@/lib/auth'

type FormData = OnboardingPayload

const initial: FormData = {
  name: '',
  tagline: '',
  description: '',
  businessType: '',
  ownerName: '',
  mobile: '',
  whatsapp: '',
  email: '',
  city: '',
  pincode: '',
  landmark: '',
  address: '',
  mapLink: '',
  operatingHours: '',
  weeklyOff: '',
  branchName: '',
  branchCity: '',
  branchAddress: '',
  brandColor: '#7C3AED',
  instagram: '',
  facebook: '',
  website: '',
  googleReview: '',
  logoData: '',
  coverBannerData: '',
  interiorPhotosData: [] as string[],
  exteriorPhotosData: [] as string[],
}

function sectionOf(globalStep: number) {
  let acc = 0
  for (const sec of onboardingSections) {
    if (sec.key === 'qr') continue
    if (globalStep < acc + sec.steps) {
      return { section: sec, subStep: globalStep - acc + 1 }
    }
    acc += sec.steps
  }
  return { section: onboardingSections[0], subStep: 1 }
}

function validateStep(step: number, form: FormData): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step === 0) {
    if (!form.name.trim()) errors.name = 'Business name is required'
    if (!form.businessType) errors.businessType = 'Select a business type'
    if (!form.ownerName.trim()) errors.ownerName = 'Owner name is required'
    if (form.mobile.replace(/\D/g, '').length < 10) errors.mobile = 'Enter a valid 10-digit mobile number'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email is required'
  }
  if (step === 1) {
    if (!form.city.trim()) errors.city = 'City is required'
  }
  return errors
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = getUser('business')

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(() => ({
    ...initial,
    email: user?.email ?? '',
  }))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [qrResult, setQrResult] = useState<OnboardingResult | null>(null)
  const [copied, setCopied] = useState(false)

  const set = (k: keyof FormData) => (v: string) => setForm((p) => ({ ...p, [k]: v }))
  const setPhotos = (k: 'interiorPhotosData' | 'exteriorPhotosData') => (v: string[]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => {
      const payload: OnboardingPayload = {
        name: form.name.trim(),
        tagline: form.tagline,
        description: form.description,
        businessType: form.businessType,
        ownerName: form.ownerName.trim(),
        mobile: form.mobile.replace(/\D/g, ''),
        whatsapp: (form.whatsapp ?? '').replace(/\D/g, ''),
        email: form.email.trim(),
        city: form.city.trim(),
        pincode: form.pincode,
        landmark: form.landmark,
        address: form.address,
        mapLink: form.mapLink,
        operatingHours: form.operatingHours,
        weeklyOff: form.weeklyOff,
        branchName: form.branchName,
        branchCity: form.branchCity,
        branchAddress: form.branchAddress,
        brandColor: form.brandColor,
        instagram: form.instagram,
        facebook: form.facebook,
        website: form.website,
        googleReview: form.googleReview,
        logoData: form.logoData,
        coverBannerData: form.coverBannerData,
        interiorPhotosData: form.interiorPhotosData ?? [],
        exteriorPhotosData: form.exteriorPhotosData ?? [],
      }
      return completeOnboarding(payload)
    },
    onSuccess: (data) => {
      if (data.token) {
        setSession(data.token, {
          userId: user?.userId ?? '',
          email: form.email,
          role: 'business',
          onboarded: true,
        })
      } else if (user && getToken('business')) {
        setSession(getToken('business')!, { ...user, role: 'business', onboarded: true })
      }
      setQrResult(data)
      setStep(formStepsTotal)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to generate QR code. Please try again.')),
  })

  const showingQr = step >= formStepsTotal && qrResult
  const { section, subStep } = showingQr
    ? { section: onboardingSections.find((s) => s.key === 'qr')!, subStep: 1 }
    : sectionOf(step)

  const overallProgress = showingQr
    ? 100
    : ((step + 1) / formStepsTotal) * 85

  const isFirst = step === 0
  const isLastFormStep = step === formStepsTotal - 1

  function next() {
    const errors = validateStep(step, form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    setError('')
    if (!isLastFormStep) setStep((s) => s + 1)
  }

  function back() {
    if (showingQr) {
      setStep(formStepsTotal - 1)
      setQrResult(null)
      return
    }
    if (!isFirst) setStep((s) => s - 1)
  }

  async function copyUrl() {
    if (!qrResult) return
    const url = qrResult.joinUrl || `${window.location.origin}/${qrResult.qrSlug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQr() {
    if (!qrResult?.qrCodeDataUrl) return
    const a = document.createElement('a')
    a.href = qrResult.qrCodeDataUrl
    a.download = `${form.name.replace(/\s+/g, '-').toLowerCase()}-qr.png`
    a.click()
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #0D0B28 0%, #1A1840 60%, #0D0B28 100%)' }}
    >
      <Sparkle className="fixed top-14 left-14 opacity-60" />
      <Sparkle className="fixed top-40 right-12 opacity-40" />
      <Sparkle className="fixed bottom-32 left-8 opacity-30" />

      <div className="w-full flex justify-center pt-8 pb-2">
        <Link to="/" className="flex items-center gap-0.5 text-xl font-black tracking-tight no-underline">
          <span style={{ color: D.text }}>Loyal</span>
          <span style={{ color: D.gold }}>Genie</span>
          <span className="text-xs ml-1" style={{ color: D.gold }}>✦</span>
        </Link>
      </div>

      <div className="text-center pt-6 pb-8 px-4">
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3" style={{ color: D.text }}>
          Let&apos;s set up your Business
          
        </h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: D.textMuted }}>
          A few details and we&apos;ll have your loyalty program, branded app, and counter standee ready to go. Takes about 5 minutes.
        </p>

        <div className="max-w-lg mx-auto mt-7 px-2">
          <div className="relative flex items-center justify-between mb-1">
            <div className="absolute left-0 right-0 h-0.5 top-1/2 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div
              className="absolute left-0 h-0.5 top-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%`, background: `linear-gradient(90deg, ${D.purple}, ${D.gold})` }}
            />
            {onboardingSections.map((sec, i) => {
              const formOnlySteps = onboardingSections.filter((s) => s.key !== 'qr')
              const secStartStep = formOnlySteps.slice(0, i).reduce((s, x) => s + x.steps, 0)
              const isQrSection = sec.key === 'qr'
              const isDone = isQrSection ? Boolean(qrResult) : step >= secStartStep + sec.steps
              const isActive = sec.key === section.key
              return (
                <div key={sec.key} className="relative z-10 flex flex-col items-center gap-1.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full border-2 transition-all shrink-0"
                    style={{
                      background: isDone ? D.gold : isActive ? D.purple : 'rgba(255,255,255,0.15)',
                      borderColor: isDone ? D.gold : isActive ? D.purple : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <span
                    className="text-[10px] sm:text-xs font-semibold truncate max-w-[4.5rem] sm:max-w-none"
                    style={{ color: isActive ? D.gold : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
                  >
                    {sec.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div
          className="w-full max-w-2xl rounded-2xl p-6 sm:p-8"
          style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}
        >
          <div className="text-xs font-black tracking-widest mb-1" style={{ color: D.gold }}>
            STEP {String(subStep).padStart(2, '0')}
          </div>

          {showingQr && qrResult ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Your standee is ready!</h2>
                <p className="text-sm" style={{ color: D.textMuted }}>
                  Customers visit <span style={{ color: D.gold }}>/{qrResult.qrSlug}</span> or scan the QR to join.
                </p>
              </div>

              <QrStandeeCard
                qrCodeDataUrl={qrResult.qrCodeDataUrl}
                slug={qrResult.qrSlug}
                businessName={form.name}
                showActions
                onDownload={downloadQr}
              />

              <div className="w-full rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.cardBorder}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: D.label }}>Share link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs sm:text-sm truncate font-mono" style={{ color: D.gold }}>
                    /{qrResult.qrSlug}
                  </code>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ background: D.purple, color: '#fff' }}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/vendor/dashboard')}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${D.purple}, ${D.purple2})`, color: '#fff' }}
              >
                Go to Dashboard ✦
              </button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <>
                  <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Tell us about your Business</h2>
                  <p className="text-sm mb-7" style={{ color: D.textMuted }}>The basics — who you are, what you&apos;re called, and how we reach you.</p>
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Added required to Name */}
                      <div><OnboardingLabel required>Business Name</OnboardingLabel><OnboardingInput placeholder="e.g. Brew & Co." value={form.name} onChange={set('name')} error={fieldErrors.name} /></div>
                      <div><OnboardingLabel>Tagline</OnboardingLabel><OnboardingInput placeholder="e.g. Brewco Hospitality Pvt. Ltd." value={form.tagline ?? ''} onChange={set('tagline')} /></div>
                    </div>
                    <div><OnboardingLabel>Description</OnboardingLabel><OnboardingTextarea placeholder="e.g. Where every cup tells a story" value={form.description ?? ''} onChange={set('description')} /></div>
                    {/* Added required to Business Type */}
                    <div><OnboardingLabel required>Business Type</OnboardingLabel><OnboardingSelect value={form.businessType} onChange={set('businessType')} options={businessTypes} placeholder="Select business type" error={fieldErrors.businessType} /></div>
                    <div className="pt-2">
                      <p className="text-base font-bold mb-0.5" style={{ color: D.text }}>Contact information</p>
                      <p className="text-xs mb-4" style={{ color: D.textMuted }}>So we know who to ring when the magic&apos;s ready.</p>
                      <div className="space-y-4">
                        {/* Added required to Owner Name */}
                        <div><OnboardingLabel required>Owner Name</OnboardingLabel><OnboardingInput placeholder="Full name" value={form.ownerName} onChange={set('ownerName')} error={fieldErrors.ownerName} /></div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Added required to Mobile Number */}
                          <div><OnboardingLabel required>Mobile Number</OnboardingLabel><OnboardingInput placeholder="9XXXX XXXXX" value={form.mobile} onChange={set('mobile')} prefix="+91" error={fieldErrors.mobile} /></div>
                          <div><OnboardingLabel>WhatsApp Number</OnboardingLabel><OnboardingInput placeholder="9XXXX XXXXX" value={form.whatsapp ?? ''} onChange={set('whatsapp')} prefix="+91" /></div>
                        </div>
                        <div>
                          {/* Added required to Email Address */}
                          <OnboardingLabel required>Email Address</OnboardingLabel>
                          <OnboardingInput
                            placeholder="you@yourcafe.com"
                            value={form.email}
                            onChange={set('email')}
                            type="email"
                            readOnly
                            error={fieldErrors.email}
                          />
                          <p className="text-[10px] mt-1" style={{ color: D.textMuted }}>From your account — used to sign in</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Business Details</h2>
                  <p className="text-sm mb-7" style={{ color: D.textMuted }}>Where customers find you and when you&apos;re open.</p>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Added required to City and Pincode */}
                      <div><OnboardingLabel required>City</OnboardingLabel><OnboardingInput placeholder="e.g. Hyderabad" value={form.city} onChange={set('city')} error={fieldErrors.city} /></div>
                      <div><OnboardingLabel required>Pincode</OnboardingLabel><OnboardingInput placeholder="6 digit Pincode" value={form.pincode ?? ''} onChange={set('pincode')} /></div>
                    </div>
                    <div><OnboardingLabel>Landmark</OnboardingLabel><OnboardingInput placeholder="e.g. Opp wow kids school" value={form.landmark ?? ''} onChange={set('landmark')} /></div>
                    {/* Added required to Full Address */}
                    <div><OnboardingLabel required>Full Address</OnboardingLabel><OnboardingTextarea placeholder="Street, Area, Building name etc" value={form.address ?? ''} onChange={set('address')} rows={2} /></div>
                    <div><OnboardingLabel>Google Map Link</OnboardingLabel><OnboardingInput placeholder="Paste Google Map location link" value={form.mapLink ?? ''} onChange={set('mapLink')} /></div>
                    <div className="pt-2">
                      <p className="text-base font-bold mb-0.5" style={{ color: D.text }}>Timings</p>
                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div><OnboardingLabel>Operating Hours</OnboardingLabel><OnboardingInput placeholder="e.g. 8:00 AM – 10:00 PM" value={form.operatingHours ?? ''} onChange={set('operatingHours')} /></div>
                        <div><OnboardingLabel>Weekly Off Days</OnboardingLabel><OnboardingInput placeholder="e.g. None / Sunday" value={form.weeklyOff ?? ''} onChange={set('weeklyOff')} /></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Add Your Branches</h2>
                  <p className="text-sm mb-7" style={{ color: D.textMuted }}>Multiple locations? Add them here. You can always add more later.</p>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.cardBorder}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold" style={{ color: D.text }}>Branch 1 — Main Location</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${D.gold}22`, color: D.gold }}>Primary</span>
                      </div>
                      <div className="space-y-3">
                        <div><OnboardingLabel>Branch Name</OnboardingLabel><OnboardingInput placeholder="e.g. Brew & Bite — Koramangala" value={form.branchName ?? ''} onChange={set('branchName')} /></div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div><OnboardingLabel>City</OnboardingLabel><OnboardingInput placeholder="City" value={form.branchCity ?? ''} onChange={set('branchCity')} /></div>
                          <div><OnboardingLabel>Full Address</OnboardingLabel><OnboardingInput placeholder="Street, Area" value={form.branchAddress ?? ''} onChange={set('branchAddress')} /></div>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed" style={{ border: `1px dashed ${D.inputBorder}`, color: D.textMuted, background: 'transparent' }}>
                      <Plus className="w-4 h-4" /> Add another branch (coming soon)
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Choose Your Brand Colour</h2>
                  <p className="text-sm mb-7" style={{ color: D.textMuted }}>This will be the primary colour your customers see across the LoyalGenie app.</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      {brandColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set('brandColor')(c)}
                          className="w-10 h-10 rounded-xl transition-all cursor-pointer"
                          style={{
                            background: c,
                            outline: form.brandColor === c ? '3px solid white' : 'none',
                            outlineOffset: '2px',
                            transform: form.brandColor === c ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.cardBorder}` }}>
                      <div className="h-16" style={{ background: `linear-gradient(135deg, ${form.brandColor}, ${form.brandColor}88)` }} />
                      <div className="p-5" style={{ background: '#100E2B' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{ background: form.brandColor }}>☕</div>
                          <div>
                            <div className="text-base font-black" style={{ color: D.text }}>{form.name || 'Your Café'}</div>
                            <div className="text-xs" style={{ color: D.textMuted }}>{form.tagline || 'Your tagline here'}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {['Spin a Wheel', 'Stamp Card', 'Shake & Win'].map((l) => (
                            <div key={l} className="px-3 py-1.5 rounded-full text-[10px] font-semibold" style={{ background: `${form.brandColor}33`, color: form.brandColor }}>{l}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Brand Your Business</h2>
                  <p className="text-sm mb-7" style={{ color: D.textMuted }}>This is what your customers will see inside the LoyalGenie app — your logo, your colours, your vibe.</p>
                  <div className="space-y-5">
                    <OnboardingUpload
                      label="Logo"
                      hint="PNG/SVG, transparent background preferred"
                      value={form.logoData ?? ''}
                      onChange={set('logoData')}
                    />
                    <OnboardingUpload
                      label="Cover Banner Image"
                      hint="1920×600px recommended"
                      value={form.coverBannerData ?? ''}
                      onChange={set('coverBannerData')}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <OnboardingUpload
                        label="Interior Photos"
                        hint="Add a few photos inside"
                        values={form.interiorPhotosData ?? []}
                        onMultiChange={setPhotos('interiorPhotosData')}
                        multiple
                      />
                      <OnboardingUpload
                        label="Exterior Photos"
                        hint="Add photos outside"
                        values={form.exteriorPhotosData ?? []}
                        onMultiChange={setPhotos('exteriorPhotosData')}
                        multiple
                      />
                    </div>
                    <div className="pt-2">
                      <p className="text-base font-bold mb-0.5" style={{ color: D.text }}>Social media handles</p>
                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div><OnboardingLabel>Instagram</OnboardingLabel><OnboardingInput placeholder="yourhandle" value={form.instagram ?? ''} onChange={set('instagram')} prefix="@" /></div>
                        <div><OnboardingLabel>Facebook</OnboardingLabel><OnboardingInput placeholder="yourpage" value={form.facebook ?? ''} onChange={set('facebook')} prefix="@" /></div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
  <OnboardingLabel>Website</OnboardingLabel>
  <OnboardingInput 
    placeholder="yoursite.com" 
    value={form.website ?? ''} 
    onChange={set('website')} 
    prefix="https://" 
    type="url"
  />
</div>
                        <div><OnboardingLabel>Google Review Link</OnboardingLabel><OnboardingInput placeholder="Paste your Google review link" value={form.googleReview ?? ''} onChange={set('googleReview')} /></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p className="mt-6 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>
              )}

              <div className={`flex flex-col-reverse sm:flex-row gap-3 mt-8 ${isFirst ? 'sm:justify-end' : 'sm:justify-between'}`}>
                {!isFirst && (
                  <button type="button" onClick={back} className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 cursor-pointer w-full sm:w-auto" style={{ border: '1.5px solid rgba(255,255,255,0.2)', color: D.text, background: 'transparent' }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}
                {isLastFormStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      const errors = validateStep(step, form)
                      setFieldErrors(errors)
                      if (Object.keys(errors).length > 0) return
                      mutation.mutate()
                    }}
                    disabled={mutation.isPending}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-60 w-full sm:w-auto"
                    style={{ background: `linear-gradient(135deg, ${D.purple}, ${D.purple2})`, color: '#fff' }}
                  >
                    {mutation.isPending ? 'Generating...' : 'Generate My QR Code ✦'}
                  </button>
                ) : (
                  <button type="button" onClick={next} className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 cursor-pointer w-full sm:w-auto" style={{ background: `linear-gradient(135deg, ${D.purple}, ${D.purple2})`, color: '#fff' }}>
                    Continue ✦
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center pb-6 text-xs" style={{ color: D.textMuted }}>
        LoyalGenie · Onboarding takes ~5 minutes
      </div>
    </div>
  )
}