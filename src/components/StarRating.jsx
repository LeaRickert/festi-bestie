import { useState } from 'react'
import { Star } from 'lucide-react'

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  size = 'md',
  interactive = true,
  showValue = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const handleStarClick = (starValue) => {
    if (!interactive) return
    
    // If clicking the same star, toggle between full and half
    if (rating === starValue) {
      const newRating = rating === starValue ? starValue - 0.5 : starValue
      onRatingChange(Math.max(0, newRating))
    } else {
      onRatingChange(starValue)
    }
  }

  const handleStarHover = (starValue) => {
    if (!interactive) return
    setHoverRating(starValue)
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(0)
    setIsHovering(false)
  }

  const getStarFill = (starIndex) => {
    const currentRating = isHovering ? hoverRating : rating
    const starValue = starIndex + 1
    
    if (currentRating >= starValue) {
      return 'fill-festival-purple text-festival-purple' // Full star
    } else if (currentRating >= starValue - 0.5) {
      return 'fill-festival-purple/50 text-festival-purple' // Half star
    } else {
      return 'fill-transparent text-white/30' // Empty star
    }
  }

  const getRatingText = () => {
    const currentRating = isHovering ? hoverRating : rating
    if (currentRating === 0) return 'Not rated'
    if (currentRating <= 1) return 'Not for Me'
    if (currentRating <= 2) return 'Meh'
    if (currentRating <= 3) return 'Interested'
    if (currentRating <= 4) return 'Hyped'
    return 'Must See!!'
  }

  return (
    <div className="flex flex-col items-start space-y-2">
      <div 
        className={`flex items-center space-x-1 ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <button
            key={index}
            onClick={() => handleStarClick(index + 1)}
            onMouseEnter={() => handleStarHover(index + 1)}
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
            {isHovering ? hoverRating : rating}/5
          </span>
          <span className="text-white/60">
            {getRatingText()}
          </span>
        </div>
      )}
    </div>
  )
}

export default StarRating
