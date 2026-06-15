import { Outlet, useLocation } from 'react-router-dom'

export function CustomerLayout() {
  const { pathname } = useLocation()
  const isGameRoute = pathname.includes('/customer/games/')

  return (
    <div className={`min-h-dvh flex justify-center ${isGameRoute ? 'bg-[#0D0B1E]' : 'bg-gray-50'}`}>
      <div className={`w-full min-h-dvh relative ${isGameRoute ? 'max-w-md' : 'max-w-sm lg:max-w-5xl'}`}>
        <Outlet />
      </div>
    </div>
  )
}
