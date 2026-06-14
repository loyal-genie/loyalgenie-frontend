import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QrStandeeCard } from '@/components/qr/QrStandeeCard'
import { fetchBusinessBySlug } from '@/lib/api'
import { isReservedSlug } from '@/lib/reserved-slugs'

export function SlugPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (slug && isReservedSlug(slug)) {
      navigate('/', { replace: true })
    }
  }, [slug, navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['business-slug', slug],
    queryFn: () => fetchBusinessBySlug(slug!),
    enabled: Boolean(slug) && !isReservedSlug(slug ?? ''),
    retry: false,
  })

  if (!slug || isReservedSlug(slug)) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0520' }}>
        <p className="text-muted text-sm">Loading...</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0a0520' }}>
        <p className="text-white text-lg font-bold mb-2">Business not found</p>
        <p className="text-muted text-sm mb-6">No LoyalGenie business at /{slug}</p>
        <Link to="/" className="btn-gold text-sm no-underline">Go home</Link>
      </div>
    )
  }

  const businessName = (data.name as string) ?? slug

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(165deg, #0a0520 0%, #1a0b4b 50%, #0a0520 100%)' }}
    >
      <Link to="/" className="mb-8 text-sm text-muted hover:text-white no-underline transition-colors">
        ← LoyalGenie
      </Link>
      <QrStandeeCard
        qrCodeDataUrl={data.qrCodeDataUrl}
        slug={slug}
        businessName={businessName}
      />
      <p className="text-muted text-xs mt-8 text-center max-w-xs">
        Scan the QR code or visit <span className="text-gold font-semibold">/{slug}</span> to join {businessName}&apos;s loyalty program.
      </p>
    </div>
  )
}
