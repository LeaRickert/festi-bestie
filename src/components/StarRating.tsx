import { useState } from 'react'
import { Star } from 'lucide-react'
import { ratingLabel } from '../utils/ratingStyle'

type StarSize = 'sm' | 'md' | 'lg' | 'xl'

interface StarRatingProps {
  rating?: number
  onRatingChange: (rating: number) => void
  size?: StarSize
  interactive?: boolean
  showValue?: boolean
}

const sizeClasses: Record<StarSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

const StarRating = ({
  rating = 0,
  onRatingChange,
  size = 'md',
  interactive = true,
  showValue = true
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const currentRating = isHovering ? hoverRating : rating

  const handleStarClick = (starValue: number) => {
    if (!interactive) return
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

  const getStarFill = (starIndex: number) =>
    currentRating >= starIndex + 1 ? 'fill-rating text-rating' : 'fill-transparent text-white/30'

  return (
    <div className="flex flex-col items-start space-y-2">
      <div
        className={`flex items-center space-x-1 ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => handleStarClick(index + 1)}
            onMouseEnter={() => handleStarHover(index + 1)}
            aria-label={`${index + 1} star${index === 0 ? '' : 's'}: ${ratingLabel(index + 1)}`}
            className={`transition-all duration-150 hover:scale-110 ${
              interactive ? 'hover:drop-shadow-lg' : ''
            }`}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClasses[size]} ${getStarFill(index)} transition-colors duration-150`}
            />
          </button>
        ))}
      </div>

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
