import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { posthog } from '../posthog'
import { USERNAME_MAX } from '../utils/username'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

// initialMode is read when the modal mounts. Remount it (with a key) to change it.
const LoginModal = ({ isOpen, onClose, initialMode = 'login' }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        posthog?.capture('user_signed_in')
      } else {
        const { error } = await signUp(email, password, username)
        if (error) throw error
        posthog?.capture('user_signed_up')
      }
      onClose()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setError('')
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg p-5 w-full max-w-sm border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-xs mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Choose a username"
                  maxLength={USERNAME_MAX}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-white/80 text-xs mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-xs mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-md p-2 text-red-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-page hover:bg-white/90 disabled:opacity-50 font-semibold rounded-md transition-colors text-sm"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-link hover:underline text-xs"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
