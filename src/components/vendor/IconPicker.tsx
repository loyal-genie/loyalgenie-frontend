import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import EmojiPickerLib from 'emoji-picker-react'

type IconItem = { key: string; label: string; emoji: string }

const ICONS: IconItem[] = [
  { key: 'gift', label: 'Gift', emoji: '🎁' },
  { key: 'coffee', label: 'Coffee', emoji: '☕' },
  { key: 'meal', label: 'Meal', emoji: '🍽️' },
  { key: 'burger', label: 'Burger', emoji: '🍔' },
  { key: 'pizza', label: 'Pizza', emoji: '🍕' },
  { key: 'cake', label: 'Cake', emoji: '🍰' },
  { key: 'cupcake', label: 'Cupcake', emoji: '🧁' },
  { key: 'cookie', label: 'Cookie', emoji: '🍪' },
  { key: 'icecream', label: 'Ice Cream', emoji: '🍨' },
  { key: 'popcorn', label: 'Popcorn', emoji: '🍿' },
  { key: 'bento', label: 'Bento', emoji: '🍱' },
  { key: 'ramen', label: 'Ramen', emoji: '🍜' },
  { key: 'sushi', label: 'Sushi', emoji: '🍣' },
  { key: 'salad', label: 'Salad', emoji: '🥗' },
  { key: 'drink', label: 'Drink', emoji: '🥤' },
  { key: 'wine', label: 'Wine', emoji: '🍷' },
  { key: 'beer', label: 'Beer', emoji: '🍺' },
  { key: 'ticket', label: 'Ticket', emoji: '🎟️' },
  { key: 'tag', label: 'Tag', emoji: '🏷️' },
  { key: 'medal', label: 'Medal', emoji: '🏅' },
  { key: 'star', label: 'Star', emoji: '⭐' },
  { key: 'sparkles', label: 'Sparkles', emoji: '✨' },
  { key: 'crown', label: 'Crown', emoji: '👑' },
  { key: 'wallet', label: 'Wallet', emoji: '👛' },
  { key: 'bag', label: 'Bag', emoji: '👜' },
  { key: 'cart', label: 'Cart', emoji: '🛒' },
  { key: 'phone', label: 'Phone', emoji: '📱' },
  { key: 'movie', label: 'Movie', emoji: '🎬' },
  { key: 'music', label: 'Music', emoji: '🎵' },
  { key: 'game', label: 'Game', emoji: '🎮' },
  { key: 'travel', label: 'Travel', emoji: '✈️' },
  { key: 'party', label: 'Party', emoji: '🎉' },
  { key: 'smile', label: 'Smile', emoji: '😊' },
  { key: 'heart', label: 'Heart', emoji: '💜' },
  { key: 'donut', label: 'Donut', emoji: '🍩' },
  { key: 'chocolate', label: 'Chocolate', emoji: '🍫' },
  { key: 'croissant', label: 'Croissant', emoji: '🥐' },
  { key: 'fries', label: 'Fries', emoji: '🍟' },
  { key: 'hotdog', label: 'Hotdog', emoji: '🌭' },
  { key: 'taco', label: 'Taco', emoji: '🌮' },
  { key: 'burrito', label: 'Burrito', emoji: '🌯' },
  { key: 'sandwich', label: 'Sandwich', emoji: '🥪' },
  { key: 'dumpling', label: 'Dumpling', emoji: '🥟' },
  { key: 'rice', label: 'Rice', emoji: '🍚' },
  { key: 'tea', label: 'Tea', emoji: '🍵' },
  { key: 'milk', label: 'Milk', emoji: '🥛' },
  { key: 'juice', label: 'Juice', emoji: '🧃' },
  { key: 'champagne', label: 'Champagne', emoji: '🍾' },
  { key: 'balloon', label: 'Balloon', emoji: '🎈' },
  { key: 'fire', label: 'Fire', emoji: '🔥' },
]

