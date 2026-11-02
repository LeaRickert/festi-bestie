import { useState } from 'react'
import { Star } from 'lucide-react'
import { ratingLabel } from '../utils/ratingStyle'

const STARS = [1, 2, 3, 4, 5]

interface StarRatingProps {
  rating?: number
  onRatingChange: (rating: number) => void
  interactive?: boolean
  showValue?: boolean
}

const StarRating = ({
  rating = 0,
  onRatingChange,
  interactive = true,
  showValue = true
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const currentRating = isHovering ? hoverRating : rating

  const handleStarClick = (starValue: number) => {
    if (!interactive) return
    // A tap also counts as hover on a phone; drop it so the saved rating shows.
    setIsHovering(false)
    onRatingChange(starValue)
  }

  const handleStarHover = (starValue: number) => {
    if (!interactive) return
    setHoverRating(starValue)
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(0)
    setIsHovering(false)
  }

  const getStarFill = (star: number) =>
    currentRating >= star ? 'fill-rating text-rating' : 'fill-transparent text-white/30'

  return (
    <div className="flex flex-col items-start space-y-1">
      <fieldset
        aria-label="Rating"
        className={`flex items-center -ml-1.5 ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {STARS.map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            aria-label={`${star} star${star === 1 ? '' : 's'}: ${ratingLabel(star)}`}
            // Each star is a 44 by 44 px tap target (ratings FR-9).
            className={`flex h-11 w-11 items-center justify-center transition-transform duration-150 ${
              interactive ? 'hover:scale-110 active:scale-95' : ''
            }`}
            disabled={!interactive}
          >
            <Star
              className={`h-8 w-8 ${getStarFill(star)} transition-colors duration-150`}
            />
          </button>
        ))}
      </fieldset>

      {showValue && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-white/80 font-medium">
            {currentRating}/5
          </span>
          <span className="text-white/60">
            {ratingLabel(currentRating)}
          </span>
        </div>
      )}
    </div>
  )
}

export default StarRating
