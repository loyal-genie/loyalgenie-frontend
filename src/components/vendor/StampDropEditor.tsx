import { Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FieldInput as Input } from '@/components/ui/input'
import {
  RewardModeToggle,
  RewardPoolEditor,
  SingleRewardInput,
  type RewardMode,
} from '@/components/vendor/RewardPoolEditor'
import { RedeemBeforeField } from '@/components/vendor/RedeemBeforeField'
import type { StampDropUiState } from '@/lib/stamp-drop-config'
import { BIG_REWARD_COLORS, SURPRISE_DROP_COLORS, newStampDrop } from '@/lib/stamp-drop-config'

type StampDropEditorProps = {
  title: string
  emoji: string
  tier: 'surprise' | 'big'
  drops: StampDropUiState[]
  setDrops: (drops: StampDropUiState[]) => void
  totalStamps: number
}

function updateDrop(drops: StampDropUiState[], id: string, patch: Partial<StampDropUiState>) {
  return drops.map(d => d.id === id ? { ...d, ...patch } : d)
}

export function StampDropEditor({ title, emoji, tier, drops, setDrops, totalStamps }: StampDropEditorProps) {
  const palette = tier === 'surprise' ? SURPRISE_DROP_COLORS : BIG_REWARD_COLORS

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <p className="text-xs font-bold text-v-text-2 uppercase tracking-wider">{title}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDrops([...drops, newStampDrop(tier, drops.length, totalStamps)])}
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      <div className="space-y-3">
        {drops.map((drop, index) => (
          <div
            key={drop.id}
            className="rounded-xl border p-4 space-y-3"
            style={{ backgroundColor: drop.color, borderColor: `${drop.color}99` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <input
                  className="w-full bg-white/80 border border-white rounded-lg px-2.5 py-1.5 text-sm font-semibold text-v-text focus:outline-none focus:border-v-purple"
                  value={drop.label}
                  onChange={e => setDrops(updateDrop(drops, drop.id, { label: e.target.value }))}
                />
                <div className="flex flex-wrap gap-1.5">
                  {palette.map(color => (
                    <button
                      key={color}
                      type="button"
                      title="Set background color"
                      onClick={() => setDrops(updateDrop(drops, drop.id, { color }))}
                      className={`h-6 w-6 rounded-full border-2 ${drop.color === color ? 'border-v-purple' : 'border-white/80'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {drops.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDrops(drops.filter(d => d.id !== drop.id))}
                  className="p-1.5 rounded-lg text-v-text-3 hover:text-v-danger hover:bg-white/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From Stamp #"
                type="number"
                min={1}
                max={totalStamps}
                value={drop.from}
                onChange={e => setDrops(updateDrop(drops, drop.id, { from: Number(e.target.value) }))}
              />
              <Input
                label="To Stamp #"
                type="number"
                min={drop.from}
                max={totalStamps}
                value={drop.to}
                onChange={e => setDrops(updateDrop(drops, drop.id, { to: Number(e.target.value) }))}
              />
            </div>
            <p className="text-[11px] text-v-text-3">Triggers at a random stamp within this range.</p>

            <RewardModeToggle
              mode={drop.mode}
              onChange={(m: RewardMode) => setDrops(updateDrop(drops, drop.id, { mode: m }))}
            />

            <AnimatePresence mode="wait">
              {drop.mode === 'single' ? (
                <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <SingleRewardInput
                    value={drop.singleName}
                    onChange={v => setDrops(updateDrop(drops, drop.id, { singleName: v }))}
                    placeholder={tier === 'surprise' ? 'e.g. Mystery Treat' : 'e.g. Free Breakfast Combo'}
                  />
                  <RedeemBeforeField
                    compact
                    value={{
                      redeemExpiryMode: drop.pool[0]?.redeemExpiryMode ?? 'relative',
                      redeemFixedDate: drop.pool[0]?.redeemFixedDate ?? '',
                      redeemRelativeAmount: drop.pool[0]?.redeemRelativeAmount ?? 7,
                      redeemRelativeUnit: drop.pool[0]?.redeemRelativeUnit ?? 'day',
                    }}
                    onChange={value => {
                      const base = drop.pool[0] ?? { redeemExpiryMode: 'relative' as const, redeemFixedDate: '', redeemRelativeAmount: 7, redeemRelativeUnit: 'day' as const }
                      setDrops(updateDrop(drops, drop.id, {
                        pool: [{ ...drop.pool[0], ...base, ...value, name: drop.singleName, probability: 100 }],
                      }))
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RewardPoolEditor
                    compact
                    showRedeemBefore
                    rewards={drop.pool}
                    setRewards={pool => setDrops(updateDrop(drops, drop.id, { pool }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {index < drops.length - 1 && <div className="h-px bg-white/50" />}
          </div>
        ))}
      </div>
    </div>
  )
}
