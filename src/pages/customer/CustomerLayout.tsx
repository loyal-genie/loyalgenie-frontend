import { Outlet } from 'react-router-dom'

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-white flex items-start justify-center">
      <div className="w-full max-w-sm min-h-screen relative">
        <Outlet />
      </div>
    </div>
  )
}
