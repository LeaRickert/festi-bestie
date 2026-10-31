import { useState } from 'react'
import LoginModal from './LoginModal'

type AuthMode = 'login' | 'signup'

const LABELS: Record<AuthMode, string> = { login: 'Log in', signup: 'Sign up' }

// The Log in and Sign up buttons of a landing view. `primary` is the filled
// one and comes first. The page stays the same, so after sign-in the visitor
// is back where they were.
const AuthButtons = ({ primary = 'login' }: { primary?: AuthMode }) => {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const secondary: AuthMode = primary === 'login' ? 'signup' : 'login'

  return (
    <div className="w-full max-w-xs space-y-3">
      <button
        type="button"
        onClick={() => setAuthMode(primary)}
        className="w-full py-2.5 bg-white text-page font-semibold rounded-md hover:bg-white/90 transition-colors"
      >
        {LABELS[primary]}
      </button>
      <button
        type="button"
        onClick={() => setAuthMode(secondary)}
        className="w-full py-2.5 border border-white/40 text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
      >
        {LABELS[secondary]}
      </button>
      {authMode && <LoginModal key={authMode} isOpen initialMode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}

export default AuthButtons
