import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FieldInput as Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/lib/api'
import { IconPicker } from '@/components/vendor/IconPicker'
import { RewardPreviewCard } from '@/components/vendor/RewardPreviewCard'
import { useBusinessReward, useCreateBusinessReward, useUpdateBusinessReward } from '@/hooks/useRewards'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'

const textareaClass =
  'min-h-[88px] w-full rounded-xl border border-v-border bg-white px-4 py-2.5 text-sm text-v-text placeholder:text-v-text-3 focus:outline-none focus:border-v-purple focus:ring-2 focus:ring-v-purple/12'

type RewardFormState = {
  name: string
  description: string
  icon: string
  pointsRequired: string
  maxClaims: string
  claimBefore: string
  redeemExpiryMode: 'fixed' | 'relative'
  redeemFixedDate: string
  redeemRelativeAmount: number
  redeemRelativeUnit: 'day' | 'week' | 'month'
  redemptionInstructions: string
}

const emptyForm: RewardFormState = {
  name: '',
  description: '',
  icon: '🎁',
  pointsRequired: '',
  maxClaims: '',
  claimBefore: '',
  redeemExpiryMode: 'relative',
  redeemFixedDate: '',
  redeemRelativeAmount: 1,
  redeemRelativeUnit: 'day',
  redemptionInstructions: '',
}

function rewardToForm(reward: NonNullable<ReturnType<typeof useBusinessReward>['data']>): RewardFormState {
  return {
    name: reward.name,
    description: reward.description ?? '',
    icon: reward.icon || '🎁',
    pointsRequired: String(reward.pointsRequired),
    maxClaims: reward.maxClaims != null ? String(reward.maxClaims) : '',
    claimBefore: reward.claimBefore ?? '',
    redeemExpiryMode: reward.redeemExpiryMode,
    redeemFixedDate: reward.redeemFixedDate ?? '',
    redeemRelativeAmount: reward.redeemRelativeAmount ?? 1,
    redeemRelativeUnit: reward.redeemRelativeUnit ?? 'day',
    redemptionInstructions: reward.redemptionInstructions ?? '',
  }
}

