import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useFestivalSummary } from '../hooks/useFestivalData'
import { createGroup, useMyGroups } from '../hooks/useGroups'
import { posthog } from '../posthog'
import { posthogLogger } from '../posthogLogger'
import SignInPrompt from '../components/SignInPrompt'
import { isFestivalPast, localDateString } from '../utils/festivalUtils'
import { groupErrorMessage, isValidGroupName } from '../utils/groups'

// A user is in at most 2 groups for a festival (groups FR-8).
const MAX_GROUPS = 2

// The groups of the user for one festival, and "Make a group" (groups FR-1, FR-19).
const GroupsPage = () => {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { festival, loading: festivalLoading, error: festivalError, retry: retryFestival } = useFestivalSummary(slug)
  const { groups, loading, error, reload } = useMyGroups(festival?.id ?? null, user?.id ?? null)

  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const past = festival ? isFestivalPast(festival.end_date, localDateString(new Date())) : false

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!festival) return
    if (!isValidGroupName(name)) {
      setCreateError(groupErrorMessage({ code: '23514' }))
      return
    }
    setCreating(true)
    setCreateError('')
    const { groupId, error: dbError } = await createGroup(festival.id, name)
    setCreating(false)
    if (dbError || !groupId) {
      setCreateError(groupErrorMessage(dbError))
      return
    }
    posthog?.capture('group_created', { festival_id: festival.id, group_id: groupId })
    posthogLogger.info('group created', { festival_id: festival.id, group_id: groupId })
    navigate(`/festival/${slug}/groups/${groupId}`)
  }

  const renderBody = () => {
    if (authLoading || festivalLoading || (user && loading)) {
      return <div className="text-white/60 text-sm">Loading...</div>
    }
    if (festivalError || error) {
      return (
        <div className="space-y-2">
          <p className="text-red-400 text-sm">
            Could not load {festivalError ? 'the festival' : 'your groups'}: {festivalError ?? error}
          </p>
          <button
            type="button"
            onClick={festivalError ? retryFestival : reload}
            className="px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
          >
            Try again
          </button>
        </div>
      )
    }
    if (!festival) return <p className="text-white/80 text-sm">Festival not found</p>
    if (!user) {
      return <SignInPrompt message="Sign in to see your groups or make one." />
    }

    return (
      <div className="space-y-4">
        {groups.length > 0 ? (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  to={`/festival/${slug}/groups/${group.id}`}
                  className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2.5 hover:bg-surface/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-semibold text-sm truncate">{group.name}</h2>
                    <p className="text-white/60 text-xs">
                      {group.members.length} member{group.members.length === 1 ? '' : 's'}
                      {group.isOwner ? ' · Owner' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white/60 text-sm">
            You are in no group for this festival. Make one and share the invite link, or open a link a friend sent you.
          </p>
        )}

        {past ? (
          <p className="text-white/60 text-xs">This festival has ended, so you cannot make a group for it.</p>
        ) : groups.length >= MAX_GROUPS ? (
          <p className="text-white/60 text-xs">You are in {MAX_GROUPS} groups for this festival, the most you can be in.</p>
        ) : (
          <form onSubmit={handleCreate} className="bg-surface rounded-lg p-3 space-y-2">
            <label htmlFor="group-name" className="block text-white/80 text-xs">
              Make a group
            </label>
            <div className="flex gap-2">
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Group name"
                className="min-w-0 flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <button
                type="submit"
                disabled={creating}
                className="flex items-center px-3 py-2 bg-white text-page rounded-md font-medium hover:bg-white/90 disabled:opacity-50 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {creating ? 'Making...' : 'Make'}
              </button>
            </div>
            {createError && <p className="text-red-400 text-xs">{createError}</p>}
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <Link to={`/festival/${slug}`} className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white">Groups</h1>
          {festival && <p className="text-white/60 text-xs">{festival.name}</p>}
        </div>
        {renderBody()}
      </main>
    </div>
  )
}

export default GroupsPage
