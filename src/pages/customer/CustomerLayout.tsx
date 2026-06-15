import { Outlet } from 'react-router-dom'

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full min-h-screen relative max-w-sm lg:max-w-5xl">
        <Outlet />
      </div>
    </div>
  )
}
