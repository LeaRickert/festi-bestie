import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Copy, Crown, LogOut, Pencil, RefreshCw, Share2, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { posthog } from '../posthog.js'
import {
  deleteGroup,
  fetchGroup,
  fetchGroupMembers,
  leaveGroup,
  renameGroup,
  resetInviteLink,
  type GroupDetails,
  type MemberInfo,
} from '../hooks/useGroups'
import SignInPrompt from '../components/SignInPrompt'
import { isFestivalPast, localDateString } from '../utils/festivalUtils'
import { groupErrorMessage, inviteUrl, isValidGroupName } from '../utils/groups'

const SECONDARY_BUTTON =
  'flex items-center px-3 py-2 bg-white/10 text-white/80 rounded-md hover:bg-white/20 disabled:opacity-50 transition-colors text-sm'

// The members, the invite link, Leave, and Rename, Reset link and Delete for
// the owner (groups FR-3, FR-4, FR-9, FR-13, FR-17, FR-18, FR-20).
const GroupPage = () => {
  const { id = '', groupId = '' } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [group, setGroup] = useState<GroupDetails | null>(null)
  const [members, setMembers] = useState<MemberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')

  const userId = user?.id ?? null

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setLoadError('')
    try {
      const details = await fetchGroup(groupId)
      setGroup(details)
      setMembers(details ? await fetchGroupMembers(groupId) : [])
    } catch (err) {
      console.error('Error loading group:', err)
      setLoadError((err as { message?: string }).message ?? 'Could not load the group')
    } finally {
      setLoading(false)
    }
  }, [groupId, userId])

  useEffect(() => {
    load()
  }, [load])

  const isOwner = members.some((member) => member.userId === userId && member.isOwner)
  const past = group ? isFestivalPast(group.festivalEndDate, localDateString(new Date())) : false
  const link = group ? inviteUrl(window.location.origin, group.inviteToken) : ''

  // Runs one action and shows the error of the database, if any.
  const run = async (
    action: () => Promise<{ error: { message: string; code?: string } | null }>,
    event: 'group_renamed' | 'group_invite_reset' | 'group_deleted' | 'group_left',
    after?: () => void,
  ) => {
    setBusy(true)
    setActionError('')
    const { error } = await action()
    setBusy(false)
    if (error) {
      setActionError(groupErrorMessage(error))
      return
    }
    posthog?.capture(event, { festival_id: id, group_id: groupId })
    after?.()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      posthog?.capture('group_invite_copied', { festival_id: id, group_id: groupId })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setActionError('Could not copy the link. Select it and copy it instead.')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({ title: group?.name, text: `Join my group "${group?.name}" on Festi Bestie`, url: link })
      posthog?.capture('group_invite_shared', { festival_id: id, group_id: groupId })
    } catch {
      // The user closed the share sheet.
    }
  }

  const handleRename = (e: FormEvent) => {
    e.preventDefault()
    if (!isValidGroupName(newName)) {
      setActionError(groupErrorMessage({ code: '23514' }))
      return
    }
    run(
      () => renameGroup(groupId, newName),
      'group_renamed',
      () => {
        setRenaming(false)
        load()
      },
    )
  }

  const handleReset = () => {
    if (!window.confirm('Reset the invite link? The old link stops working.')) return
    run(
      async () => {
        const { error } = await resetInviteLink(groupId)
        return { error }
      },
      'group_invite_reset',
      load,
    )
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete "${group?.name}" for all members? This cannot be undone.`)) return
    run(() => deleteGroup(groupId), 'group_deleted', () => navigate(`/festival/${id}/groups`, { replace: true }))
  }

  const handleLeave = () => {
    if (!userId || !window.confirm(`Leave "${group?.name}"? The members stop seeing your ratings.`)) return
    run(() => leaveGroup(groupId, userId), 'group_left', () => navigate(`/festival/${id}/groups`, { replace: true }))
  }

  const renderBody = () => {
    if (authLoading || (user && loading)) return <div className="text-white/60 text-sm">Loading...</div>
    if (!user) return <SignInPrompt message="Sign in to see this group." />
    if (loadError) {
      return (
        <div className="space-y-2">
          <p className="text-red-400 text-sm">Could not load the group: {loadError}</p>
          <button type="button" onClick={load} className={SECONDARY_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    // RLS shows a group only to its members.
    if (!group) return <p className="text-white/60 text-sm">This group does not exist, or you are not a member.</p>

    return (
      <div className="space-y-4">
        <div>
          {renaming ? (
            <form onSubmit={handleRename} className="flex gap-2">
              <input
                type="text"
                aria-label="Group name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={60}
                className="min-w-0 flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <button type="submit" disabled={busy} className="px-3 py-1.5 bg-white text-page rounded-md font-medium hover:bg-white/90 disabled:opacity-50 text-sm">
                Save
              </button>
              <button type="button" onClick={() => setRenaming(false)} className="px-3 py-1.5 text-white/70 hover:text-white text-sm">
                Cancel
              </button>
            </form>
          ) : (
            <h1 className="text-xl font-bold text-white break-words">{group.name}</h1>
          )}
          <p className="text-white/60 text-xs">{group.festivalName}</p>
          {past && <p className="text-white/60 text-xs mt-1">This festival has ended. The group is read-only, and you can still see the ratings and leave.</p>}
        </div>

        {actionError && <p className="text-red-400 text-sm">{actionError}</p>}

        <section className="bg-surface rounded-lg p-3 space-y-2">
          <h2 className="text-white/80 text-xs">Invite link</h2>
          <p className="text-white/60 text-xs">Anyone with this link can join and see the ratings of the members for this festival.</p>
          <input
            type="text"
            readOnly
            aria-label="Invite link"
            value={link}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white/80 text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className={SECONDARY_BUTTON}>
              <Copy className="h-4 w-4 mr-1.5" />
              {copied ? 'Copied' : 'Copy link'}
            </button>
            {typeof navigator.share === 'function' && (
              <button type="button" onClick={handleShare} className={SECONDARY_BUTTON}>
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </button>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-white/80 text-xs">
            {members.length} member{members.length === 1 ? '' : 's'}
          </h2>
          <ul className="bg-surface rounded-lg divide-y divide-white/10">
            {members.map((member) => (
              <li key={member.userId} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-white truncate">
                  {member.username}
                  {member.userId === userId && <span className="text-white/50"> (you)</span>}
                </span>
                {member.isOwner && (
                  <span className="flex items-center text-white/60 text-xs">
                    <Crown className="h-3.5 w-3.5 mr-1" />
                    Owner
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-2">
          {isOwner && !past && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setNewName(group.name)
                  setRenaming(true)
                }}
                className={SECONDARY_BUTTON}
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Rename
              </button>
              <button type="button" disabled={busy} onClick={handleReset} className={SECONDARY_BUTTON}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Reset link
              </button>
            </>
          )}
          {isOwner && (
            <button type="button" disabled={busy} onClick={handleDelete} className={`${SECONDARY_BUTTON} text-red-300`}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </button>
          )}
          <button type="button" disabled={busy} onClick={handleLeave} className={SECONDARY_BUTTON}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Leave
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <Link to={`/festival/${id}/groups`} className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Groups
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4">{renderBody()}</main>
    </div>
  )
}

export default GroupPage
