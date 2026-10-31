import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthButtons from '../components/AuthButtons'
import logo from '../assets/logo_color.png'

// Shown on `/` to every visitor who is not signed in (festivals FR-7).
const WelcomePage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (user) return <Navigate to="/festivals" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <img src={logo} alt="" className="w-48 h-auto rounded-2xl mb-6" />
      <h1 className="text-3xl font-bold text-white mb-8">Festi Bestie</h1>

      <AuthButtons />
    </div>
  )
}

export default WelcomePage
