import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { CampaignMetaRow } from '@/components/customer/CampaignMetaRow'
import { PinKeypad } from '@/components/customer/PinKeypad'
import { FIGMA_ASSETS } from '@/lib/figma-assets'
import { getCustomerMechanicChipLabel } from '@/lib/customer-ui'
import type { PublicCampaign } from '@/lib/api'
import type { ReactNode } from 'react'

interface ShakeCampaignDetailProps {
  campaign: PublicCampaign
  businessName: string
  pin: string
  error?: string
  loading?: boolean
  pinOpen: boolean
  statusChips?: ReactNode
  onBack: () => void
  onOpenPin: () => void
  onClosePin: () => void
  onKey: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function ShakeCampaignDetail({
  campaign,
  businessName,
  pin,
  error,
  loading,
  pinOpen,
  statusChips,
  onBack,
  onOpenPin,
  onClosePin,
  onKey,
  onDelete,
  onSubmit,
}: ShakeCampaignDetailProps) {
  return (
    <div className="min-h-dvh bg-white flex flex-col relative">
      <div
        className="relative h-[224px] shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(139deg, #450570 0%, #611ab5 100%)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-4 size-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center border-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div className="absolute top-12 right-4 bg-[#fef3c7] px-2.5 py-0.5 rounded-full">
          <span className="text-[10px] font-bold text-[#92400e]">{getCustomerMechanicChipLabel('shake')}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[32px]" />
      </div>

      <div className="flex-1 px-5 pt-3 pb-8">
        <h1 className="text-xl font-extrabold text-[#101828] mb-1">{campaign.name}</h1>
        <p className="text-sm text-[#6a7282] mb-4">Shake your phone to win a reward</p>

        <CampaignMetaRow
          startDate={campaign.startDate}
          endDate={campaign.endDate}
          playsPerDay={campaign.playsPerDay}
          winRatePercent={campaign.winRatePercent}
        />

        {statusChips && <div className="flex flex-wrap gap-2 mt-4">{statusChips}</div>}

        <p className="text-xs text-[#99a1af] mt-6 mb-1">Offered by</p>
        <p className="text-sm font-bold text-[#1e2939] mb-8">{businessName}</p>

        <button
          type="button"
          onClick={onOpenPin}
          disabled={loading}
          className="w-full py-4 rounded-3xl font-bold text-base text-white border-0 cursor-pointer disabled:opacity-60 shadow-[0px_8px_14px_rgba(245,158,11,0.33)]"
          style={{ background: 'linear-gradient(139deg, #c46a0a 0%, #d97706 100%)' }}
        >
          Play Now
        </button>
      </div>

      <AnimatePresence>
        {pinOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 max-w-[440px] mx-auto"
              onClick={onClosePin}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px] rounded-t-[20px] px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              style={{
                background: 'linear-gradient(180deg, #44046f 0%, #2b1108 100%)',
                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
              }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              <div className="flex justify-center mb-4">
                <div className="size-[75px] rounded-[20px] bg-white/20 flex items-center justify-center">
                  <img
                    src={FIGMA_ASSETS.phoneVibrate}
                    alt=""
                    className="size-8 -rotate-[32deg]"
                  />
                </div>
              </div>

              <h2 className="text-center text-xl font-bold text-white mb-2">Shake &amp; Win</h2>
              <p className="text-center text-[15px] text-white/70 leading-[22px] mb-6">
                Enter the 3-digit code from staff to participate
              </p>

              <div className="[&_h2]:hidden [&_p]:text-white/60 [&_button:not(:last-child)]:bg-white/10 [&_button:not(:last-child)]:text-white [&_button:not(:last-child)]:border-white/15 [&_.rounded-xl]:border-white/20 [&_.rounded-xl]:bg-white/5 [&_span]:text-white">
                <PinKeypad
                  pin={pin}
                  error={error}
                  loading={loading}
                  onKey={onKey}
                  onDelete={onDelete}
                  onSubmit={onSubmit}
                  submitLabel="Let's shake!"
                />
              </div>

              <button
                type="button"
                onClick={onClosePin}
                className="w-full mt-3 py-3 text-[15px] text-white/70 bg-transparent border-0 cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {loading && pinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 max-w-[440px] mx-auto">
          <Loader2 className="size-10 text-white animate-spin" />
        </div>
      )}
    </div>
  )
}
