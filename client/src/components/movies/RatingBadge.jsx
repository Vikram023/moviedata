import React from 'react'
import { Star, Users } from 'lucide-react'
import { formatRating } from '../../utils/helpers'

/**
 * RatingBadge component
 * Displays a rating score with star icon and dynamic color coding:
 * - Green (>= 8.0)
 * - Yellow (>= 6.0)
 * - Red (< 6.0)
 *
 * @param {Object} props
 * @param {number|string} props.rating - Vote average or score (0-10)
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm'] - Size variant
 * @param {'tmdb'|'community'} [props.source='tmdb'] - Source of rating
 * @param {boolean} [props.showIcon=true] - Whether to show the star icon
 * @param {boolean} [props.showOutOf=false] - Whether to append '/10'
 * @param {string} [props.className=''] - Additional custom CSS classes
 */
const RatingBadge = ({
  rating,
  size = 'sm',
  source = 'tmdb',
  showIcon = true,
  showOutOf = false,
  className = '',
}) => {
  const numRating = typeof rating === 'number' ? rating : parseFloat(rating)
  const hasRating = !isNaN(numRating) && numRating > 0
  const formatted = hasRating ? formatRating(numRating) : 'N/A'

  // Color coding logic based on rating value
  const getColorStyles = () => {
    if (!hasRating) {
      return {
        text: 'text-cs-text-secondary',
        bg: 'bg-cs-bg-secondary/80 border-cs-border',
        starFill: '#A1A8B5',
      }
    }
    if (numRating >= 8) {
      return {
        text: 'text-cs-success',
        bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
        starFill: '#22C55E',
      }
    }
    if (numRating >= 6) {
      return {
        text: 'text-cs-accent',
        bg: 'bg-yellow-950/40 border-yellow-500/30 text-cs-accent',
        starFill: '#F5C518',
      }
    }
    return {
      text: 'text-cs-error',
      bg: 'bg-rose-950/40 border-rose-500/30 text-rose-400',
      starFill: '#EF4444',
    }
  }

  const { text, bg, starFill } = getColorStyles()

  // Sizing definitions
  const sizeStyles = {
    xs: {
      container: 'text-[10px] px-1.5 py-0.5 gap-1',
      iconSize: 10,
    },
    sm: {
      container: 'text-xs px-2 py-0.5 gap-1.5',
      iconSize: 12,
    },
    md: {
      container: 'text-sm px-2.5 py-1 gap-1.5',
      iconSize: 14,
    },
    lg: {
      container: 'text-base font-semibold px-3 py-1.5 gap-2',
      iconSize: 16,
    },
  }

  const currentSize = sizeStyles[size] || sizeStyles.sm

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md backdrop-blur-md border shadow-sm transition-all duration-200 select-none ${bg} ${currentSize.container} ${className}`}
      title={
        hasRating
          ? `${source === 'community' ? 'Community Rating' : 'TMDB Rating'}: ${formatted}/10`
          : 'Not yet rated'
      }
    >
      {showIcon && (
        <span className="flex items-center justify-center shrink-0">
          {source === 'community' ? (
            <Users
              size={currentSize.iconSize}
              className="text-cyan-400"
              aria-hidden="true"
            />
          ) : (
            <Star
              size={currentSize.iconSize}
              fill={starFill}
              color={starFill}
              aria-hidden="true"
            />
          )}
        </span>
      )}
      <span className={`tracking-tight font-semibold ${text}`}>
        {formatted}
        {showOutOf && hasRating && (
          <span className="text-[0.75em] text-cs-text-secondary font-normal ml-0.5 opacity-80">
            /10
          </span>
        )}
      </span>
      {source === 'community' && (
        <span className="text-[9px] uppercase tracking-wider text-cyan-400/80 font-medium ml-0.5">
          Users
        </span>
      )}
    </span>
  )
}

export default RatingBadge
