import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Star,
  ThumbsUp,
  Trash2,
  Edit3,
  Film,
  Tv,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Check,
  X,
  ExternalLink,
  Compass,
  Calendar,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getUserReviews,
  updateReview,
  deleteReview,
  getMovieDetails,
  getTVDetails,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import {
  getPosterUrl,
  formatDate,
  formatYear,
  formatRating,
  timeAgo,
} from '../utils/helpers'
import RatingBadge from '../components/movies/RatingBadge'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

const MyReviews = () => {
  const { user } = useAuth()
  const userId = user?._id || user?.id

  // State
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Sorting
  const [mediaFilter, setMediaFilter] = useState('all') // 'all' | 'movie' | 'tv'
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'

  // Inline editing state: reviewId -> { text, rating, containsSpoilers }
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    reviewText: '',
    rating: 10,
    containsSpoilers: false,
  })
  const [editSaving, setEditSaving] = useState(false)

  // Delete modal state
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch reviews & hydrate with movie/tv titles & posters
  const fetchReviews = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const res = await getUserReviews(userId)
      const reviewList = res.data?.reviews || res.reviews || []

      // Hydrate with movie/tv details (poster, title)
      const hydrated = await Promise.all(
        reviewList.map(async (rev) => {
          try {
            const itemRes =
              rev.mediaType === 'tv'
                ? await getTVDetails(rev.tmdbId)
                : await getMovieDetails(rev.tmdbId)
            const details = itemRes.data?.movie || itemRes.data?.tv || itemRes.data || itemRes
            return {
              ...rev,
              title: details.title || details.name || `Title #${rev.tmdbId}`,
              posterPath: details.poster_path,
              releaseDate: details.release_date || details.first_air_date,
            }
          } catch {
            return {
              ...rev,
              title: `${rev.mediaType === 'tv' ? 'Series' : 'Movie'} #${rev.tmdbId}`,
              posterPath: null,
            }
          }
        })
      )

      setReviews(hydrated)
    } catch (err) {
      toast.error(err.message || 'Failed to load your reviews')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Start inline editing
  const handleStartEdit = (rev) => {
    setEditingId(rev._id)
    setEditFormData({
      reviewText: rev.reviewText,
      rating: rev.rating || 8,
      containsSpoilers: Boolean(rev.containsSpoilers),
    })
  }

  // Cancel inline editing
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditFormData({ reviewText: '', rating: 10, containsSpoilers: false })
  }

  // Save inline edit
  const handleSaveEdit = async (reviewId) => {
    if (!editFormData.reviewText.trim()) {
      toast.error('Review text cannot be empty')
      return
    }

    try {
      setEditSaving(true)
      const res = await updateReview(reviewId, {
        reviewText: editFormData.reviewText.trim(),
        rating: Number(editFormData.rating),
        containsSpoilers: editFormData.containsSpoilers,
      })

      const updated = res.data?.review || res.review || editFormData

      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                reviewText: updated.reviewText || editFormData.reviewText,
                rating: updated.rating ?? editFormData.rating,
                containsSpoilers: updated.containsSpoilers ?? editFormData.containsSpoilers,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      )

      toast.success('Review updated successfully')
      handleCancelEdit()
    } catch (err) {
      toast.error(err.message || 'Failed to update review')
    } finally {
      setEditSaving(false)
    }
  }

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return
    try {
      setDeleteLoading(true)
      await deleteReview(reviewToDelete._id)
      setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete._id))
      toast.success('Review deleted')
      setReviewToDelete(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete review')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (mediaFilter === 'all') return true
        return r.mediaType === mediaFilter
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
      })
  }, [reviews, mediaFilter, sortOrder])

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-cs-border">
          <div>
            <div className="flex items-center gap-2 text-cs-accent mb-1.5">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-bold">My Contributions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cs-text">
              My Reviews
            </h1>
            <p className="text-sm text-cs-text-secondary mt-1">
              Manage your published reviews, ratings, and feedback across CineScope.
            </p>
          </div>

          <div className="bg-cs-card border border-cs-border rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-cs-text-secondary block">Total Reviews</span>
            <span className="text-xl font-bold text-cs-accent">{reviews.length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 p-4 rounded-xl bg-cs-card/70 border border-cs-border flex flex-wrap items-center justify-between gap-4">
          {/* Media Type Filter */}
          <div className="flex items-center bg-cs-bg-secondary border border-cs-border rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mediaFilter === 'all'
                  ? 'bg-cs-accent text-cs-bg shadow-sm'
                  : 'text-cs-text-secondary hover:text-cs-text'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setMediaFilter('movie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mediaFilter === 'movie'
                  ? 'bg-cs-accent text-cs-bg shadow-sm'
                  : 'text-cs-text-secondary hover:text-cs-text'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaFilter('tv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mediaFilter === 'tv'
                  ? 'bg-cs-accent text-cs-bg shadow-sm'
                  : 'text-cs-text-secondary hover:text-cs-text'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Shows</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-cs-bg-secondary border border-cs-border rounded-lg px-3 py-1.5 text-xs text-cs-text-secondary">
            <ArrowUpDown className="w-3.5 h-3.5 text-cs-accent" />
            <span className="font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-cs-text font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-cs-card text-cs-text">Newest First</option>
              <option value="oldest" className="bg-cs-card text-cs-text">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-8">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-cs-card border border-cs-border rounded-2xl p-6 h-40 animate-pulse"
                />
              ))}
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredReviews.map((rev) => {
                const isTv = rev.mediaType === 'tv'
                const detailUrl = isTv ? `/tv/${rev.tmdbId}` : `/movie/${rev.tmdbId}`
                const isEditing = editingId === rev._id
                const posterUrl = getPosterUrl(rev.posterPath, 'w185')

                return (
                  <div
                    key={rev._id}
                    className="bg-cs-card border border-cs-border hover:border-cs-border/90 rounded-2xl p-5 sm:p-6 shadow-cs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      {/* Movie Poster Thumbnail */}
                      <Link
                        to={detailUrl}
                        className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-cs-bg-secondary shrink-0 overflow-hidden border border-cs-border hover:border-cs-accent/60 transition-colors block shadow-md"
                      >
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={rev.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cs-text-secondary text-xs">
                            {isTv ? <Tv size={20} /> : <Film size={20} />}
                          </div>
                        )}
                      </Link>

                      {/* Review Main Content */}
                      <div className="flex-1 min-w-0 w-full">
                        {/* Title, Year, and Date Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cs-accent">
                                {isTv ? 'TV Series' : 'Movie'}
                              </span>
                              <span className="text-xs text-cs-text-secondary">
                                • {formatYear(rev.releaseDate)}
                              </span>
                            </div>
                            <Link
                              to={detailUrl}
                              className="text-base sm:text-lg font-bold text-cs-text hover:text-cs-accent transition-colors"
                            >
                              {rev.title}
                            </Link>
                          </div>

                          {/* Quick Actions (Edit / Delete) */}
                          {!isEditing && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(rev)}
                                className="p-2 rounded-lg text-cs-text-secondary hover:text-cs-accent hover:bg-cs-bg-secondary transition-colors"
                                title="Edit Review"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setReviewToDelete(rev)}
                                className="p-2 rounded-lg text-cs-text-secondary hover:text-cs-error hover:bg-cs-bg-secondary transition-colors"
                                title="Delete Review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Rating, Date, and Spoilers pill row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-cs-text-secondary mb-4">
                          {rev.rating && (
                            <RatingBadge rating={rev.rating} size="sm" showOutOf />
                          )}
                          <span>Reviewed {formatDate(rev.createdAt)}</span>
                          {rev.containsSpoilers && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-[10px] flex items-center gap-1">
                              <AlertTriangle size={11} />
                              <span>Contains Spoilers</span>
                            </span>
                          )}
                        </div>

                        {/* Review Body: Inline Edit Form vs Static Display */}
                        {isEditing ? (
                          <div className="bg-cs-bg-secondary p-4 rounded-xl border border-cs-border space-y-4 animate-scale-in">
                            <div>
                              <label className="block text-xs font-bold text-cs-text mb-1">
                                Your Rating (1 - 10):
                              </label>
                              <select
                                value={editFormData.rating}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    rating: Number(e.target.value),
                                  }))
                                }
                                className="px-3 py-1.5 bg-cs-card border border-cs-border rounded-lg text-xs font-semibold text-cs-text focus:outline-none focus:border-cs-accent cursor-pointer"
                              >
                                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                                  <option key={s} value={s}>
                                    {s} ★ {s >= 8 ? 'Masterpiece' : s >= 6 ? 'Good' : 'Poor'}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-cs-text mb-1">
                                Review Text:
                              </label>
                              <textarea
                                rows={4}
                                value={editFormData.reviewText}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    reviewText: e.target.value,
                                  }))
                                }
                                className="w-full p-3 bg-cs-card border border-cs-border rounded-xl text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent transition-all resize-y"
                                placeholder="Write your updated thoughts..."
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`spoiler-toggle-${rev._id}`}
                                checked={editFormData.containsSpoilers}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    containsSpoilers: e.target.checked,
                                  }))
                                }
                                className="rounded border-cs-border text-cs-accent focus:ring-cs-accent bg-cs-card cursor-pointer"
                              />
                              <label
                                htmlFor={`spoiler-toggle-${rev._id}`}
                                className="text-xs text-cs-text-secondary cursor-pointer"
                              >
                                This review reveals key plot points or spoilers
                              </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={editSaving}
                                className="px-3.5 py-1.5 rounded-lg border border-cs-border text-xs font-semibold text-cs-text-secondary hover:text-cs-text hover:bg-cs-card transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(rev._id)}
                                disabled={editSaving}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cs-accent text-cs-bg text-xs font-bold shadow-cs-accent hover:bg-yellow-400 transition-all disabled:opacity-50"
                              >
                                {editSaving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                )}
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-cs-text-secondary leading-relaxed whitespace-pre-line">
                              {rev.reviewText}
                            </p>

                            {/* Helpful count footer */}
                            <div className="mt-4 pt-3 border-t border-cs-border/60 flex items-center justify-between text-xs text-cs-text-secondary">
                              <div className="flex items-center gap-1.5">
                                <ThumbsUp className="w-3.5 h-3.5 text-cs-accent" />
                                <span>
                                  {rev.helpfulCount || 0}{' '}
                                  {rev.helpfulCount === 1 ? 'person' : 'people'} found this helpful
                                </span>
                              </div>

                              <Link
                                to={detailUrl}
                                className="inline-flex items-center gap-1 text-xs text-cs-accent hover:underline font-semibold"
                              >
                                <span>View title page</span>
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="You haven't written any reviews yet"
              description="Share your cinematic thoughts with the CineScope community. Review movies or television series to help other film buffs find their next obsession."
              actionText="Discover Titles to Review"
              actionLink="/discover"
              actionIcon={Compass}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        title="Delete Review"
        message={`Are you sure you want to permanently delete your review for "${reviewToDelete?.title}"? All helpful votes and comments on this review will be removed.`}
        confirmText="Delete Review"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  )
}

export default MyReviews
