import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './components/layout/layout'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<div>Hello, navrim!</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/control" element={<div>Control</div>} />
          <Route path="/datasets" element={<div>Datasets</div>} />
          <Route path="/training" element={<div>Training</div>} />
          <Route path="/inference" element={<div>Inference</div>} />
          <Route path="/chat" element={<div>Chat</div>} />
          <Route path="/configuration" element={<div>Configuration</div>} />
          <Route path="/cameras" element={<div>Cameras</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
