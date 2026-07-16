import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LotteryPrizeUi } from '@/lib/lottery-campaign-config'

const labelClass = 'text-xs font-semibold text-v-text-2 uppercase tracking-wider'
const inputClass =
  'h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text placeholder:text-v-text-3 focus:border-v-purple focus:outline-none focus:ring-2 focus:ring-v-purple/12'

interface LotteryPrizeEditorProps {
  prizes: LotteryPrizeUi[]
  setPrizes: (prizes: LotteryPrizeUi[]) => void
  readOnly?: boolean
}

export function LotteryPrizeEditor({ prizes, setPrizes, readOnly }: LotteryPrizeEditorProps) {
  const jackpot = prizes.find(p => p.tier === 'jackpot')
  const otherPrizes = prizes.filter(p => p.tier !== 'jackpot')

  const updateJackpot = (patch: Partial<LotteryPrizeUi>) => {
    setPrizes(prizes.map(p => (p.tier === 'jackpot' ? { ...p, ...patch } : p)))
  }

  const updatePrize = (id: string, patch: Partial<LotteryPrizeUi>) => {
    setPrizes(prizes.map(p => (p.id === id ? { ...p, ...patch } : p)))
  }

  if (readOnly) {
    return (
      <div className="space-y-3">
        {prizes.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-v-surface-2 border border-v-border text-sm">
            <span className="font-medium text-v-text flex items-center gap-2">
              {p.tier === 'jackpot' ? '👑' : '🎁'} {p.name}
            </span>
            <span className="text-v-purple font-semibold">{p.reward}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <span className={labelClass}>Lottery Prizes</span>
        <p className="text-xs text-v-text-3 mt-1">
          Configure the jackpot and additional prizes. One random ticket wins each prize on draw day.
        </p>
      </div>

      <div className="space-y-4">
        {jackpot && (
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">👑</span>
              <span className="text-sm font-bold text-amber-800">Jackpot</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                Required
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Prize name</label>
                <input
                  className={inputClass}
                  placeholder="Grand Prize"
                  value={jackpot.name}
                  onChange={e => updateJackpot({ name: e.target.value })}
                />
              </div>
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Reward</label>
                <input
                  className={inputClass}
                  placeholder="Free Month Subscription"
                  value={jackpot.reward}
                  onChange={e => updateJackpot({ reward: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {otherPrizes.map((prize, i) => (
          <div key={prize.id} className="rounded-xl border border-v-border bg-v-surface-2 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-v-text">Prize {i + 2}</span>
              <button
                type="button"
                onClick={() => setPrizes(prizes.filter(p => p.id !== prize.id))}
                className="ml-auto p-2 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-red-50 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Prize name</label>
                <input
                  className={inputClass}
                  placeholder={`${i + 2}${i === 0 ? 'nd' : i === 1 ? 'rd' : 'th'} Prize`}
                  value={prize.name}
                  onChange={e => updatePrize(prize.id, { name: e.target.value })}
                />
              </div>
              <div>
                <label className={`${labelClass} mb-1.5 block`}>Reward</label>
                <input
                  className={inputClass}
                  placeholder="Free Coffee"
                  value={prize.reward}
                  onChange={e => updatePrize(prize.id, { reward: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPrizes([
            ...prizes,
            {
              id: Math.random().toString(36).slice(2),
              tier: 'prize',
              name: `Prize ${otherPrizes.length + 2}`,
              reward: '',
            },
          ])}
        >
          <Plus className="w-3 h-3" /> Add Prize
        </Button>
      </div>
    </div>
  )
}
