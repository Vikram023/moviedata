import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tv, Eye, Star, Bookmark } from 'lucide-react'
import { getPosterUrl, formatYear } from '../../utils/helpers'
import RatingBadge from './RatingBadge'
import WatchlistButton from './WatchlistButton'

/**
 * TVShowCard component
 * Displays a TV show poster card with hover overlay, rating badge, air year, and watchlist actions.
 *
 * @param {Object} props
 * @param {Object} props.tv - TMDB TV Show object (or show/item)
 * @param {boolean} [props.showRating=true] - Whether to show the rating badge
 * @param {boolean} [props.showType=true] - Whether to show the 'TV' badge
 * @param {'sm'|'md'|'lg'|'full'} [props.size='md'] - Card width sizing
 * @param {string} [props.className=''] - Additional custom CSS
 */
const TVShowCard = ({
  tv,
  showRating = true,
  showType = true,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (!tv) return null

  const showId = tv.id || tv.tmdbId || tv._id
  const title = tv.name || tv.title || tv.original_name || 'Untitled Show'
  const firstAirYear = formatYear(tv.first_air_date || tv.release_date || tv.releaseDate)
  const posterPath = tv.poster_path || tv.posterPath
  const voteAverage = tv.vote_average ?? tv.voteAverage

  // Sizing definitions
  const sizeClasses = {
    sm: 'w-[140px] sm:w-[155px]',
    md: 'w-[165px] sm:w-[190px]',
    lg: 'w-[210px] sm:w-[240px]',
    full: 'w-full',
  }

  const posterSizes = {
    sm: 'w185',
    md: 'w342',
    lg: 'w500',
    full: 'w500',
  }

  const containerWidth = sizeClasses[size] || sizeClasses.md
  const posterUrl = !imgError && posterPath ? getPosterUrl(posterPath, posterSizes[size] || 'w342') : null

  return (
    <div
      className={`group relative flex flex-col shrink-0 select-none transition-all duration-300 ${containerWidth} ${className}`}
    >
      <Link
        to={`/tv/${showId}`}
        className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-cs-card border border-cs-border hover:border-cs-accent/40 shadow-cs hover:shadow-cs-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cs-accent/50"
        aria-label={`View details for ${title}`}
      >
        {/* Poster Image or Fallback */}
        {posterUrl ? (
          <>
            {/* Shimmer placeholder before image loads */}
            {!isLoaded && (
              <div className="absolute inset-0 skeleton" aria-hidden="true" />
            )}
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                setImgError(true)
                setIsLoaded(true)
              }}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          /* Dark gradient placeholder when poster is missing or fails to load */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#181D29] via-[#121620] to-[#0B0D12] text-center border-b border-cs-border/40">
            <div className="w-12 h-12 rounded-full bg-cs-bg-secondary flex items-center justify-center mb-3 border border-cs-border/80 group-hover:border-cs-accent/50 transition-colors">
              <Tv size={22} className="text-cs-text-secondary group-hover:text-cs-accent transition-colors" />
            </div>
            <p className="text-xs font-semibold text-cs-text line-clamp-2 px-1">
              {title}
            </p>
            <span className="text-[10px] text-cs-text-secondary mt-1">
              {firstAirYear || 'TV Series'}
            </span>
          </div>
        )}

        {/* Top Badges (Rating & TV Type Badge) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between pointer-events-none z-10 gap-1.5">
          {showRating && voteAverage !== undefined && voteAverage !== null ? (
            <RatingBadge rating={voteAverage} size="xs" />
          ) : <div />}

          <div className="flex items-center gap-1">
            {showType && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-400 backdrop-blur-md shadow-sm">
                TV
              </span>
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 bg-gradient-to-t from-cs-bg/95 via-cs-bg/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top action row inside hover */}
          <div className="flex justify-end pointer-events-auto">
            <WatchlistButton
              tmdbId={showId}
              mediaType="tv"
              movieData={{ ...tv, media_type: 'tv' }}
              size="sm"
            />
          </div>

          {/* Bottom hover details */}
          <div className="space-y-2 pointer-events-none">
            {/* View Details Button */}
            <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cs-accent text-cs-bg font-semibold text-xs tracking-wide shadow-cs-accent group-hover:translate-y-0 translate-y-2 transition-transform duration-200 pointer-events-auto">
              <Eye size={14} className="stroke-[2.5]" />
              <span>View Details</span>
            </div>
          </div>
        </div>

        {/* Subtle bottom shadow vignette on card */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </Link>

      {/* Card Info Below Poster */}
      <div className="pt-2.5 px-0.5">
        <Link
          to={`/tv/${showId}`}
          className="block group/title focus:outline-none"
        >
          <h3
            title={title}
            className="text-sm font-semibold text-cs-text truncate group-hover/title:text-cs-accent transition-colors duration-150"
          >
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-xs text-cs-text-secondary mt-1">
          <span>{firstAirYear || '—'}</span>
          {showRating && voteAverage > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-cs-text-secondary sm:hidden">
              <Star size={10} className="fill-cs-accent text-cs-accent" />
              <span>{Math.round(voteAverage * 10) / 10}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TVShowCard
