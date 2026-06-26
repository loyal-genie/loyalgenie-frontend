import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isReservedSlug } from '@/lib/reserved-slugs'

/** Legacy `/{slug}` links from older standees redirect to customer sign-in. */
export function SlugPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!slug || isReservedSlug(slug)) {
      navigate('/', { replace: true })
      return
    }
    navigate(`/signin?b=${encodeURIComponent(slug)}`, { replace: true })
  }, [slug, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0520' }}>
      <p className="text-muted text-sm">Redirecting to sign in…</p>
    </div>
  )
}
