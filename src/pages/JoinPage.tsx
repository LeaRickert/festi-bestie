import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchInvite, joinGroup, type GroupInvite } from '../hooks/useGroups'
import SignInPrompt from '../components/SignInPrompt'
import { groupErrorMessage } from '../utils/groups'

// The screen an invite link opens on `/join/:token` (groups FR-5 to FR-9). The
// user joins only on a tap of "Join".
const JoinPage = () => {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [invite, setInvite] = useState<GroupInvite | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  const userId = user?.id ?? null

  // The invite loads only for a signed-in user, so a visitor signs in first
  // and then sees this same screen (FR-6).
  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setLoadError('')
    try {
      setInvite(await fetchInvite(token))
    } catch (err) {
      console.error('Error loading invite:', err)
      setLoadError((err as { message?: string }).message ?? 'Could not load the invite')
    } finally {
      setLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    load()
  }, [load])

  const groupPath = invite ? `/festival/${invite.festivalId}/groups/${invite.groupId}` : '/festivals'

  const handleJoin = async () => {
    setJoining(true)
    setJoinError('')
    const { groupId, error } = await joinGroup(token)
    setJoining(false)
    if (error || !groupId) {
      setJoinError(groupErrorMessage(error))
      return
    }
    navigate(groupPath, { replace: true })
  }

  const renderBody = () => {
    if (authLoading || (user && loading)) return <div className="text-white/60 text-sm">Loading...</div>
    if (!user) return <SignInPrompt message="You have an invite to a group. Sign in or sign up to see it." />
    if (loadError) {
      return (
        <div className="space-y-2">
          <p className="text-red-400 text-sm">Could not load the invite: {loadError}</p>
          <button
            type="button"
            onClick={load}
            className="px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
          >
            Try again
          </button>
        </div>
      )
    }
    // A reset link or a deleted group (FR-4).
    if (!invite) return <p className="text-white/80 text-sm">{groupErrorMessage({ message: 'invalid_invite' })}</p>

    return (
      <div className="bg-surface rounded-lg p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white break-words">{invite.groupName}</h1>
          <p className="text-white/60 text-xs">{invite.festivalName}</p>
        </div>
        <div>
          <h2 className="flex items-center text-white/80 text-xs mb-1">
            <Users className="h-3.5 w-3.5 mr-1" />
            {invite.memberUsernames.length} member{invite.memberUsernames.length === 1 ? '' : 's'}
          </h2>
          <p className="text-white text-sm">{invite.memberUsernames.join(', ')}</p>
        </div>

        {invite.isMember ? (
          <Link
            to={groupPath}
            replace
            className="block w-full py-2.5 bg-white text-page text-center font-medium rounded-md hover:bg-white/90 transition-colors text-sm"
          >
            You are in this group. Open it
          </Link>
        ) : invite.isPast ? (
          <p className="text-white/70 text-sm">{groupErrorMessage({ message: 'group_past' })}</p>
        ) : invite.isFull ? (
          <p className="text-white/70 text-sm">{groupErrorMessage({ message: 'group_full' })}</p>
        ) : (
          <div className="space-y-2">
            <p className="bg-white/10 rounded-md p-2.5 text-white/80 text-xs">Your ratings for this festival will be visible to members</p>
            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-2.5 bg-white text-page font-medium rounded-md hover:bg-white/90 disabled:opacity-50 transition-colors text-sm"
            >
              {joining ? 'Joining...' : 'Join'}
            </button>
          </div>
        )}
        {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <Link to="/festivals" className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Festivals
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4">{renderBody()}</main>
    </div>
  )
}

export default JoinPage
