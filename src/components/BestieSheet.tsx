import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, HeartHandshake } from 'lucide-react'
import type { Act } from '../hooks/useFestivalData'
import type { MyGroup } from '../hooks/useGroups'
import { useFestivalRatings } from '../hooks/useGroups'
import {
  EXPLANATION,
  NO_MEMBERS,
  NOT_ENOUGH,
  RATE_MORE,
  coMembers,
  formatScore,
  hasEnoughRatings,
  matchDetail,
  matchList,
} from '../utils/bestie'
import type { Match, Ratings } from '../utils/bestie'
import { formatTime } from '../utils/scheduleUtils'
import Sheet from './Sheet'

interface BestieSheetProps {
  festivalId: string
  acts: Act[]
  // The ratings of the user from the page, so a rating just given counts at once.
  myRatings: Ratings
  myId: string
  groups: MyGroup[]
  onClose: () => void
}

const ActList = ({ acts, mine, theirs, username }: { acts: Act[]; mine: Ratings; theirs: Ratings; username: string }) => (
  <ul className="space-y-1.5">
    {acts.map((act) => (
      <li key={act.id} className="bg-white/5 rounded-md px-2.5 py-1.5">
        <div className="text-white text-sm font-medium">{act.artist}</div>
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-white/60">
            {[act.day, act.startTime && formatTime(act.startTime)].filter(Boolean).join(' ')}
          </span>
          <span className="text-rating">
            You ★{mine[act.id]} · {username} ★{theirs[act.id]}
          </span>
        </div>
      </li>
    ))}
  </ul>
)

// The bestie scores of the user for one festival (bestie FR-5 to FR-14).
const BestieSheet = ({ festivalId, acts, myRatings, myId, groups, onClose }: BestieSheetProps) => {
  const actIds = useMemo(() => new Set(acts.map((act) => act.id)), [acts])
  const { ratings, loading, error } = useFestivalRatings(festivalId, actIds)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const members = useMemo(() => coMembers(groups, myId), [groups, myId])
  const mine = useMemo(() => {
    const result: Ratings = {}
    for (const [actId, rating] of Object.entries(myRatings)) if (actIds.has(actId)) result[actId] = rating
    return result
  }, [myRatings, actIds])
  const matches = useMemo(() => matchList(mine, members, ratings), [mine, members, ratings])
  const iHaveEnough = hasEnoughRatings(mine)
  const selected = matches.find((match) => match.userId === selectedId) ?? null

  const header = selected ? (
    <div className="flex items-center gap-1 pt-1">
      <button
        type="button"
        onClick={() => setSelectedId(null)}
        aria-label="Back to the bestie scores"
        className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h3 id="bestie-sheet-title" className="text-lg font-bold text-white">
        {selected.username}
        {selected.score !== null && <span className="ml-2 text-white/70 font-normal">{formatScore(selected.score)}</span>}
      </h3>
    </div>
  ) : (
    <h3 id="bestie-sheet-title" className="flex items-center text-lg font-bold text-white pt-1.5">
      <HeartHandshake className="h-5 w-5 mr-2" />
      Bestie Scores
    </h3>
  )

  const renderDetail = (match: Match) => {
    const theirs = ratings[match.userId] ?? {}
    const { shared, clashes } = matchDetail(acts, mine, theirs)
    return (
      <div className="space-y-4">
        <section>
          <h4 className="text-white/70 text-xs font-medium mb-1.5">Dancing together at</h4>
          {shared.length ? (
            <ActList acts={shared} mine={mine} theirs={theirs} username={match.username} />
          ) : (
            <p className="text-white/60 text-sm">No shared acts yet.</p>
          )}
        </section>
        <section>
          <h4 className="text-white/70 text-xs font-medium mb-1.5">Probably won't see them at</h4>
          {clashes.length ? (
            <ActList acts={clashes} mine={mine} theirs={theirs} username={match.username} />
          ) : (
            <p className="text-white/60 text-sm">No clashes.</p>
          )}
        </section>
      </div>
    )
  }

  const renderList = () => {
    if (members.length === 0) return <p className="text-white/70 text-sm">{NO_MEMBERS}</p>
    if (loading) return <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-white" />
    if (error) return <p className="text-red-400 text-sm">Could not load the ratings: {error}</p>
    return (
      <>
        {!iHaveEnough && <p className="text-white/80 text-sm mb-2">{RATE_MORE}</p>}
        <ul className="space-y-1.5">
          {matches.map((match) => (
            <li key={match.userId}>
              <button
                type="button"
                onClick={() => setSelectedId(match.userId)}
                className="flex w-full items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-left hover:bg-white/20 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-white text-sm font-medium">{match.username}</div>
                  <div className="truncate text-white/60 text-xs">{match.groupNames.join(' · ')}</div>
                </div>
                <div className="shrink-0 text-right">
                  {match.score !== null ? (
                    <div className="text-white text-sm font-semibold">{formatScore(match.score)}</div>
                  ) : (
                    iHaveEnough && <div className="text-white/60 text-xs">{NOT_ENOUGH}</div>
                  )}
                  <div className="text-white/60 text-xs">{match.sharedCount} shared</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/50" />
              </button>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <Sheet titleId="bestie-sheet-title" header={header} onClose={onClose}>
      {selected ? (
        renderDetail(selected)
      ) : (
        <>
          <p className="text-white/70 text-xs mb-3">{EXPLANATION}</p>
          {renderList()}
        </>
      )}
    </Sheet>
  )
}

export default BestieSheet
