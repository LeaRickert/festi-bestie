import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import FestivalDetailPage from './pages/FestivalDetailPage'
import ExportPage from './pages/ExportPage'
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/festival/:id" element={<FestivalDetailPage />} />
          <Route path="/festival/:id/export" element={<ExportPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
