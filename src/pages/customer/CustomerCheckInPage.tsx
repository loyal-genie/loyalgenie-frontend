import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

/** Legacy route — redirects to the unified campaign detail page. */
export function CustomerCheckInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaign')

  useEffect(() => {
    if (campaignId) {
      navigate(`/customer/campaigns/${campaignId}`, { replace: true })
    } else {
      navigate('/customer', { replace: true })
    }
  }, [campaignId, navigate])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f5f0ff]">
      <Loader2 className="size-10 text-[#631cbb] animate-spin" />
    </div>
  )
}