function VendorRewardFormPage() {
  const navigate = useNavigate()
  const { rewardId } = useParams()
  const isEdit = Boolean(rewardId)
  const [error, setError] = useState('')
  const [form, setForm] = useState<RewardFormState>(emptyForm)

  const { data: reward, isLoading, isError } = useBusinessReward(rewardId)
  const createRewardMutation = useCreateBusinessReward()
  const updateRewardMutation = useUpdateBusinessReward()

  useEffect(() => {
    if (reward) setForm(rewardToForm(reward))
  }, [reward])

  const previewExpiry = useMemo(() => {
    if (form.redeemExpiryMode === 'fixed') return form.redeemFixedDate || 'dd/mm/yyyy'
    return `${form.redeemRelativeAmount} ${form.redeemRelativeUnit}${form.redeemRelativeAmount > 1 ? 's' : ''} after claim`
  }, [form.redeemExpiryMode, form.redeemFixedDate, form.redeemRelativeAmount, form.redeemRelativeUnit])

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    icon: form.icon,
    pointsRequired: Number(form.pointsRequired),
    maxClaims: form.maxClaims ? Number(form.maxClaims) : undefined,
    claimBefore: form.claimBefore || undefined,
    redeemExpiryMode: form.redeemExpiryMode,
    redeemFixedDate: form.redeemExpiryMode === 'fixed' ? form.redeemFixedDate || undefined : undefined,
    redeemRelativeAmount: form.redeemExpiryMode === 'relative' ? Number(form.redeemRelativeAmount) : undefined,
    redeemRelativeUnit: form.redeemExpiryMode === 'relative' ? form.redeemRelativeUnit : undefined,
    redemptionInstructions: form.redemptionInstructions.trim() || undefined,
  })

  const handleSubmit = async () => {
    setError('')
    try {
      if (isEdit && rewardId) {
        await updateRewardMutation.mutateAsync({ id: rewardId, payload: buildPayload() })
      } else {
        await createRewardMutation.mutateAsync(buildPayload())
      }
      navigate('/vendor/rewards')
    } catch (err) {
      setError(getApiErrorMessage(err, isEdit ? 'Failed to update reward' : 'Failed to create reward'))
    }
  }

  const isPending = createRewardMutation.isPending || updateRewardMutation.isPending

  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-v-purple border-t-transparent" />
      </div>
    )
  }

  if (isEdit && (isError || !reward)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <p className="text-sm text-v-danger">Reward not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/vendor/rewards')}>
          Back to rewards
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/vendor/rewards')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-v-text-2 transition-colors hover:text-v-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-extrabold text-v-text">{isEdit ? 'Edit Reward' : 'Create Reward'}</h1>
        <p className="mt-1 text-sm text-v-text-2">
          {isEdit ? 'Update your reward details' : 'Design a reward that your customers will love'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Card className="p-6">
            <div className="space-y-5">
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Reward Name *</label>
                <div className="flex gap-2">
                  <IconPicker value={form.icon} onChange={icon => setForm(prev => ({ ...prev, icon }))} />
                  <input
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12"
                    placeholder="eg. Free Coffee"
                  />
                </div>
              </div>

              <div>
                <label className={`${labelClass} mb-1.5 block`}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className={textareaClass}
                  placeholder="Enter reward description"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Points Required *"
                  type="number"
                  min={1}
                  value={form.pointsRequired}
                  onChange={e => setForm(prev => ({ ...prev, pointsRequired: e.target.value }))}
                  placeholder="eg. 30"
                />
                <Input
                  label="No of Rewards"
                  type="number"
                  min={1}
                  value={form.maxClaims}
                  onChange={e => setForm(prev => ({ ...prev, maxClaims: e.target.value }))}
                  placeholder="eg. 10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Claim Before"
                  type="date"
                  value={form.claimBefore}
                  onChange={e => setForm(prev => ({ ...prev, claimBefore: e.target.value }))}
                />
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>Redeem Before *</label>
                  {form.redeemExpiryMode === 'fixed' ? (
                    <input
                      type="date"
                      value={form.redeemFixedDate}
                      onChange={e => setForm(prev => ({ ...prev, redeemFixedDate: e.target.value, redeemExpiryMode: 'fixed' }))}
                      className="h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={form.redeemRelativeAmount}
                        onChange={e => setForm(prev => ({ ...prev, redeemRelativeAmount: Number(e.target.value), redeemExpiryMode: 'relative' }))}
                        className="h-11 w-20 rounded-xl border border-v-border bg-white px-3 text-sm text-v-text focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12"
                      />
                      <select
                        value={form.redeemRelativeUnit}
                        onChange={e => setForm(prev => ({ ...prev, redeemRelativeUnit: e.target.value as 'day' | 'week' | 'month', redeemExpiryMode: 'relative' }))}
                        className="h-11 flex-1 rounded-xl border border-v-border bg-white px-3 text-sm text-v-text focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12"
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                      </select>
                    </div>
                  )}
                  <div className="mt-2 flex rounded-lg border border-v-border bg-v-surface-2 p-0.5">
                    {([
                      { key: 'fixed' as const, label: 'Fixed date' },
                      { key: 'relative' as const, label: 'Relative expiry' },
                    ]).map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, redeemExpiryMode: opt.key }))}
                        className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                          form.redeemExpiryMode === opt.key
                            ? 'bg-white text-v-text shadow-sm'
                            : 'text-v-text-3 hover:text-v-text-2'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className={`${labelClass} mb-1.5 block`}>Redemption Instructions</label>
                <textarea
                  value={form.redemptionInstructions}
                  onChange={e => setForm(prev => ({ ...prev, redemptionInstructions: e.target.value }))}
                  className={textareaClass}
                  placeholder="How should customer redeem this reward (eg. show code at counter)"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </Card>

          <div className="mt-5 flex items-center justify-end gap-3">
            <Button variant="ghost" className="text-sm" onClick={() => navigate('/vendor/rewards')}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim() || !form.pointsRequired || Number(form.pointsRequired) < 1}
              className="rounded-full px-5 text-sm"
            >
              {isPending ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : '+ Create Reward')}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-v-text">Preview</h3>
            <Eye className="h-4 w-4 text-v-text-3" />
          </div>
          <RewardPreviewCard
            variant="create"
            icon={form.icon}
            name={form.name}
            description={form.description}
            pointsRequired={form.pointsRequired ? Number(form.pointsRequired) : '—'}
            availableRewards={form.maxClaims ? Number(form.maxClaims) : undefined}
            expiryLabel={previewExpiry}
            redemptionInstructions={form.redemptionInstructions}
          />
        </div>
      </div>
    </div>
  )
}

export function VendorRewardCreatePage() {
  return <VendorRewardFormPage />
}

export function VendorRewardEditPage() {
  return <VendorRewardFormPage />
}
