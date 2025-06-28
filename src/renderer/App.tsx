import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import FallbackPage from './pages/FallbackPage';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FallbackPage />} />
      </Routes>
    </Router>
  );
}
