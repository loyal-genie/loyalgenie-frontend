import { Outlet } from 'react-router-dom'
import { useCustomerSessionRealtime } from '@/hooks/useCustomerData'

export function CustomerLayout() {
  useCustomerSessionRealtime()

  return (
    <div className="min-h-dvh flex justify-center bg-[#f9fafb]">
      <div className="w-full min-h-dvh relative max-w-[440px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.06)]">
        <Outlet />
      </div>
    </div>
  )
}
