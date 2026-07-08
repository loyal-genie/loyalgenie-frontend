import { RedeemBeforeField } from '@/components/vendor/RedeemBeforeField'
import { DiceFace } from '@/components/shared/DiceFace'
import { diceWinRateFromOutcomes, type DiceOutcomeUi } from '@/lib/dice-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

interface DiceOutcomeEditorProps {
  outcomes: DiceOutcomeUi[]
  setOutcomes: (outcomes: DiceOutcomeUi[]) => void
  readOnly?: boolean
}

export function DiceOutcomeEditor({ outcomes, setOutcomes, readOnly }: DiceOutcomeEditorProps) {
  const update = (id: string, patch: Partial<DiceOutcomeUi>) =>
    setOutcomes(outcomes.map(o => (o.id === id ? { ...o, ...patch } : o)))

  const winRate = diceWinRateFromOutcomes(outcomes)
  const winFaces = outcomes.filter(o => o.isWin && o.reward.trim()).length

  if (readOnly) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {outcomes.map(o => (
          <div
            key={o.id}
            className={`rounded-xl border p-3 text-center ${o.isWin ? 'border-v-purple/40 bg-v-surface-2' : 'border-v-border bg-white'}`}
          >
            <div className="mx-auto size-8">
              <DiceFace value={o.value} />
            </div>
            <p className="text-[11px] mt-1.5 font-semibold text-v-text">Roll {o.value}</p>
            {o.isWin ? (
              <p className="text-[11px] text-v-purple truncate">{o.reward || 'Win'}</p>
            ) : (
              <p className="text-[11px] text-v-text-3">No win</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <span className={labelClass}>Dice Faces &amp; Rewards</span>
        <p className="text-xs text-v-text-3 mt-1">
          Toggle each face as a win and assign its reward. Each face has an equal 1-in-6 chance.
        </p>
      </div>

      <div className="space-y-4">
        {outcomes.map(o => (
          <div key={o.id} className="rounded-xl border border-v-border bg-v-surface-2 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white border border-v-border shadow-sm p-2">
                <DiceFace value={o.value} />
              </div>
              <div className="flex-1 min-w-0">
                <label className={`${labelClass} mb-1.5 block`}>Roll {o.value}</label>
                {o.isWin ? (
                  <input
                    className={inputClass}
                    placeholder="e.g. Free Dessert"
                    value={o.reward}
                    onChange={e => update(o.id, { reward: e.target.value })}
                  />
                ) : (
                  <p className="flex h-11 items-center text-xs text-v-text-3 italic">
                    Better luck next time — no reward on this face.
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0 pt-7">
                <input
                  type="checkbox"
                  checked={o.isWin}
                  onChange={e => update(o.id, { isWin: e.target.checked })}
                  className="size-4 accent-v-purple rounded"
                />
                <span className="text-sm font-medium text-v-text-2">Win</span>
              </label>
            </div>

            {o.isWin && (
              <div className="border-t border-v-border pt-4 mt-4">
                <RedeemBeforeField
                  value={{
                    redeemExpiryMode: o.redeemExpiryMode,
                    redeemFixedDate: o.redeemFixedDate,
                    redeemRelativeAmount: o.redeemRelativeAmount,
                    redeemRelativeUnit: o.redeemRelativeUnit,
                  }}
                  onChange={value => update(o.id, value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between p-4 bg-white border border-v-border rounded-xl text-sm">
        <span className="text-v-text-2">Effective win rate</span>
        <span className="font-bold text-v-purple">{winFaces} of 6 faces win · {winRate}%</span>
      </div>
    </div>
  )
}