interface IconPickerProps {
  value: string
  onChange: (next: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query.trim()) return ICONS
    const q = query.toLowerCase()
    return ICONS.filter(icon => icon.label.toLowerCase().includes(q) || icon.key.includes(q))
  }, [query])

  const active = ICONS.find(icon => icon.key === value) ?? ICONS[0]
  const activeEmoji = value?.trim().length && !ICONS.some(icon => icon.key === value) ? value : active.emoji

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex h-11 w-12 shrink-0 items-center justify-center gap-0.5 rounded-xl border border-v-border bg-white"
      >
        <span className="text-xl leading-none">{activeEmoji}</span>
        <ChevronDown className="h-3 w-3 text-v-text-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-[min(1000px,calc(100vw-80px))] rounded-2xl border border-v-border bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-v-surface-2 flex items-center justify-center">
              <span className="text-xl">{activeEmoji}</span>
            </div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search icon"
              className="h-11 flex-1 rounded-full border border-v-border px-6 text-sm text-v-text focus:outline-none focus:border-v-purple"
            />
          </div>
          <div className="mt-3 rounded-2xl border border-v-border p-2">
            {!!query.trim() && (
              <div className="mb-2 grid max-h-44 grid-cols-8 gap-2 overflow-y-auto pr-1">
                {filtered.map(icon => {
                  const selected = value === icon.key || value === icon.emoji
                  return (
                    <button
                      key={icon.key}
                      type="button"
                      onClick={() => {
                        onChange(icon.emoji)
                        setOpen(false)
                      }}
                      title={icon.label}
                      className={`h-10 rounded-xl border transition-colors flex items-center justify-center ${
                        selected ? 'border-[#8a50ea] bg-[#efe7ff]' : 'border-v-border bg-white text-v-text-2 hover:bg-v-surface-2'
                      }`}
                    >
                      <span className="text-[20px] leading-none">{icon.emoji}</span>
                    </button>
                  )
                })}
              </div>
            )}
            <EmojiPickerLib
              open
              lazyLoadEmojis
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
              onEmojiClick={(emojiData) => {
                onChange(emojiData.emoji)
                setOpen(false)
              }}
              height={330}
              width="100%"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function InlineIconChip({ iconKey }: { iconKey: string }) {
  const match = ICONS.find(icon => icon.key === iconKey) ?? ICONS[0]
  return (
    <div className="h-14 w-20 shrink-0 rounded-xl border border-v-border bg-[#f3f3f8] flex items-center justify-center">
      <span className="text-[26px] leading-none">{match.emoji}</span>
    </div>
  )
}

export function RewardIcon({ iconKey, className = '' }: { iconKey: string; className?: string }) {
  if (iconKey?.trim() && !ICONS.some(icon => icon.key === iconKey)) {
    return <span className={className}>{iconKey}</span>
  }
  const match = ICONS.find(icon => icon.key === iconKey) ?? ICONS[0]
  return <span className={className}>{match.emoji}</span>
}

export function LegacyIconSearchPanel({ value, onChange }: IconPickerProps) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query.trim()) return ICONS
    const q = query.toLowerCase()
    return ICONS.filter(icon => icon.label.toLowerCase().includes(q) || icon.key.includes(q))
  }, [query])
  const active = ICONS.find(icon => icon.key === value) ?? ICONS[0]

  return (
    <div className="rounded-xl border border-v-border bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-v-surface-2 flex items-center justify-center">
          <span className="text-xl">{active.emoji}</span>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search icon"
          className="h-11 flex-1 rounded-xl border border-v-border px-3 text-sm text-v-text focus:outline-none focus:border-v-purple"
        />
      </div>
      <div className="mt-3 grid max-h-52 grid-cols-8 gap-2 overflow-y-auto">
        {filtered.map(icon => {
          const selected = value === icon.key
          return (
            <button
              key={icon.key}
              type="button"
              onClick={() => onChange(icon.key)}
              title={icon.label}
              className={`h-9 rounded-lg border transition-colors flex items-center justify-center ${
                selected ? 'border-v-purple bg-v-purple/10 text-v-purple' : 'border-v-border bg-white text-v-text-2 hover:bg-v-surface-2'
              }`}
            >
              <span className="text-[18px]">{icon.emoji}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function renderRewardIcon(iconKey: string, className = 'h-4 w-4', color = '#7c3aec') {
  const match = ICONS.find(icon => icon.key === iconKey) ?? ICONS[0]
  void className
  void color
  if (iconKey?.trim() && !ICONS.some(icon => icon.key === iconKey)) {
    return <span>{iconKey}</span>
  }
  return <span>{match.emoji}</span>
}
