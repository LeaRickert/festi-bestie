import { Routes, Route } from 'react-router'
import WelcomePage from './pages/WelcomePage'
import FestivalListPage from './pages/FestivalListPage'
import FestivalDetailPage from './pages/FestivalDetailPage'
import ExportPage from './pages/ExportPage'
import GroupsPage from './pages/GroupsPage'
import GroupPage from './pages/GroupPage'
import JoinPage from './pages/JoinPage'
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-page">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/festivals" element={<FestivalListPage />} />
          <Route path="/festival/:id" element={<FestivalDetailPage />} />
          <Route path="/festival/:id/export" element={<ExportPage />} />
          <Route path="/festival/:id/groups" element={<GroupsPage />} />
          <Route path="/festival/:id/groups/:groupId" element={<GroupPage />} />
          <Route path="/join/:token" element={<JoinPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
