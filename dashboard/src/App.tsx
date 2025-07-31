import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@/components/layout/root-layout'
import { LoginPage } from '@/components/page/login-page'
import { SignupPage } from '@/components/page/signup-page'
import { NotFoundPage } from '@/components/page/not-found-page'
import { ConfigPage } from '@/components/page/config-page'
import { CameraPage } from '@/components/page/camera-page'
import { ProtectedRoute } from './components/context/auth/protected-route'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<div>Hello, navrim!</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/control" element={<div>Control</div>} />
          <Route path="/datasets" element={<div>Datasets</div>} />
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
                <div>Chat</div>
              </ProtectedRoute>
            }
          />
          <Route path="/configuration" element={<ConfigPage />} />
          <Route path="/cameras" element={<CameraPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/terms" element={<div>Terms</div>} />
          <Route path="/privacy" element={<div>Privacy</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
