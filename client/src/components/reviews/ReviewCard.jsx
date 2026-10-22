import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ThumbsUp,
  Flag,
  Edit3,
  Trash2,
  Star,
  Check,
  X,
  AlertCircle,
  Loader2,
  User as UserIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SpoilerReview from './SpoilerReview'
import { timeAgo, formatDate } from '../../utils/helpers'
import { reportReview } from '../../services/movieService'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'offensive', label: 'Inappropriate or offensive content' },
  { value: 'spoiler', label: 'Unmarked spoilers' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'other', label: 'Other issue' },
]

/**
 * ReviewCard component
 * Displays an individual review with author info, rating, spoiler protection,
 * helpful upvoting, report modal, and edit/delete actions for review owners.
 *
 * @param {Object} props
 * @param {Object} props.review - Review object
 * @param {Function} [props.onHelpful] - Callback for helpful vote toggle: (reviewId, willBeHelpful) => void
 * @param {Function} [props.onDelete] - Callback for review deletion: (reviewId) => void
 * @param {Function} [props.onEdit] - Callback for editing: (review) => void
 * @param {string} [props.currentUserId] - Authenticated user's ID
 * @param {string} [props.className=''] - Additional custom CSS
 */
const ReviewCard = ({
  review,
  onHelpful,
  onDelete,
  onEdit,
  currentUserId,
  className = '',
}) => {
  // State
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDescription, setReportDescription] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [helpfulVoting, setHelpfulVoting] = useState(false)

  // Determine review author properties
  const author = review?.userId || {}
  const authorId = author?._id || (typeof review?.userId === 'string' ? review?.userId : null)
  const authorName = author?.name || 'CineScope Critic'
  const authorAvatar = author?.profileImage || null
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isOwner = Boolean(
    currentUserId &&
    authorId &&
    String(currentUserId) === String(authorId)
  )

  const isHelpfulByUser = Boolean(review?.isHelpfulByUser)
  const helpfulCount = review?.helpfulCount || 0

  // Format creation / edit dates
  const createdDateStr = review?.createdAt ? timeAgo(review.createdAt) : 'Recently'
  const fullCreatedDate = review?.createdAt ? formatDate(review.createdAt) : ''
  const isEdited = review?.updatedAt && review?.createdAt && review.updatedAt !== review.createdAt

  // Handle helpful vote toggle
  const handleToggleHelpful = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to vote on reviews')
      return
    }

    if (isOwner) {
      toast.error('You cannot vote on your own review')
      return
    }

    if (helpfulVoting) return

    try {
      setHelpfulVoting(true)
      if (onHelpful) {
        await onHelpful(review._id, !isHelpfulByUser)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update helpful vote')
    } finally {
      setHelpfulVoting(false)
    }
  }

  // Handle delete action
  const handleConfirmDelete = async () => {
    if (!onDelete) return

    try {
      setIsDeleting(true)
      await onDelete(review._id)
      setIsConfirmingDelete(false)
    } catch (err) {
      toast.error(err.message || 'Failed to delete review')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle report submission
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    if (!currentUserId) {
      toast.error('Please sign in to report a review')
      return
    }

    try {
      setSubmittingReport(true)
      await reportReview(review._id, {
        reason: reportReason,
        description: reportDescription.trim(),
      })
      toast.success('Report submitted. Thank you for helping our community!')
      setShowReportModal(false)
      setReportDescription('')
      setReportReason('spam')
    } catch (err) {
      toast.error(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setSubmittingReport(false)
    }
  }

  return (
    <article
      className={`bg-cs-card border border-cs-border rounded-2xl p-5 md:p-6 shadow-cs transition-all duration-200 hover:border-cs-border/80 ${className}`}
    >
      {/* Header: Author, Rating, Date, and Top Actions */}
      <header className="flex items-start justify-between gap-4 mb-4">
        {/* Author info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={authorId ? `/profile/${authorId}` : '#'}
            className="relative shrink-0 group focus:outline-none"
            aria-label={`View ${authorName}'s profile`}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover border border-cs-border group-hover:border-cs-accent transition-colors duration-150"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cs-bg-secondary border border-cs-border flex items-center justify-center text-xs font-bold text-cs-accent group-hover:border-cs-accent transition-colors duration-150">
                {authorInitials || <UserIcon size={16} />}
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={authorId ? `/profile/${authorId}` : '#'}
                className="text-sm font-semibold text-cs-text hover:text-cs-accent truncate transition-colors"
              >
                {authorName}
              </Link>
              {isOwner && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cs-accent/15 border border-cs-accent/30 text-cs-accent font-medium">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-cs-text-secondary mt-0.5">
              <time dateTime={review?.createdAt} title={fullCreatedDate}>
                {createdDateStr}
              </time>
              {isEdited && (
                <>
                  <span>•</span>
                  <span className="italic text-[11px] text-cs-text-secondary/70">edited</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating Score Badge */}
        {review?.rating > 0 && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-cs-accent/30 text-cs-accent font-bold text-xs shrink-0 shadow-sm">
            <Star size={13} className="fill-cs-accent text-cs-accent" />
            <span>{review.rating}</span>
            <span className="text-[10px] font-normal text-cs-text-secondary">/10</span>
          </div>
        )}
      </header>

      {/* Review Body (wrapped in spoiler guard) */}
      <div className="my-3">
        <SpoilerReview hasSpoiler={Boolean(review?.containsSpoilers)}>
          <div className="text-sm text-cs-text leading-relaxed whitespace-pre-line break-words font-normal">
            {review?.reviewText}
          </div>
        </SpoilerReview>
      </div>

      {/* Footer: Helpful voting, Report & Owner Controls */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-4 border-t border-cs-border/60 text-xs">
        {/* Helpful Vote Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleHelpful}
            disabled={helpfulVoting || isOwner}
            aria-label={isHelpfulByUser ? 'Remove helpful vote' : 'Mark review as helpful'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 active:scale-95 ${
              isHelpfulByUser
                ? 'bg-cs-accent/20 border border-cs-accent/40 text-cs-accent shadow-sm'
                : 'bg-cs-bg-secondary/80 hover:bg-cs-bg-secondary text-cs-text-secondary hover:text-cs-text border border-cs-border/60'
            } ${isOwner ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={isOwner ? 'You cannot vote on your own review' : undefined}
          >
            {helpfulVoting ? (
              <Loader2 size={13} className="animate-spin text-cs-accent" />
            ) : (
              <ThumbsUp
                size={13}
                className={isHelpfulByUser ? 'fill-cs-accent text-cs-accent' : ''}
              />
            )}
            <span>Helpful</span>
            {helpfulCount > 0 && (
              <span className="ml-0.5 font-bold tabular-nums">({helpfulCount})</span>
            )}
          </button>
        </div>

        {/* Action buttons (Report or Edit/Delete) */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              {/* Edit Button */}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary/80 transition-colors"
                  aria-label="Edit review"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}

              {/* Delete Button & Confirmation */}
              {isConfirmingDelete ? (
                <div className="inline-flex items-center gap-1.5 bg-cs-error/15 border border-cs-error/30 rounded-lg p-1 text-xs">
                  <span className="text-cs-error font-medium px-1 text-[11px]">Delete?</span>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="p-1 rounded bg-cs-error text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Confirm delete"
                    aria-label="Confirm delete"
                  >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    disabled={isDeleting}
                    className="p-1 rounded bg-cs-card text-cs-text-secondary hover:text-cs-text transition-colors"
                    title="Cancel"
                    aria-label="Cancel delete"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-cs-error/70 hover:text-cs-error hover:bg-cs-error/10 transition-colors"
                  aria-label="Delete review"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              )}
            </>
          ) : (
            /* Report Button for non-owners */
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-cs-text-secondary/70 hover:text-cs-error hover:bg-cs-error/10 transition-colors"
              title="Report this review"
              aria-label="Report review"
            >
              <Flag size={13} />
              <span>Report</span>
            </button>
          )}
        </div>
      </footer>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="bg-cs-card border border-cs-border rounded-2xl w-full max-w-md p-6 shadow-cs-lg animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-cs-border/60">
              <div className="flex items-center gap-2 text-cs-error font-semibold text-base">
                <Flag size={18} />
                <h3 id="report-modal-title">Report Review</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors"
                aria-label="Close report dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cs-text mb-1.5">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-cs-bg-secondary border border-cs-border rounded-xl px-3 py-2 text-sm text-cs-text focus:outline-none focus:border-cs-accent transition-colors"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-cs-card text-cs-text">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide any additional context for the moderation team..."
                  maxLength={1000}
                  className="w-full bg-cs-bg-secondary border border-cs-border rounded-xl p-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none focus:border-cs-accent resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cs-text-secondary hover:text-cs-text bg-cs-bg-secondary hover:bg-cs-border/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cs-error hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {submittingReport ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  )
}

export default ReviewCard
