import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Star,
  AlertTriangle,
  Send,
  Loader2,
  X,
  MessageSquarePlus,
  Edit2,
  HelpCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createReview, updateReview } from '../../services/movieService'

const RATING_DESCRIPTIONS = {
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
 * ReviewForm component
 * Handles creating and editing reviews with text validation (10-5000 chars),
 * character counter, optional star rating selector, and spoiler flagging.
 *
 * @param {Object} props
 * @param {number|string} props.tmdbId - TMDB ID of title
 * @param {'movie'|'tv'} [props.mediaType='movie'] - Media type
 * @param {Object|null} [props.existingReview=null] - Existing review for edit mode
 * @param {Function} [props.onSubmit] - Callback with saved review: (savedReview) => void
 * @param {Function} [props.onCancel] - Callback to cancel edit or dismiss form
 * @param {string} [props.className=''] - Custom styling classes
 */
const ReviewForm = ({
  tmdbId,
  mediaType = 'movie',
  existingReview = null,
  onSubmit,
  onCancel,
  className = '',
}) => {
  const isEditing = Boolean(existingReview?._id)

  // Star selector hover state
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reviewText: existingReview?.reviewText || '',
      rating: existingReview?.rating || 0,
      containsSpoilers: existingReview?.containsSpoilers || false,
    },
  })

  // Sync form values if existingReview changes
  useEffect(() => {
    if (existingReview) {
      reset({
        reviewText: existingReview.reviewText || '',
        rating: existingReview.rating || 0,
        containsSpoilers: Boolean(existingReview.containsSpoilers),
      })
    }
  }, [existingReview, reset])

  const currentRating = watch('rating') || 0
  const reviewText = watch('reviewText') || ''
  const containsSpoilers = watch('containsSpoilers')
  const charCount = reviewText.length
  const minChars = 10
  const maxChars = 5000

  // Form submit handler
  const onFormSubmit = async (data) => {
    try {
      setSubmitting(true)
      const payload = {
        tmdbId: Number(tmdbId),
        mediaType,
        reviewText: data.reviewText.trim(),
        containsSpoilers: Boolean(data.containsSpoilers),
      }

      // Rating is optional in review schema, only include if > 0
      if (data.rating && data.rating >= 1 && data.rating <= 10) {
        payload.rating = Number(data.rating)
      } else {
        payload.rating = undefined
      }

      let res
      if (isEditing) {
        res = await updateReview(existingReview._id, payload)
        toast.success('Your review has been updated!')
      } else {
        res = await createReview(payload)
        toast.success('Review posted successfully!')
        reset({
          reviewText: '',
          rating: 0,
          containsSpoilers: false,
        })
      }

      const savedReview = res.data?.review
      if (onSubmit) {
        onSubmit(savedReview)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={`bg-cs-card border border-cs-border rounded-2xl p-5 md:p-6 shadow-cs relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-cs-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cs-accent/15 border border-cs-accent/25 flex items-center justify-center text-cs-accent">
            {isEditing ? <Edit2 size={18} /> : <MessageSquarePlus size={18} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-cs-text">
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <p className="text-xs text-cs-text-secondary">
              Share your thoughts, analysis, or impressions with fellow movie lovers.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors"
            aria-label="Cancel editing"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Optional Star Rating Selector */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-cs-text uppercase tracking-wider">
            Rating <span className="text-cs-text-secondary font-normal lowercase">(optional)</span>
          </label>

          {currentRating > 0 && (
            <button
              type="button"
              onClick={() => setValue('rating', 0)}
              className="text-[11px] text-cs-text-secondary hover:text-cs-error transition-colors"
            >
              Clear rating
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-1 p-1.5 bg-cs-bg-secondary rounded-xl border border-cs-border/60"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
              const isLit = star <= (hoverRating || currentRating)
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star, { shouldValidate: true })}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 rounded hover:scale-110 transition-transform focus:outline-none focus:ring-1 focus:ring-cs-accent/60"
                  aria-label={`Select ${star} stars`}
                >
                  <Star
                    size={18}
                    className={`transition-colors ${
                      isLit
                        ? 'fill-cs-accent text-cs-accent drop-shadow-[0_0_4px_rgba(245,197,24,0.3)]'
                        : 'text-cs-border fill-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Rating label feedback */}
          {(hoverRating || currentRating) > 0 && (
            <span className="text-xs font-semibold text-cs-accent bg-cs-bg-secondary px-2.5 py-1 rounded-lg border border-cs-border/60 animate-fade-in">
              {RATING_DESCRIPTIONS[hoverRating || currentRating]}
            </span>
          )}
        </div>
      </div>

      {/* Review Textarea */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="reviewText"
            className="block text-xs font-semibold text-cs-text uppercase tracking-wider"
          >
            Review <span className="text-cs-accent">*</span>
          </label>

          {/* Live character counter */}
          <div
            className={`text-xs tabular-nums font-medium ${
              charCount < minChars
                ? 'text-amber-400'
                : charCount > maxChars
                ? 'text-cs-error font-bold'
                : 'text-cs-text-secondary'
            }`}
          >
            {charCount} / {maxChars}
            {charCount < minChars && (
              <span className="ml-1 text-[11px] text-cs-text-secondary font-normal">
                (min {minChars})
              </span>
            )}
          </div>
        </div>

        <textarea
          id="reviewText"
          rows={5}
          placeholder="What did you think of the directing, acting, cinematography, or soundtrack? Avoid unannounced spoilers..."
          {...register('reviewText', {
            required: 'Review text is required',
            minLength: {
              value: minChars,
              message: `Review must be at least ${minChars} characters long`,
            },
            maxLength: {
              value: maxChars,
              message: `Review cannot exceed ${maxChars} characters`,
            },
          })}
          className={`w-full bg-cs-bg-secondary border rounded-xl p-3.5 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none transition-colors resize-y min-h-[120px] ${
            errors.reviewText
              ? 'border-cs-error focus:border-cs-error ring-1 ring-cs-error/40'
              : 'border-cs-border focus:border-cs-accent'
          }`}
        />

        {errors.reviewText && (
          <p className="mt-1.5 text-xs text-cs-error flex items-center gap-1">
            <AlertTriangle size={13} />
            <span>{errors.reviewText.message}</span>
          </p>
        )}
      </div>

      {/* Spoilers Checkbox */}
      <div className="mb-5">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            {...register('containsSpoilers')}
            className="w-4 h-4 rounded border-cs-border bg-cs-bg-secondary text-cs-accent focus:ring-cs-accent/40 focus:ring-offset-cs-card cursor-pointer accent-amber-400"
          />
          <span className="text-xs text-cs-text group-hover:text-cs-accent transition-colors flex items-center gap-1.5 font-medium">
            <AlertTriangle
              size={14}
              className={containsSpoilers ? 'text-amber-400' : 'text-cs-text-secondary'}
            />
            This review contains spoilers
          </span>
        </label>
        <p className="text-[11px] text-cs-text-secondary mt-0.5 ml-6">
          We will veil your review with a spoiler warning so others can choose when to read it.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-cs-border/60">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-cs-text-secondary hover:text-cs-text bg-cs-bg-secondary hover:bg-cs-border/40 transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting || charCount < minChars || charCount > maxChars}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{isEditing ? 'Updating...' : 'Publishing...'}</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>{isEditing ? 'Update Review' : 'Post Review'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
