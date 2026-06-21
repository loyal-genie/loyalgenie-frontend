import { Navigate, useSearchParams } from 'react-router-dom'

/** Legacy route — stamp collection now happens on the campaign PIN page. */
export function CustomerStampPage() {
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaign')
  if (campaignId) {
    return <Navigate to={`/customer/campaigns/${campaignId}`} replace />
  }
  return <Navigate to="/customer" replace />
}
