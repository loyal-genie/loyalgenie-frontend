import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { DemoLauncherPage } from '@/pages/DemoLauncherPage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { SlugPage } from '@/pages/SlugPage'
import { VendorLayout } from '@/pages/vendor/VendorLayout'
import { VendorDashboardPage } from '@/pages/vendor/VendorDashboardPage'
import { VendorCampaignsPage } from '@/pages/vendor/VendorCampaignsPage'
import { VendorCampaignDetailPage } from '@/pages/vendor/VendorCampaignDetailPage'
import { VendorCampaignCreatePage } from '@/pages/vendor/VendorCampaignCreatePage'
import { VendorCampaignEditPage } from '@/pages/vendor/VendorCampaignEditPage'
import { VendorCustomersPage } from '@/pages/vendor/VendorCustomersPage'
import { VendorCustomerDetailPage } from '@/pages/vendor/VendorCustomerDetailPage'
import { VendorSettingsPage } from '@/pages/vendor/VendorSettingsPage'
import { VendorQrCodePage } from '@/pages/vendor/VendorQrCodePage'
import { CustomerLayout } from '@/pages/customer/CustomerLayout'
import { CustomerPage } from '@/pages/customer/CustomerPage'
import { CustomerDiscoverPage } from '@/pages/customer/CustomerDiscoverPage'
import { CustomerWalletPage } from '@/pages/customer/CustomerWalletPage'
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage'
import { CustomerBusinessPage } from '@/pages/customer/CustomerBusinessPage'
import { CustomerCampaignPage } from '@/pages/customer/CustomerCampaignPage'
import { CustomerShakePage } from '@/pages/customer/games/CustomerShakePage'
import { CustomerSpinPage } from '@/pages/customer/games/CustomerSpinPage'
import { CustomerStampPage } from '@/pages/customer/games/CustomerStampPage'
import { CustomerDicePage } from '@/pages/customer/games/CustomerDicePage'
import { CustomerLotteryPage } from '@/pages/customer/games/CustomerLotteryPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoLauncherPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/business/signin" element={<Navigate to="/signin" replace />} />
        <Route path="/business/signup" element={<Navigate to="/signup" replace />} />
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

        <Route path="/customer/signin" element={<Navigate to="/signin?role=customer" replace />} />
        <Route path="/customer/signup" element={<Navigate to="/signup?role=customer" replace />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerPage />} />
          <Route path="discover" element={<CustomerDiscoverPage />} />
          <Route path="wallet" element={<CustomerWalletPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="business/:id" element={<CustomerBusinessPage />} />
          <Route path="campaigns/:id" element={<CustomerCampaignPage />} />
          <Route path="games/shake" element={<CustomerShakePage />} />
          <Route path="games/spin" element={<CustomerSpinPage />} />
          <Route path="games/stamp" element={<CustomerStampPage />} />
          <Route path="games/dice" element={<CustomerDicePage />} />
          <Route path="games/lottery" element={<CustomerLotteryPage />} />
        </Route>

        <Route path="/:slug" element={<SlugPage />} />
      </Routes>
    </BrowserRouter>
  )
}
