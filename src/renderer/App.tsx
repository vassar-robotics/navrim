import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import FallbackPage from './pages/FallbackPage';
import WelcomePage from './pages/WelcomePage';

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we should navigate to fallback route
    const urlParams = new URLSearchParams(window.location.search);
    const route = urlParams.get('route');
    if (route) {
      navigate('/' + route);
      urlParams.delete('route');
      const newUrl = urlParams.toString() ?
        `${window.location.pathname}?${urlParams.toString()}` :
        window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/fallback" element={<FallbackPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
