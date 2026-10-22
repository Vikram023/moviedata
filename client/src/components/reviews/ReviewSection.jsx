import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MessageSquare,
  PenSquare,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Star,
  Users,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
  getReviews,
  deleteReview,
  markReviewHelpful,
  removeReviewHelpful,
  getCommunityRating,
} from '../../services/movieService'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import RatingDistribution from '../ratings/RatingDistribution'
import RatingInput from '../ratings/RatingInput'
import { formatNumber, formatRating } from '../../utils/helpers'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
]

/**
 * ReviewSection component
 * Full review section for a movie/tv details page.
 *
 * @param {Object} props
 * @param {number|string} props.tmdbId - TMDB ID of the title
 * @param {'movie'|'tv'} [props.mediaType='movie'] - Media type
 * @param {string} [props.className=''] - Additional CSS classes
 */
const ReviewSection = ({
  tmdbId,
  mediaType = 'movie',
  className = '',
}) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const reviewsContainerRef = useRef(null)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('recent')
  const [loading, setLoading] = useState(true)

  // Community rating state
  const [communityRating, setCommunityRating] = useState({
    average: null,
    count: 0,
    distribution: {},
  })
  const [showFullDistribution, setShowFullDistribution] = useState(false)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  // Fetch community rating summary
  const fetchCommunityRating = useCallback(async () => {
    if (!tmdbId) return
    try {
      const res = await getCommunityRating(mediaType, tmdbId)
      if (res.data) {
        setCommunityRating(res.data)
      }
    } catch {
      // Non-critical, ignore
    }
  }, [mediaType, tmdbId])

  // Fetch reviews list
  const fetchReviews = useCallback(
    async (currentPage = 1, currentSort = sort) => {
      if (!tmdbId) return
      try {
        setLoading(true)
        const res = await getReviews(mediaType, tmdbId, {
          sort: currentSort,
          page: currentPage,
          limit: 10,
        })

        const newReviews = res.data?.reviews || []
        const totalCount = res.data?.total || 0
        const pages = res.data?.totalPages || 1

        setReviews(newReviews)
        setTotal(totalCount)
        setTotalPages(pages)
        setPage(currentPage)
      } catch (err) {
        toast.error(err.message || 'Failed to load reviews')
      } finally {
        setLoading(false)
      }
    },
    [tmdbId, mediaType, sort]
  )

  useEffect(() => {
    fetchCommunityRating()
  }, [fetchCommunityRating])

  useEffect(() => {
    fetchReviews(1, sort)
  }, [fetchReviews, sort])

  // Sort dropdown change
  const handleSortChange = (e) => {
    const newSort = e.target.value
    setSort(newSort)
    setPage(1)
  }

  // Helpful vote toggle
  const handleHelpful = async (reviewId, willBeHelpful) => {
    try {
      if (willBeHelpful) {
        const res = await markReviewHelpful(reviewId)
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  isHelpfulByUser: true,
                  helpfulCount: res.data?.helpfulCount ?? r.helpfulCount + 1,
                }
              : r
          )
        )
      } else {
        const res = await removeReviewHelpful(reviewId)
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  isHelpfulByUser: false,
                  helpfulCount: res.data?.helpfulCount ?? Math.max(0, r.helpfulCount - 1),
                }
              : r
          )
        )
      }
    } catch (err) {
      throw err
    }
  }

  // Delete review
  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      toast.success('Review deleted')
      setReviews((prev) => prev.filter((r) => r._id !== reviewId))
      setTotal((prev) => Math.max(0, prev - 1))
      if (editingReview?._id === reviewId) {
        setEditingReview(null)
        setShowForm(false)
      }
      fetchCommunityRating()
    } catch (err) {
      throw err
    }
  }

  // Edit review
  const handleEdit = (review) => {
    setEditingReview(review)
    setShowForm(true)
    reviewsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Review saved from form
  const handleReviewSaved = (savedReview) => {
    if (!savedReview) return
    if (editingReview) {
      setReviews((prev) =>
        prev.map((r) => (r._id === savedReview._id ? savedReview : r))
      )
      setEditingReview(null)
    } else {
      if (page === 1) {
        setReviews((prev) => [savedReview, ...prev])
        setTotal((prev) => prev + 1)
      } else {
        setPage(1)
        fetchReviews(1, sort)
      }
    }
    setShowForm(false)
    fetchCommunityRating()
  }

  // Pagination navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return
    setPage(newPage)
    fetchReviews(newPage, sort)
    reviewsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // User's own existing review
  const userExistingReview = reviews.find(
    (r) =>
      user?._id &&
      (String(r.userId?._id) === String(user._id) || String(r.userId) === String(user._id))
  )

  const hasCommunityScore = communityRating.count > 0 && communityRating.average !== null

  return (
    <section
      ref={reviewsContainerRef}
      className={`relative space-y-8 ${className}`}
      aria-label="Ratings and Reviews Section"
    >
      {/* ─── Community Rating Summary Card ─── */}
      <div className="bg-cs-card border border-cs-border rounded-2xl p-5 md:p-6 shadow-cs overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Summary score & info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-yellow-500/10 border border-cs-accent/30 flex flex-col items-center justify-center shrink-0 text-cs-accent shadow-cs-accent/10 shadow-md">
              <Star size={24} className="fill-cs-accent mb-0.5" />
              <span className="text-xl sm:text-2xl font-black leading-none text-cs-text">
                {hasCommunityScore ? formatRating(communityRating.average) : '—'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-cs-text tracking-tight">
                  CineScope Community Rating
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-cs-text-secondary mt-1">
                {hasCommunityScore
                  ? `Average score based on ${formatNumber(communityRating.count)} audience ratings and ${formatNumber(total)} written reviews.`
                  : 'No community ratings recorded yet. Be the first to rate and review!'}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowFullDistribution((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-cs-accent hover:text-yellow-400 transition-colors"
                >
                  <BarChart3 size={14} />
                  <span>{showFullDistribution ? 'Hide Score Breakdown' : 'View Rating Breakdown'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Write Review / Rate action */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  if (userExistingReview && !showForm) {
                    setEditingReview(userExistingReview)
                  } else if (!showForm) {
                    setEditingReview(null)
                  }
                  setShowForm((prev) => !prev)
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md transition-all duration-150 active:scale-95"
              >
                <PenSquare size={16} />
                <span>
                  {showForm
                    ? 'Close Form'
                    : userExistingReview
                    ? 'Edit Your Review'
                    : 'Write a Review'}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: location }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md transition-all duration-150 active:scale-95"
              >
                <LogIn size={16} />
                <span>Sign In to Review</span>
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Rating Distribution Bar Chart */}
        {showFullDistribution && (
          <div className="mt-6 pt-6 border-t border-cs-border/60 animate-slide-down">
            <RatingDistribution
              distribution={communityRating.distribution}
              average={communityRating.average}
              count={communityRating.count}
            />
          </div>
        )}
      </div>

      {/* ─── Quick Rating Input for current user ─── */}
      <RatingInput
        tmdbId={tmdbId}
        mediaType={mediaType}
        onRated={() => fetchCommunityRating()}
      />

      {/* ─── Review Form at Top if Authenticated ─── */}
      {showForm && isAuthenticated && (
        <div className="animate-slide-down">
          <ReviewForm
            tmdbId={tmdbId}
            mediaType={mediaType}
            existingReview={editingReview}
            onSubmit={handleReviewSaved}
            onCancel={() => {
              setShowForm(false)
              setEditingReview(null)
            }}
          />
        </div>
      )}

      {/* ─── Header & Sort Dropdown ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-cs-accent" />
          <h3 className="text-lg sm:text-xl font-bold text-cs-text tracking-tight">
            User Reviews
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cs-bg-secondary text-cs-accent border border-cs-border">
            {total}
          </span>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="review-sort" className="text-xs text-cs-text-secondary flex items-center gap-1 font-medium">
            <ArrowUpDown size={13} />
            Sort by:
          </label>
          <select
            id="review-sort"
            value={sort}
            onChange={handleSortChange}
            className="bg-cs-card border border-cs-border text-cs-text text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cs-accent cursor-pointer transition-colors shadow-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-cs-card text-cs-text">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Reviews List ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-cs-text-secondary">
          <Loader2 size={32} className="animate-spin text-cs-accent" />
          <p className="text-sm font-medium">Loading community reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="bg-cs-card border border-cs-border rounded-2xl p-8 sm:p-12 text-center shadow-cs">
          <div className="w-14 h-14 rounded-2xl bg-cs-bg-secondary border border-cs-border/80 flex items-center justify-center mx-auto mb-4 text-cs-accent">
            <MessageSquare size={26} />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-cs-text">
            No reviews yet
          </h4>
          <p className="text-xs sm:text-sm text-cs-text-secondary max-w-md mx-auto mt-1.5 mb-6">
            There are no written reviews for this title yet. Be the first to share your thoughts with the community!
          </p>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setEditingReview(null)
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md transition-all duration-150 active:scale-95"
            >
              <PenSquare size={15} />
              <span>Write the First Review</span>
            </button>
          ) : (
            <Link
              to="/login"
              state={{ from: location }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md transition-all duration-150 active:scale-95"
            >
              <LogIn size={15} />
              <span>Sign in to write a review</span>
            </Link>
          )}
        </div>
      ) : (
        /* Reviews List */
        <div className="space-y-4">
          {reviews.map((rev) => (
            <ReviewCard
              key={rev._id}
              review={rev}
              onHelpful={handleHelpful}
              onDelete={handleDelete}
              onEdit={handleEdit}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}

      {/* ─── Pagination Controls ─── */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-4 border-t border-cs-border/60 text-xs">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold bg-cs-card hover:bg-cs-bg-secondary text-cs-text border border-cs-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-cs-text-secondary font-medium">
            Page <span className="font-bold text-cs-text">{page}</span> of{' '}
            <span className="font-bold text-cs-text">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold bg-cs-card hover:bg-cs-bg-secondary text-cs-text border border-cs-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}

export default ReviewSection
