import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getMechanicEmoji, formatRelativeTime } from '@/lib/utils'
import { usePendingRedemptions, useMarkRedeemed } from '@/hooks/useVendorAnalytics'

export function RedemptionQueue() {
  const { data: queue = [], isLoading } = usePendingRedemptions()
  const markRedeemed = useMarkRedeemed()
  const [redeemed, setRedeemed] = useState<string[]>([])

  const handleRedeem = (id: string) => {
    setRedeemed(prev => [...prev, id])
    markRedeemed.mutate(id, {
      onSettled: () => {
        setTimeout(() => setRedeemed(prev => prev.filter(r => r !== id)), 1200)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-v-purple animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-v-text">Redemption Queue</h2>
          {queue.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-v-danger text-white text-[10px] font-bold flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {queue.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🎉</span>
              <p className="text-sm text-v-text-2 font-medium">All clear!</p>
              <p className="text-xs text-v-text-3 mt-1">No pending redemptions</p>
            </motion.div>
          )}
          {queue.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Card className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-v-surface-2 border border-v-border flex items-center justify-center text-lg shrink-0">
                    {getMechanicEmoji(item.mechanic)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-v-text truncate">{item.customerName}</span>
                      <span className="text-[10px] text-v-text-3 shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(item.requestedAt ?? item.earnedAt)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#D97706' }}>
                      {item.reward}
                    </p>
                    <p className="text-[10px] text-v-text-3 mt-0.5">{item.campaignName}</p>
                    <p className="text-[10px] text-v-text-3 font-mono mt-0.5">{item.code}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <AnimatePresence mode="wait">
                    {redeemed.includes(item.id) ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Redeemed!
                      </motion.div>
                    ) : (
                      <motion.div key="btn" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          disabled={markRedeemed.isPending}
                          onClick={() => handleRedeem(item.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Redeemed
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
