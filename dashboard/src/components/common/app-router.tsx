import { ProtectedRoute } from '@/components/context/auth/protected-route'
import RootLayout from '@/components/layout/root-layout'
import { CameraPage } from '@/components/page/camera-page'
import ChatPage from '@/components/page/chat-page'
import { ConfigPage } from '@/components/page/config-page'
import { DatasetPage } from '@/components/page/dataset-page'
import ForgetPasswordPage from '@/components/page/forget-password-page'
import { LoginPage } from '@/components/page/login-page'
import { NotFoundPage } from '@/components/page/not-found-page'
import PrivacyPolicyPage from '@/components/page/privacy-policy-page'
import { SignupPage } from '@/components/page/signup-page'
import TermsPage from '@/components/page/terms-page'
import WelcomePage from '@/components/page/welcome-page'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/control" element={<div>Control</div>} />
          <Route path="/datasets" element={<DatasetPage />} />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <div>Training</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inference"
            element={
              <ProtectedRoute>
                <div>Inference</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="/configuration" element={<ConfigPage />} />
          <Route path="/cameras" element={<CameraPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
