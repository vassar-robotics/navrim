import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function EnvironmentFallback() {
  return (
    <div className="fallback-container">
      <div className="fallback-content">
        <div className="fallback-icon">⚠️</div>
        <h1 className="fallback-title">Oops!</h1>
        <p className="fallback-message">
          It seems that your environment is not ready.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnvironmentFallback />} />
      </Routes>
    </Router>
  );
}
