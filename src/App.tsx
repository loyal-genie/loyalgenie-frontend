import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const DemoLauncherPage = lazy(() => import('@/pages/DemoLauncherPage').then(m => ({ default: m.DemoLauncherPage })))
const SignInPage = lazy(() => import('@/pages/auth/SignInPage').then(m => ({ default: m.SignInPage })))
const BusinessSignInPage = lazy(() => import('@/pages/auth/BusinessSignInPage').then(m => ({ default: m.BusinessSignInPage })))
const BusinessSignUpPage = lazy(() => import('@/pages/auth/BusinessSignUpPage').then(m => ({ default: m.BusinessSignUpPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const SlugPage = lazy(() => import('@/pages/SlugPage').then(m => ({ default: m.SlugPage })))
const VendorLayout = lazy(() => import('@/pages/vendor/VendorLayout').then(m => ({ default: m.VendorLayout })))
const VendorDashboardPage = lazy(() => import('@/pages/vendor/VendorDashboardPage').then(m => ({ default: m.VendorDashboardPage })))
const VendorCampaignsPage = lazy(() => import('@/pages/vendor/VendorCampaignsPage').then(m => ({ default: m.VendorCampaignsPage })))
const VendorCampaignDetailPage = lazy(() => import('@/pages/vendor/VendorCampaignDetailPage').then(m => ({ default: m.VendorCampaignDetailPage })))
const VendorCampaignCreatePage = lazy(() => import('@/pages/vendor/VendorCampaignCreatePage').then(m => ({ default: m.VendorCampaignCreatePage })))
const VendorCampaignEditPage = lazy(() => import('@/pages/vendor/VendorCampaignEditPage').then(m => ({ default: m.VendorCampaignEditPage })))
const VendorCustomersPage = lazy(() => import('@/pages/vendor/VendorCustomersPage').then(m => ({ default: m.VendorCustomersPage })))
const VendorCustomerDetailPage = lazy(() => import('@/pages/vendor/VendorCustomerDetailPage').then(m => ({ default: m.VendorCustomerDetailPage })))
const VendorSettingsPage = lazy(() => import('@/pages/vendor/VendorSettingsPage').then(m => ({ default: m.VendorSettingsPage })))
const VendorQrCodePage = lazy(() => import('@/pages/vendor/VendorQrCodePage').then(m => ({ default: m.VendorQrCodePage })))
const CustomerLayout = lazy(() => import('@/pages/customer/CustomerLayout').then(m => ({ default: m.CustomerLayout })))
const CustomerPage = lazy(() => import('@/pages/customer/CustomerPage').then(m => ({ default: m.CustomerPage })))
const CustomerWalletPage = lazy(() => import('@/pages/customer/CustomerWalletPage').then(m => ({ default: m.CustomerWalletPage })))
const CustomerProfilePage = lazy(() => import('@/pages/customer/CustomerProfilePage').then(m => ({ default: m.CustomerProfilePage })))
const CustomerProfileEditPage = lazy(() => import('@/pages/customer/profile/CustomerProfileEditPage').then(m => ({ default: m.CustomerProfileEditPage })))
const CustomerNotificationsPage = lazy(() => import('@/pages/customer/CustomerNotificationsPage').then(m => ({ default: m.CustomerNotificationsPage })))
const CustomerProfileInfoPage = lazy(() => import('@/pages/customer/profile/CustomerProfileInfoPage').then(m => ({ default: m.CustomerProfileInfoPage })))
const CustomerCheckInPage = lazy(() => import('@/pages/customer/CustomerCheckInPage').then(m => ({ default: m.CustomerCheckInPage })))
const CustomerBusinessPage = lazy(() => import('@/pages/customer/CustomerBusinessPage').then(m => ({ default: m.CustomerBusinessPage })))
const CustomerCampaignPage = lazy(() => import('@/pages/customer/CustomerCampaignPage').then(m => ({ default: m.CustomerCampaignPage })))
const CustomerShakePage = lazy(() => import('@/pages/customer/games/CustomerShakePage').then(m => ({ default: m.CustomerShakePage })))
const CustomerStampPage = lazy(() => import('@/pages/customer/games/CustomerStampPage').then(m => ({ default: m.CustomerStampPage })))
const CustomerMechanicComingSoonPage = lazy(() => import('@/pages/customer/games/CustomerMechanicComingSoonPage').then(m => ({ default: m.CustomerMechanicComingSoonPage })))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-v-surface">
      <div className="w-8 h-8 border-2 border-v-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoLauncherPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<Navigate to="/signin" replace />} />
          <Route path="/business/signin" element={<BusinessSignInPage />} />
          <Route path="/business/signup" element={<BusinessSignUpPage />} />
          <Route path="/business/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password" element={<Navigate to="/business/forgot-password" replace />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendor"
            element={
              <ProtectedRoute>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<VendorDashboardPage />} />
            <Route path="dashboard" element={<VendorDashboardPage />} />
            <Route path="campaigns" element={<VendorCampaignsPage />} />
            <Route path="campaigns/create" element={<VendorCampaignCreatePage />} />
            <Route path="campaigns/:id" element={<VendorCampaignDetailPage />} />
            <Route path="campaigns/:id/edit" element={<VendorCampaignEditPage />} />
            <Route path="customers" element={<VendorCustomersPage />} />
            <Route path="customers/:id" element={<VendorCustomerDetailPage />} />
            <Route path="qr-code" element={<VendorQrCodePage />} />
            <Route path="settings" element={<VendorSettingsPage />} />
          </Route>

          <Route path="/customer/signin" element={<Navigate to="/signin" replace />} />
          <Route path="/customer/signup" element={<Navigate to="/signin" replace />} />
          <Route
            path="/customer"
            element={
              <ProtectedRoute role="customer">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerPage />} />
            <Route path="discover" element={<Navigate to="/customer" replace />} />
            <Route path="wallet" element={<CustomerWalletPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
            <Route path="profile/edit" element={<CustomerProfileEditPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
            <Route path="profile/:section" element={<CustomerProfileInfoPage />} />
            <Route path="check-in" element={<CustomerCheckInPage />} />
            <Route path="business/:id" element={<CustomerBusinessPage />} />
            <Route path="campaigns/:id" element={<CustomerCampaignPage />} />
            <Route path="games/shake" element={<CustomerShakePage />} />
            <Route path="games/stamp" element={<CustomerStampPage />} />
            <Route path="games/coming-soon" element={<CustomerMechanicComingSoonPage />} />
            <Route path="games/spin" element={<Navigate to="/customer/games/coming-soon?mechanic=spin" replace />} />
            <Route path="games/dice" element={<Navigate to="/customer/games/coming-soon?mechanic=dice" replace />} />
            <Route path="games/lottery" element={<Navigate to="/customer/games/coming-soon?mechanic=lottery" replace />} />
          </Route>

          <Route path="/:slug" element={<SlugPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
