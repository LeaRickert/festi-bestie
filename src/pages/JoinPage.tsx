import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchInvite, joinGroup, type GroupInvite } from '../hooks/useGroups'
import { posthog } from '../posthog'
import AuthButtons from '../components/AuthButtons'
import { groupErrorMessage } from '../utils/groups'
import logo from '../assets/logo_color.png'

// The screen an invite link opens on `/join/:token` (groups FR-5 to FR-9). The
// user joins only on a tap of "Join". It is a landing page with the logo and no
// top navigation, as it is often the first page a friend sees of the app.
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
    posthog?.capture('group_joined', { festival_id: invite?.festivalId, group_id: groupId })
    navigate(groupPath, { replace: true })
  }

  const renderBody = () => {
    if (authLoading || (user && loading)) return <div className="text-white/60 text-sm">Loading...</div>
    // Most visitors here are new to the app, so Sign up comes first (FR-6).
    if (!user) {
      return (
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold text-white mb-2">You are invited to a group</h2>
          <p className="text-white/70 text-sm mb-8 max-w-xs">
            Rate the acts you want to see and find out who in your crew is hyped for the same sets. Sign up or log in to see
            the group.
          </p>
          <AuthButtons primary="signup" />
        </div>
      )
    }
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
      <div className="w-full bg-surface rounded-lg p-4 space-y-4">
        <div>
          <p className="text-white/60 text-xs mb-1">You are invited to</p>
          <h2 className="text-xl font-bold text-white break-words">{invite.groupName}</h2>
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <img src={logo} alt="" className={`h-auto rounded-2xl mb-4 ${user ? 'w-28' : 'w-40'}`} />
      <h1 className="text-2xl font-bold text-white mb-8">Festi Bestie</h1>

      <main className="w-full max-w-sm flex flex-col items-center">{renderBody()}</main>

      {user && (
        <Link to="/festivals" className="mt-6 text-link text-sm hover:underline">
          Go to festivals
        </Link>
      )}
    </div>
  )
}

export default JoinPage
