import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, Eye, Star, Bookmark } from 'lucide-react'
import { getPosterUrl, formatYear } from '../../utils/helpers'
import RatingBadge from './RatingBadge'
import WatchlistButton from './WatchlistButton'

/**
 * MovieCard component
 * Displays a movie poster card with hover overlay, rating badge, year, and watchlist actions.
 *
 * @param {Object} props
 * @param {Object} props.movie - TMDB Movie object
 * @param {boolean} [props.showRating=true] - Whether to show the rating badge
 * @param {boolean} [props.showType=false] - Whether to show the 'Movie' type badge
 * @param {'sm'|'md'|'lg'|'full'} [props.size='md'] - Card width sizing
 * @param {string} [props.className=''] - Additional custom CSS
 */
const MovieCard = ({
  movie,
  showRating = true,
  showType = false,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (!movie) return null

  const movieId = movie.id || movie.tmdbId || movie._id
  const title = movie.title || movie.name || movie.original_title || 'Untitled Movie'
  const releaseYear = formatYear(movie.release_date || movie.releaseDate || movie.first_air_date)
  const posterPath = movie.poster_path || movie.posterPath
  const voteAverage = movie.vote_average ?? movie.voteAverage

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
        to={`/movie/${movieId}`}
        className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-cs-card border border-cs-border hover:border-cs-accent/40 shadow-cs hover:shadow-cs-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cs-accent/50"
        aria-label={`View details for ${title}`}
      >
        {/* Poster Image or Placeholder */}
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
              <Film size={22} className="text-cs-text-secondary group-hover:text-cs-accent transition-colors" />
            </div>
            <p className="text-xs font-semibold text-cs-text line-clamp-2 px-1">
              {title}
            </p>
            <span className="text-[10px] text-cs-text-secondary mt-1">
              {releaseYear || 'Movie'}
            </span>
          </div>
        )}

        {/* Top Badges (Rating & Type) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between pointer-events-none z-10 gap-1.5">
          {showRating && voteAverage !== undefined && voteAverage !== null ? (
            <RatingBadge rating={voteAverage} size="xs" />
          ) : <div />}

          <div className="flex items-center gap-1">
            {showType && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-cs-accent backdrop-blur-md">
                Movie
              </span>
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 bg-gradient-to-t from-cs-bg/95 via-cs-bg/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top action row inside hover */}
          <div className="flex justify-end pointer-events-auto">
            <WatchlistButton
              tmdbId={movieId}
              mediaType="movie"
              movieData={movie}
              size="sm"
            />
          </div>

          {/* Bottom hover details */}
          <div className="space-y-2 pointer-events-none">
            {/* View Details Button simulation */}
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
          to={`/movie/${movieId}`}
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
          <span>{releaseYear || '—'}</span>
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

export default MovieCard
