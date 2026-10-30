import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import LoginModal from '../components/LoginModal'
import logo from '../assets/logo_color.png'

type AuthMode = 'login' | 'signup'

// Shown on `/` to every visitor who is not signed in (festivals FR-7).
const WelcomePage = () => {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

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

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className="w-full py-2.5 bg-white text-page font-semibold rounded-md hover:bg-white/90 transition-colors"
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className="w-full py-2.5 border border-white/40 text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
        >
          Sign up
        </button>
      </div>

      <Link to="/festivals" className="mt-6 text-link text-sm hover:underline">
        View festivals as guest
      </Link>

      {authMode && (
        <LoginModal key={authMode} isOpen initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </div>
  )
}

export default WelcomePage
