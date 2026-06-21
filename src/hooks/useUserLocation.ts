import { useEffect, useState } from 'react'

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { maximumAge: 120_000, timeout: 8000 },
    )
  }, [])

  return coords
}
