import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { SlugPage } from '@/pages/SlugPage'
import { VendorLayout } from '@/pages/vendor/VendorLayout'
import { VendorDashboardPage } from '@/pages/vendor/VendorDashboardPage'
import { VendorCampaignsPage } from '@/pages/vendor/VendorCampaignsPage'
import { VendorCampaignDetailPage } from '@/pages/vendor/VendorCampaignDetailPage'
import { VendorCampaignCreatePage } from '@/pages/vendor/VendorCampaignCreatePage'
import { VendorCustomersPage } from '@/pages/vendor/VendorCustomersPage'
import { VendorCustomerDetailPage } from '@/pages/vendor/VendorCustomerDetailPage'
import { VendorSettingsPage } from '@/pages/vendor/VendorSettingsPage'
import { VendorQrCodePage } from '@/pages/vendor/VendorQrCodePage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
          <Route path="customers" element={<VendorCustomersPage />} />
          <Route path="customers/:id" element={<VendorCustomerDetailPage />} />
          <Route path="qr-code" element={<VendorQrCodePage />} />
          <Route path="settings" element={<VendorSettingsPage />} />
        </Route>

        <Route path="/:slug" element={<SlugPage />} />
      </Routes>
    </BrowserRouter>
  )
}
