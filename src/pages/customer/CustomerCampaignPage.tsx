import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Delete, Loader2, Sparkles, Gift } from 'lucide-react'
import { fetchPublicCampaign, verifyCampaignPin, getApiErrorMessage } from '@/lib/api'
import { setPlaySession } from '@/lib/customer-game'
import { getMechanicEmoji, getMechanicLabel, getMechanicColor } from '@/lib/utils'

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 40 + i * 12,
            height: 40 + i * 12,
            left: `${10 + i * 11}%`,
            top: `${5 + (i % 3) * 25}%`,
            background: `radial-gradient(circle, ${i % 2 ? 'rgba(245,197,24,0.15)' : 'rgba(167,139,250,0.2)'} 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function CustomerCampaignPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['public-campaign', id],
    queryFn: () => fetchPublicCampaign(id!),
    enabled: Boolean(id),
  })

  const verifyMutation = useMutation({
    mutationFn: (enteredPin: string) => verifyCampaignPin(id!, enteredPin),
    onSuccess: (data) => {
      setPlaySession(id!, data.playSessionToken)
      navigate(`/customer/games/shake?campaign=${id}`)
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Wrong PIN. Ask staff for the current PIN.'))
      setPin('')
    },
  })

  const color = campaign ? getMechanicColor(campaign.mechanic as 'shake') : '#7C3AED'

  const handleKey = (k: string) => {
    if (pin.length < 3) setPin(p => p + k)
    setError('')
  }

  const handleDelete = () => setPin(p => p.slice(0, -1))

  const handleSubmit = () => {
    if (pin.length < 3 || verifyMutation.isPending) return
    verifyMutation.mutate(pin)
  }

  // Auto-submit when 3 digits entered
  useEffect(() => {
    if (pin.length === 3 && !verifyMutation.isPending) {
      const t = setTimeout(() => verifyMutation.mutate(pin), 300)
      return () => clearTimeout(t)
    }
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #1A0545, #0D0B1E)' }}>
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center" style={{ background: 'linear-gradient(160deg, #1A0545, #0D0B1E)' }}>
        <p className="text-white font-semibold mb-4">Campaign not available</p>
        <button onClick={() => navigate('/customer')} className="text-purple-300 text-sm">← Back home</button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1A0545 0%, #2D1B69 40%, #0D0B1E 100%)' }}
    >
      <FloatingOrbs />

      <div className="relative z-10 flex flex-col min-h-screen px-4 pt-10 pb-8 max-w-md mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-6 w-fit bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Campaign hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-flex w-20 h-20 rounded-3xl items-center justify-center text-4xl mb-4"
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}15)`,
              border: `2px solid ${color}60`,
              boxShadow: `0 0 40px ${color}40`,
            }}
          >
            {getMechanicEmoji(campaign.mechanic)}
          </motion.div>
          <h1 className="text-2xl font-extrabold text-white mb-1">{campaign.name}</h1>
          <p className="text-sm font-semibold" style={{ color }}>{getMechanicLabel(campaign.mechanic as 'shake')}</p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-bold text-amber-200">{campaign.winRatePercent}% chance to win!</span>
          </div>
        </motion.div>

        {/* PIN card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col rounded-3xl p-6 backdrop-blur-xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 mb-3">
              <Gift className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Ask staff for PIN</span>
            </div>
            <p className="text-sm text-white/50">Show this screen at the counter</p>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-5 mb-6">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={error ? { x: [0, -8, 8, 0] } : {}}
                className="relative"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    borderColor: pin[i] ? color : 'rgba(255,255,255,0.15)',
                    background: pin[i] ? `${color}25` : 'rgba(0,0,0,0.2)',
                    boxShadow: pin[i] ? `0 0 30px ${color}50` : 'none',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {pin[i] ? (
                      <motion.span
                        key={pin[i]}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-black text-white"
                      >
                        {pin[i]}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="empty"
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-white/30"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-red-400 mb-4">
              {error}
            </motion.p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5 mt-auto">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <motion.button
                key={n}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleKey(String(n))}
                className="h-14 rounded-2xl text-xl font-bold text-white cursor-pointer border-0 transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {n}
              </motion.button>
            ))}
            <div />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleKey('0')}
              className="h-14 rounded-2xl text-xl font-bold text-white cursor-pointer border-0"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="h-14 rounded-2xl text-white/50 cursor-pointer border-0 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Delete className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={pin.length < 3 || verifyMutation.isPending}
            className="mt-5 w-full py-4 rounded-2xl text-base font-extrabold transition-all disabled:opacity-40 border-0 cursor-pointer"
            style={{
              background: pin.length === 3
                ? `linear-gradient(135deg, ${color}, #F5C518)`
                : 'rgba(255,255,255,0.06)',
              color: pin.length === 3 ? '#1A0545' : 'rgba(255,255,255,0.4)',
              boxShadow: pin.length === 3 ? `0 12px 40px ${color}60` : 'none',
            }}
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</span>
            ) : pin.length === 3 ? (
              `Let's Shake! ${getMechanicEmoji(campaign.mechanic)}`
            ) : (
              'Enter 3-digit PIN'
            )}
          </motion.button>

          <p className="text-center text-[10px] text-white/30 mt-4">PIN refreshes every 2 min on staff screen</p>
        </motion.div>
      </div>
    </div>
  )
}
