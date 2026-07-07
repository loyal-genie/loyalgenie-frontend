import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RedeemBeforeField } from '@/components/vendor/RedeemBeforeField'
import { SpinColorPicker } from '@/components/vendor/SpinColorPicker'
import { PercentInput } from '@/components/vendor/RewardPoolEditor'
import { segmentCssBackground } from '@/lib/spin-segment-colors'
import {
  addSpinSegment,
  removeSpinSegment,
  segmentDisplayName,
  setSegmentProbability,
  spinWinRateFromSegments,
  type SpinSegmentUi,
} from '@/lib/spin-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

function ShareSlider({ value, onChange, min = 1, max = 100 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const pct = `${((value - min) / (max - min)) * 100}%`
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      aria-label="Segment share"
      className="share-range-slider w-full"
      style={{ accentColor: '#7C3AED', ['--share-pct' as string]: pct }}
    />
  )
}

function SegmentProbabilityBar({ segments }: { segments: SpinSegmentUi[] }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5 text-xs text-v-text-2">
        <span>Wheel breakdown</span>
        <span className="text-v-success font-bold">100% allocated</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-v-border gap-px">
        {segments.map(seg => (
          <div
            key={seg.id}
            className="h-full transition-all"
            style={{ width: `${seg.probability}%`, background: segmentCssBackground(seg.color) }}
            title={`${seg.label} (${seg.probability}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-v-text-3">
        {segments.map(seg => (
          <span key={seg.id} className="flex items-center gap-1">
            <span className="size-2 rounded-full shrink-0" style={{ background: segmentCssBackground(seg.color) }} />
            {seg.label} ({seg.probability}%)
          </span>
        ))}
      </div>
    </div>
  )
}

interface SpinSegmentEditorProps {
  segments: SpinSegmentUi[]
  setSegments: (segments: SpinSegmentUi[]) => void
  readOnly?: boolean
}

export function SpinSegmentEditor({ segments, setSegments, readOnly }: SpinSegmentEditorProps) {
  const update = (id: string, patch: Partial<SpinSegmentUi>) =>
    setSegments(segments.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const updateProbability = (id: string, value: number) => {
    setSegments(setSegmentProbability(segments, id, value))
  }

  const winRate = spinWinRateFromSegments(segments)

  if (readOnly) {
    return (
      <div className="space-y-3">
        {segments.map(seg => (
          <div key={seg.id} className="flex items-center justify-between p-4 rounded-xl bg-v-surface-2 border border-v-border">
            <span className="text-sm font-medium text-v-text flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ background: segmentCssBackground(seg.color) }} />
              {seg.isWin ? segmentDisplayName(seg) : seg.label}
            </span>
            <span className="text-xs font-bold text-v-purple">{seg.probability}%</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={labelClass}>Wheel Segments &amp; Rewards</span>
          <p className="text-xs text-v-text-3 mt-1">
            Shares auto-balance to 100%. Adjust one segment and the others update automatically.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSegments(addSpinSegment(segments))}
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      <div className="space-y-4">
        {segments.map(seg => (
          <div
            key={seg.id}
            className="rounded-xl border border-v-border bg-v-surface-2 p-5"
          >
            {/* Segment header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="pt-6">
                <SpinColorPicker value={seg.color} onChange={color => update(seg.id, { color })} />
              </div>
              <div className="flex-1 min-w-0">
                <label className={`${labelClass} mb-1.5 block`}>Segment Label</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Free Coffee"
                  value={seg.label}
                  onChange={e => update(seg.id, { label: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0 pt-6">
                <input
                  type="checkbox"
                  checked={seg.isWin}
                  onChange={e => update(seg.id, { isWin: e.target.checked })}
                  className="size-4 accent-v-purple rounded"
                />
                <span className="text-sm font-medium text-v-text-2">Win</span>
              </label>
              {segments.length > 2 && (
                <button
                  type="button"
                  onClick={() => setSegments(removeSpinSegment(segments, seg.id))}
                  className="p-2 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors shrink-0 mt-5"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            {/* Reward fields — full width like Create Reward */}
            {seg.isWin && (
              <div className="border-t border-v-border pt-4">
                <RedeemBeforeField
                  value={{
                    redeemExpiryMode: seg.redeemExpiryMode,
                    redeemFixedDate: seg.redeemFixedDate,
                    redeemRelativeAmount: seg.redeemRelativeAmount,
                    redeemRelativeUnit: seg.redeemRelativeUnit,
                  }}
                  onChange={value => update(seg.id, value)}
                />
              </div>
            )}

            {/* Share slider — full width row */}
            <div className="border-t border-v-border pt-4 mt-4">
              <label className={`${labelClass} mb-2 block`}>Wheel Share</label>
              <div className="flex items-center gap-3">
                <ShareSlider
                  value={seg.probability}
                  onChange={n => updateProbability(seg.id, n)}
                  min={1}
                  max={100 - (segments.length - 1)}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <PercentInput
                    value={seg.probability}
                    onChange={n => updateProbability(seg.id, n)}
                    min={1}
                    max={100 - (segments.length - 1)}
                    className="w-14 h-11 bg-white border border-v-border rounded-xl px-2 text-sm text-v-text text-center focus:outline-none focus:border-v-purple focus:ring-2 focus:ring-v-purple/12"
                  />
                  <span className="text-sm text-v-text-2 font-medium">%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SegmentProbabilityBar segments={segments} />

      <div className="mt-4 flex items-center justify-between p-4 bg-white border border-v-border rounded-xl text-sm">
        <span className="text-v-text-2">Effective win rate</span>
        <span className="font-bold text-v-purple">{winRate}% of spins win</span>
      </div>
    </div>
  )
}
