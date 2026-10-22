import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Star, Trash2, Check, AlertCircle, LogIn, Loader2, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { submitRating, getMyRating, deleteRating } from '../../services/movieService'

const RATING_LABELS = {
  1: '1 - Appalling',
  2: '2 - Horrible',
  3: '3 - Very Bad',
  4: '4 - Bad',
  5: '5 - Average',
  6: '6 - Fine',
  7: '7 - Good',
  8: '8 - Very Good',
  9: '9 - Great',
  10: '10 - Masterpiece',
}

/**
 * RatingInput component
 * Allows authenticated users to rate a movie or TV show on a 1-10 scale
 * Shows interactive hover preview, current rating, submit and delete buttons.
 *
 * @param {Object} props
 * @param {number|string} props.tmdbId - TMDB ID of the title
 * @param {'movie'|'tv'} [props.mediaType='movie'] - Media type
 * @param {number|Object} [props.initialRating] - Pre-fetched rating value or object
 * @param {Function} [props.onRated] - Callback when rating is saved or removed: (ratingObj, communityStats) => void
 * @param {string} [props.className=''] - Additional custom classes
 */
const RatingInput = ({
  tmdbId,
  mediaType = 'movie',
  initialRating = null,
  onRated,
  className = '',
}) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // State
  const [selectedRating, setSelectedRating] = useState(0)
  const [savedRating, setSavedRating] = useState(0)
  const [ratingId, setRatingId] = useState(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Initialize or fetch user's rating
  const loadUserRating = useCallback(async () => {
    if (!isAuthenticated || !tmdbId) {
      setSavedRating(0)
      setSelectedRating(0)
      setRatingId(null)
      return
    }

    // Check if initialRating is already provided
    if (initialRating) {
      if (typeof initialRating === 'object') {
        const val = initialRating.rating || 0
        setSavedRating(val)
        setSelectedRating(val)
        setRatingId(initialRating._id || null)
        return
      } else if (typeof initialRating === 'number') {
        setSavedRating(initialRating)
        setSelectedRating(initialRating)
      }
    }

    try {
      setLoading(true)
      const res = await getMyRating(mediaType, tmdbId)
      const userRatingObj = res.data?.rating
      if (userRatingObj) {
        setSavedRating(userRatingObj.rating)
        setSelectedRating(userRatingObj.rating)
        setRatingId(userRatingObj._id)
      } else {
        setSavedRating(0)
        setSelectedRating(0)
        setRatingId(null)
      }
    } catch {
      // Ignore initial fetch errors silently
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, tmdbId, mediaType, initialRating])

  useEffect(() => {
    loadUserRating()
  }, [loadUserRating])

  // Handle rating submission
  const handleSubmit = async () => {
    if (!selectedRating || selectedRating < 1 || selectedRating > 10) {
      toast.error('Please select a rating between 1 and 10')
      return
    }

    try {
      setSubmitting(true)
      const res = await submitRating({
        tmdbId: Number(tmdbId),
        mediaType,
        rating: selectedRating,
      })

      const savedObj = res.data?.rating
      const communityStats = res.data?.communityStats

      setSavedRating(selectedRating)
      if (savedObj?._id) {
        setRatingId(savedObj._id)
      }

      toast.success(
        savedRating > 0
          ? `Rating updated to ${selectedRating}/10!`
          : `Rated ${selectedRating}/10! Thanks for rating.`
      )

      if (onRated) {
        onRated(savedObj, communityStats)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle rating deletion
  const handleDelete = async () => {
    if (!ratingId && !savedRating) return

    try {
      setDeleting(true)
      let stats = null
      if (ratingId) {
        const res = await deleteRating(ratingId)
        stats = res.data?.communityStats
      }
      setSavedRating(0)
      setSelectedRating(0)
      setRatingId(null)
      setHoverRating(0)

      toast.success('Your rating has been removed')

      if (onRated) {
        onRated(null, stats)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete rating')
    } finally {
      setDeleting(false)
    }
  }

  // Guest view - Sign in prompt
  if (!isAuthenticated) {
    return (
      <div
        className={`bg-cs-card/80 border border-cs-border rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-cs ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cs-accent/10 border border-cs-accent/20 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-cs-accent" />
            </div>
            <div>
              <h4 className="text-cs-text font-semibold text-base">Rate this title</h4>
              <p className="text-cs-text-secondary text-sm">
                Sign in to CineScope to log your rating and get personal recommendations.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cs-accent hover:bg-yellow-400 text-black font-semibold text-sm transition-all duration-200 shadow-cs-accent/30 shadow-md shrink-0 active:scale-95"
          >
            <LogIn size={16} />
            Sign In to Rate
          </Link>
        </div>
      </div>
    )
  }

  const activeRating = hoverRating || selectedRating
  const isChanged = selectedRating !== savedRating && selectedRating > 0
  const canSubmit = selectedRating > 0 && (isChanged || savedRating === 0)

  return (
    <div
      className={`bg-cs-card border border-cs-border rounded-2xl p-5 md:p-6 shadow-cs relative overflow-hidden ${className}`}
    >
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-cs-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cs-accent/10 border border-cs-accent/20 flex items-center justify-center text-cs-accent">
            <Award size={18} />
          </div>
          <div>
            <h4 className="text-cs-text font-semibold text-base leading-tight">Your Rating</h4>
            <p className="text-xs text-cs-text-secondary">Rate out of 10 stars</p>
          </div>
        </div>

        {/* Current status pill */}
        {savedRating > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-cs-accent/30 text-cs-accent text-xs font-semibold">
            <Star size={13} className="fill-cs-accent text-cs-accent" />
            <span>Rated {savedRating}/10</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-cs-text-secondary gap-2 text-sm">
          <Loader2 size={18} className="animate-spin text-cs-accent" />
          Loading your rating...
        </div>
      ) : (
        <>
          {/* Star selector container */}
          <div className="flex flex-col items-center sm:items-start gap-3 my-2">
            <div
              className="flex items-center gap-1 sm:gap-1.5 p-2 bg-cs-bg-secondary/70 border border-cs-border/60 rounded-xl"
              onMouseLeave={() => setHoverRating(0)}
              role="radiogroup"
              aria-label="Rating out of 10"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                const isLit = star <= (hoverRating || selectedRating)
                const isHovered = hoverRating > 0 && star <= hoverRating

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 sm:p-1.5 rounded-lg transition-all duration-150 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-cs-accent/50 active:scale-95"
                    aria-label={`Rate ${star} out of 10`}
                    aria-checked={selectedRating === star}
                    role="radio"
                  >
                    <Star
                      size={22}
                      className={`transition-colors duration-150 ${
                        isLit
                          ? 'fill-cs-accent text-cs-accent drop-shadow-[0_0_6px_rgba(245,197,24,0.4)]'
                          : 'text-cs-border hover:text-cs-text-secondary fill-transparent'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            {/* Hover / selected label feedback */}
            <div className="h-6 flex items-center">
              {activeRating > 0 ? (
                <span className="text-sm font-medium text-cs-accent flex items-center gap-1.5 animate-fade-in">
                  <Star size={14} className="fill-cs-accent" />
                  {RATING_LABELS[activeRating]}
                </span>
              ) : (
                <span className="text-xs text-cs-text-secondary">
                  Hover or click a star to rate
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cs-border/60 mt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || deleting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  canSubmit && !submitting && !deleting
                    ? 'bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md active:scale-95'
                    : 'bg-cs-bg-secondary text-cs-text-secondary/50 border border-cs-border/40 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {savedRating > 0 ? 'Update Rating' : 'Submit Rating'}
                  </>
                )}
              </button>

              {/* Reset selection if changed but not submitted */}
              {isChanged && savedRating > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedRating(savedRating)}
                  disabled={submitting || deleting}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-cs-text-secondary hover:text-cs-text transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Delete button (only when user has saved rating) */}
            {savedRating > 0 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-cs-error/80 hover:text-cs-error hover:bg-cs-error/10 border border-transparent hover:border-cs-error/20 transition-all duration-150 disabled:opacity-50 active:scale-95"
                title="Remove your rating"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>Remove Rating</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default RatingInput
