import React from 'react'
import { Bookmark, Check, Loader2 } from 'lucide-react'
import { useWatchlist } from '../../hooks/useWatchlist'

/**
 * WatchlistButton component
 * Toggles a movie or TV show into/out of the user's watchlist.
 *
 * @param {Object} props
 * @param {number|string} props.tmdbId - TMDB ID of the media
 * @param {'movie'|'tv'} [props.mediaType='movie'] - Media type
 * @param {Object} [props.movieData={}] - Movie/show metadata (title, poster_path, etc.)
 * @param {'icon'|'button'|'compact'} [props.variant='icon'] - Visual layout variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {string} [props.className=''] - Additional custom CSS
 */
const WatchlistButton = ({
  tmdbId,
  mediaType = 'movie',
  movieData = {},
  variant = 'icon',
  size = 'md',
  className = '',
}) => {
  const { inWatchlist, loading, checking, toggle } = useWatchlist(tmdbId, mediaType)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading || checking) return

    // Standardize data payload for the backend watchlist endpoint
    const payload = {
      title: movieData?.title || movieData?.name || '',
      posterPath: movieData?.poster_path || movieData?.posterPath || '',
      backdropPath: movieData?.backdrop_path || movieData?.backdropPath || '',
      releaseDate:
        movieData?.release_date ||
        movieData?.first_air_date ||
        movieData?.releaseDate ||
        '',
      voteAverage: movieData?.vote_average ?? movieData?.voteAverage ?? 0,
      overview: movieData?.overview || '',
      ...movieData,
    }

    toggle(payload)
  }

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }

  const iconSize = iconSizes[size] || iconSizes.md

  // Full button variant (icon + text)
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={`group relative inline-flex items-center justify-center gap-2.5 font-medium rounded-lg px-4 py-2.5 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
          inWatchlist
            ? 'bg-cs-accent/15 border border-cs-accent text-cs-accent hover:bg-cs-accent/25 shadow-cs-accent'
            : 'bg-cs-card/90 border border-cs-border text-cs-text hover:text-cs-accent hover:border-cs-accent/50 hover:bg-cs-bg-secondary'
        } ${className}`}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin text-cs-accent" />
        ) : inWatchlist ? (
          <Check size={iconSize} className="text-cs-accent stroke-[2.5]" />
        ) : (
          <Bookmark
            size={iconSize}
            className="transition-transform group-hover:scale-110"
          />
        )}
        <span className="text-sm font-semibold">
          {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </span>
      </button>
    )
  }

  // Compact variant (smaller badge-like button)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-md transition-all duration-200 active:scale-95 ${
          inWatchlist
            ? 'bg-cs-accent/20 border-cs-accent text-cs-accent'
            : 'bg-black/50 border-white/10 text-cs-text-secondary hover:text-white hover:border-white/30'
        } ${className}`}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin text-cs-accent" />
        ) : (
          <Bookmark
            size={12}
            className={inWatchlist ? 'fill-cs-accent text-cs-accent' : ''}
          />
        )}
        <span>{inWatchlist ? 'Saved' : 'Save'}</span>
      </button>
    )
  }

  // Default 'icon' variant (circular/square icon button)
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={inWatchlist ? 'In Watchlist (Click to remove)' : 'Add to Watchlist'}
      aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      className={`group relative flex items-center justify-center rounded-full backdrop-blur-md border transition-all duration-200 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed ${currentSizeClass} ${
        inWatchlist
          ? 'bg-cs-accent text-cs-bg border-cs-accent shadow-cs-accent hover:brightness-110'
          : 'bg-black/60 border-white/15 text-white/90 hover:bg-black/80 hover:text-cs-accent hover:border-cs-accent/60 hover:scale-105'
      } ${className}`}
    >
      {loading ? (
        <Loader2
          size={iconSize}
          className={`animate-spin ${inWatchlist ? 'text-cs-bg' : 'text-cs-accent'}`}
        />
      ) : inWatchlist ? (
        <Bookmark
          size={iconSize}
          className="fill-cs-bg text-cs-bg stroke-[2.5]"
        />
      ) : (
        <Bookmark
          size={iconSize}
          className="transition-transform group-hover:scale-110 stroke-[2]"
        />
      )}
    </button>
  )
}

export default WatchlistButton
