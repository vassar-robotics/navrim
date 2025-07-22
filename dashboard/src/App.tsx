import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrimaryLayout from '@/components/layout/PrimaryLayout';
import DashboardPage from '@/pages/DashboardPage';
import ControlPage from '@/pages/ControlPage';
import DatasetsPage from '@/pages/DatasetsPage';
import TrainingPage from '@/pages/TrainingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrimaryLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="control" element={<ControlPage />} />
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="training" element={<TrainingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
