import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { DemoLauncherPage } from '@/pages/DemoLauncherPage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { BusinessSignInPage } from '@/pages/auth/BusinessSignInPage'
import { BusinessSignUpPage } from '@/pages/auth/BusinessSignUpPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
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
import { CustomerWalletPage } from '@/pages/customer/CustomerWalletPage'
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage'
import { CompleteProfilePage } from '@/pages/customer/CompleteProfilePage'
import { CustomerProfileInfoPage } from '@/pages/customer/profile/CustomerProfileInfoPage'
import { CustomerCheckInPage } from '@/pages/customer/CustomerCheckInPage'
import { CustomerBusinessPage } from '@/pages/customer/CustomerBusinessPage'
import { CustomerCampaignPage } from '@/pages/customer/CustomerCampaignPage'
import { CustomerShakePage } from '@/pages/customer/games/CustomerShakePage'
import { CustomerStampPage } from '@/pages/customer/games/CustomerStampPage'
import { CustomerMechanicComingSoonPage } from '@/pages/customer/games/CustomerMechanicComingSoonPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function App() {
  return (
    <BrowserRouter>
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
          <Route path="complete-profile" element={<CompleteProfilePage />} />
          <Route path="discover" element={<Navigate to="/customer" replace />} />
          <Route path="wallet" element={<CustomerWalletPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
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
    </BrowserRouter>
  )
}
