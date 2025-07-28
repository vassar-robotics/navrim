import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrimaryLayout from '@/components/layout/PrimaryLayout';
import DashboardPage from '@/pages/DashboardPage';
import ControlPage from '@/pages/ControlPage';
import DatasetsPage from '@/pages/DatasetsPage';
import TrainingPage from '@/pages/TrainingPage';
import InferencePage from '@/pages/InferencePage';
import ConfigurationPage from '@/pages/ConfigurationPage';
import CamerasPage from '@/pages/CamerasPage';
import ChatPage from '@/pages/ChatPage';
import ToastProvider from '@/components/ui/Toast';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<PrimaryLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="control" element={<ControlPage />} />
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="inference" element={<InferencePage />} />
          <Route path="configuration" element={<ConfigurationPage />} />
          <Route path="cameras" element={<CamerasPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
