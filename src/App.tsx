import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RouteErrorBoundary } from '@/components/shared/RouteErrorBoundary'
import { lazyWithRetry } from '@/lib/lazy-with-retry'

const HomePage = lazyWithRetry(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const DemoLauncherPage = lazyWithRetry(() => import('@/pages/DemoLauncherPage').then(m => ({ default: m.DemoLauncherPage })))
const SignInPage = lazyWithRetry(() => import('@/pages/auth/SignInPage').then(m => ({ default: m.SignInPage })))
const BusinessSignInPage = lazyWithRetry(() => import('@/pages/auth/BusinessSignInPage').then(m => ({ default: m.BusinessSignInPage })))
const BusinessSignUpPage = lazyWithRetry(() => import('@/pages/auth/BusinessSignUpPage').then(m => ({ default: m.BusinessSignUpPage })))
const ForgotPasswordPage = lazyWithRetry(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const OnboardingPage = lazyWithRetry(() => import('@/pages/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const SlugPage = lazyWithRetry(() => import('@/pages/SlugPage').then(m => ({ default: m.SlugPage })))
const VendorLayout = lazyWithRetry(() => import('@/pages/vendor/VendorLayout').then(m => ({ default: m.VendorLayout })))
const VendorDashboardPage = lazyWithRetry(() => import('@/pages/vendor/VendorDashboardPage').then(m => ({ default: m.VendorDashboardPage })))
const VendorCampaignsPage = lazyWithRetry(() => import('@/pages/vendor/VendorCampaignsPage').then(m => ({ default: m.VendorCampaignsPage })))
const VendorCampaignDetailPage = lazyWithRetry(() => import('@/pages/vendor/VendorCampaignDetailPage').then(m => ({ default: m.VendorCampaignDetailPage })))
const VendorCampaignCreatePage = lazyWithRetry(() => import('@/pages/vendor/VendorCampaignCreatePage').then(m => ({ default: m.VendorCampaignCreatePage })))
const VendorCampaignEditPage = lazyWithRetry(() => import('@/pages/vendor/VendorCampaignEditPage').then(m => ({ default: m.VendorCampaignEditPage })))
const VendorCustomersPage = lazyWithRetry(() => import('@/pages/vendor/VendorCustomersPage').then(m => ({ default: m.VendorCustomersPage })))
const VendorCustomerDetailPage = lazyWithRetry(() => import('@/pages/vendor/VendorCustomerDetailPage').then(m => ({ default: m.VendorCustomerDetailPage })))
const VendorSettingsPage = lazyWithRetry(() => import('@/pages/vendor/VendorSettingsPage').then(m => ({ default: m.VendorSettingsPage })))
const VendorQrCodePage = lazyWithRetry(() => import('@/pages/vendor/VendorQrCodePage').then(m => ({ default: m.VendorQrCodePage })))
const VendorRewardsPage = lazyWithRetry(() => import('@/pages/vendor/VendorRewardsPage').then(m => ({ default: m.VendorRewardsPage })))
const VendorRewardCreatePage = lazyWithRetry(() => import('@/pages/vendor/VendorRewardCreatePage').then(m => ({ default: m.VendorRewardCreatePage })))
const VendorRewardEditPage = lazyWithRetry(() => import('@/pages/vendor/VendorRewardCreatePage').then(m => ({ default: m.VendorRewardEditPage })))
const CustomerLayout = lazyWithRetry(() => import('@/pages/customer/CustomerLayout').then(m => ({ default: m.CustomerLayout })))
const CustomerPage = lazyWithRetry(() => import('@/pages/customer/CustomerPage').then(m => ({ default: m.CustomerPage })))
const CustomerWalletPage = lazyWithRetry(() => import('@/pages/customer/CustomerWalletPage').then(m => ({ default: m.CustomerWalletPage })))
const CustomerProfilePage = lazyWithRetry(() => import('@/pages/customer/CustomerProfilePage').then(m => ({ default: m.CustomerProfilePage })))
const CustomerProfileEditPage = lazyWithRetry(() => import('@/pages/customer/profile/CustomerProfileEditPage').then(m => ({ default: m.CustomerProfileEditPage })))
const CustomerNotificationsPage = lazyWithRetry(() => import('@/pages/customer/CustomerNotificationsPage').then(m => ({ default: m.CustomerNotificationsPage })))
const CustomerProfileInfoPage = lazyWithRetry(() => import('@/pages/customer/profile/CustomerProfileInfoPage').then(m => ({ default: m.CustomerProfileInfoPage })))
const CustomerCheckInPage = lazyWithRetry(() => import('@/pages/customer/CustomerCheckInPage').then(m => ({ default: m.CustomerCheckInPage })))
const CustomerBusinessPage = lazyWithRetry(() => import('@/pages/customer/CustomerBusinessPage').then(m => ({ default: m.CustomerBusinessPage })))
const CustomerCampaignPage = lazyWithRetry(() => import('@/pages/customer/CustomerCampaignPage').then(m => ({ default: m.CustomerCampaignPage })))
const CustomerRewardClaimPage = lazyWithRetry(() => import('@/pages/customer/CustomerRewardClaimPage').then(m => ({ default: m.CustomerRewardClaimPage })))

// Forces a full remount when navigating between different rewards, so rub/claim state
// (progress, revealed, etc.) never leaks from a previously claimed reward onto the next one.
function CustomerRewardClaimPageWithKey() {
  const { rewardId } = useParams()
  return <CustomerRewardClaimPage key={rewardId} />
}
const CustomerShakePage = lazyWithRetry(() => import('@/pages/customer/games/CustomerShakePage').then(m => ({ default: m.CustomerShakePage })))
const CustomerSpinPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerSpinPage').then(m => ({ default: m.CustomerSpinPage })))
const CustomerDicePage = lazyWithRetry(() => import('@/pages/customer/games/CustomerDicePage').then(m => ({ default: m.CustomerDicePage })))
const CustomerLotteryPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerLotteryPage').then(m => ({ default: m.CustomerLotteryPage })))
const CustomerBuyXGetYPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerBuyXGetYPage').then(m => ({ default: m.CustomerBuyXGetYPage })))
const CustomerCouponPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerCouponPage').then(m => ({ default: m.CustomerCouponPage })))
const CustomerFlashPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerFlashPage').then(m => ({ default: m.CustomerFlashPage })))
const CustomerComboPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerComboPage').then(m => ({ default: m.CustomerComboPage })))
const CustomerFriendPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerFriendPage').then(m => ({ default: m.CustomerFriendPage })))
const CustomerGroupUnlockPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerGroupUnlockPage').then(m => ({ default: m.CustomerGroupUnlockPage })))
const CustomerStampPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerStampPage').then(m => ({ default: m.CustomerStampPage })))
const CustomerMechanicComingSoonPage = lazyWithRetry(() => import('@/pages/customer/games/CustomerMechanicComingSoonPage').then(m => ({ default: m.CustomerMechanicComingSoonPage })))

function PageLoader({ variant }: { variant?: 'customer' | 'vendor' }) {
  return (
    <div className={`min-h-dvh flex items-center justify-center ${variant === 'customer' ? 'bg-white' : 'bg-v-surface min-h-screen'}`}>
      <div className="w-8 h-8 border-2 border-v-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
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
            <Route path="rewards" element={<VendorRewardsPage />} />
            <Route path="rewards/create" element={<VendorRewardCreatePage />} />
            <Route path="rewards/:rewardId/edit" element={<VendorRewardEditPage />} />
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
                <RouteErrorBoundary variant="customer">
                  <CustomerLayout />
                </RouteErrorBoundary>
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
            <Route path="rewards/:rewardId/claim" element={<CustomerRewardClaimPageWithKey />} />
            <Route path="games/shake" element={<CustomerShakePage />} />
            <Route path="games/spin" element={<CustomerSpinPage />} />
            <Route path="games/stamp" element={<CustomerStampPage />} />
            <Route path="games/coming-soon" element={<CustomerMechanicComingSoonPage />} />
            <Route path="games/dice" element={<CustomerDicePage />} />
            <Route path="games/lottery" element={<CustomerLotteryPage />} />
            <Route path="games/buy-x-get-y" element={<CustomerBuyXGetYPage />} />
            <Route path="games/coupon" element={<CustomerCouponPage />} />
            <Route path="games/flash" element={<CustomerFlashPage />} />
            <Route path="games/combo" element={<CustomerComboPage />} />
            <Route path="games/friend" element={<CustomerFriendPage />} />
            <Route path="games/groupunlock" element={<CustomerGroupUnlockPage />} />
          </Route>

          <Route path="/:slug" element={<SlugPage />} />
        </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  )
}
