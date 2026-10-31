import { useState } from 'react'
import LoginModal from './LoginModal'

// Asks a visitor to sign in or sign up. The page stays the same, so after
// sign-in the visitor is back where they were (groups FR-6).
const SignInPrompt = ({ message }: { message: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-surface rounded-lg p-4 text-center space-y-3">
      <p className="text-white/80 text-sm">{message}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 bg-white text-page font-medium rounded-md hover:bg-white/90 transition-colors text-sm"
      >
        Sign in or sign up
      </button>
      <LoginModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default SignInPrompt
