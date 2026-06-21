import { useSearchParams } from 'react-router-dom'
import { MechanicComingSoon } from '@/components/shared/MechanicComingSoon'

export function CustomerMechanicComingSoonPage() {
  const [params] = useSearchParams()
  const mechanic = params.get('mechanic') ?? 'spin'

  return <MechanicComingSoon mechanic={mechanic} backTo="/customer" />
}
