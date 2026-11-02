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
          <Route path="/festival/:slug" element={<FestivalDetailPage />} />
          <Route path="/festival/:slug/export" element={<ExportPage />} />
          <Route path="/festival/:slug/groups" element={<GroupsPage />} />
          <Route path="/festival/:slug/groups/:groupId" element={<GroupPage />} />
          <Route path="/festival/:slug/join/:token" element={<JoinPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
