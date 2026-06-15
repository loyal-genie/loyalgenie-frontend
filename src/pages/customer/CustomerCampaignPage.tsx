import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Delete, Loader2, Shield } from 'lucide-react'
import { fetchPublicCampaign, verifyCampaignPin, getApiErrorMessage } from '@/lib/api'
import { setPlaySession } from '@/lib/customer-game'
import { getMechanicEmoji, getMechanicLabel, getMechanicColor } from '@/lib/utils'

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center customer-game-bg">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center customer-game-bg px-5 text-center">
        <p className="text-white font-semibold mb-4">Campaign not available</p>
        <button onClick={() => navigate('/customer')} className="text-purple-300 text-sm">← Back home</button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col px-5 pt-12 pb-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1A0545 0%, #2D1B69 45%, #0D0B1E 100%)' }}
    >
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 right-0 w-48 h-48 bg-fuchsia-500/15 rounded-full blur-2xl pointer-events-none" />

      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-8 transition-colors w-fit relative z-10 bg-transparent border-0 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8 relative z-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
          style={{ background: `${color}25`, border: `1px solid ${color}50`, boxShadow: `0 8px 32px ${color}30` }}
        >
          {getMechanicEmoji(campaign.mechanic)}
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white">{campaign.name}</h1>
          <p className="text-xs font-semibold mt-0.5" style={{ color }}>{getMechanicLabel(campaign.mechanic as 'shake')}</p>
          <p className="text-[10px] text-white/40 mt-1">{campaign.winRatePercent}% win rate</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-3">
          <Shield className="w-3.5 h-3.5 text-purple-300" />
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Staff verification</span>
        </div>
        <p className="text-base font-bold text-white mb-1">Enter the 3-digit PIN</p>
        <p className="text-xs text-white/45">Ask staff at the counter — it refreshes every 2 minutes</p>
      </motion.div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="flex justify-center gap-4 mb-6 relative z-10">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -8, 8, -6, 6, 0] } : pin[i] ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.35 }}
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl font-black border-2 transition-all shadow-lg"
            style={{
              borderColor: pin[i] ? color : 'rgba(255,255,255,0.12)',
              background: pin[i] ? `${color}20` : 'rgba(255,255,255,0.04)',
              color: pin[i] ? 'white' : 'rgba(255,255,255,0.2)',
              boxShadow: pin[i] ? `0 0 24px ${color}40` : 'none',
            }}
          >
            {pin[i] ? '●' : '·'}
          </motion.div>
        ))}
      </motion.div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-red-400 mb-4 relative z-10">
          {error}
        </motion.p>
      )}

      <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto flex-1 relative z-10">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleKey(String(n))}
            className="h-[60px] rounded-2xl glass text-2xl font-bold text-white hover:bg-white/12 transition-all border border-white/10 cursor-pointer"
          >
            {n}
          </motion.button>
        ))}
        <div />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => handleKey('0')}
          className="h-[60px] rounded-2xl glass text-2xl font-bold text-white hover:bg-white/12 transition-all border border-white/10 cursor-pointer"
        >
          0
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleDelete}
          className="h-[60px] rounded-2xl glass text-white/50 hover:bg-white/12 transition-all flex items-center justify-center border border-white/10 cursor-pointer"
        >
          <Delete className="w-5 h-5" />
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleSubmit}
        disabled={pin.length < 3 || verifyMutation.isPending}
        className="mt-6 w-full max-w-[300px] mx-auto py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30 border-0 cursor-pointer relative z-10 block"
        style={{
          background: pin.length === 3 ? `linear-gradient(135deg, ${color}, ${color}99)` : 'rgba(255,255,255,0.08)',
          color: 'white',
          boxShadow: pin.length === 3 ? `0 12px 32px ${color}50` : 'none',
        }}
      >
        {verifyMutation.isPending ? 'Checking PIN…' : pin.length === 3 ? `Let's Play! ${getMechanicEmoji(campaign.mechanic)}` : 'Enter 3-digit PIN'}
      </motion.button>
    </div>
  )
}
