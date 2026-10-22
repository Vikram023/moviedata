import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Star,
  Repeat,
  Tv,
  Film,
  Disc,
  Radio,
  Tag,
  Loader2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createDiaryEntry, updateDiaryEntry } from '../../services/movieService'
import { getPosterUrl } from '../../utils/helpers'

const WATCH_METHODS = [
  { id: 'streaming', label: 'Streaming', icon: Tv, description: 'Netflix, Prime, etc.' },
  { id: 'theater', label: 'Cinema / IMAX', icon: Film, description: 'Movie theater' },
  { id: 'physical_media', label: 'Blu-ray / DVD', icon: Disc, description: 'Disc / VHS' },
  { id: 'tv', label: 'Cable / TV', icon: Radio, description: 'Broadcast TV' },
]

const QUICK_TAGS = ['Cinema', 'With Friends', 'Solo', 'IMAX', '4K UHD', 'Film Club', 'Late Night', 'Airplane']

const LogToDiaryModal = ({
  isOpen,
  onClose,
  movie, // { id/tmdbId, title, name, poster_path/posterPath, release_date/releaseDate, mediaType }
  existingEntry = null,
  onSuccess,
}) => {
  const isEditing = Boolean(existingEntry)

  const [watchedDate, setWatchedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isRewatch, setIsRewatch] = useState(false)
  const [watchMethod, setWatchMethod] = useState('streaming')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState([])
  const [customTagInput, setCustomTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Populate data when modal opens or existingEntry changes
  useEffect(() => {
    if (existingEntry) {
      setWatchedDate(
        existingEntry.watchedDate
          ? new Date(existingEntry.watchedDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      )
      setRating(existingEntry.rating || 0)
      setIsRewatch(Boolean(existingEntry.isRewatch))
      setWatchMethod(existingEntry.watchMethod || 'streaming')
      setNotes(existingEntry.notes || '')
      setTags(existingEntry.tags || [])
    } else {
      setWatchedDate(new Date().toISOString().split('T')[0])
      setRating(0)
      setIsRewatch(false)
      setWatchMethod('streaming')
      setNotes('')
      setTags([])
    }
  }, [existingEntry, isOpen])

  if (!isOpen) return null

  const movieTitle = movie?.title || movie?.name || existingEntry?.title || 'Unknown Title'
  const posterPath = movie?.poster_path || movie?.posterPath || existingEntry?.posterPath
  const posterUrl = getPosterUrl(posterPath, 'w185')
  const tmdbId = movie?.id || movie?.tmdbId || existingEntry?.tmdbId
  const mediaType = movie?.mediaType || (movie?.first_air_date ? 'tv' : 'movie') || existingEntry?.mediaType || 'movie'
  const releaseDate = movie?.release_date || movie?.first_air_date || movie?.releaseDate || existingEntry?.releaseDate || ''

  const handleToggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault()
      const clean = customTagInput.trim().replace(/^#/, '')
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean])
        setCustomTagInput('')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (isEditing) {
        const res = await updateDiaryEntry(existingEntry._id, {
          watchedDate,
          rating: rating > 0 ? rating : null,
          isRewatch,
          watchMethod,
          notes,
          tags,
        })
        toast.success(`Updated entry for "${movieTitle}"!`)
        onSuccess?.(res.data?.entry)
      } else {
        const payload = {
          tmdbId: Number(tmdbId),
          mediaType,
          title: movieTitle,
          posterPath: posterPath || '',
          backdropPath: movie?.backdrop_path || movie?.backdropPath || '',
          releaseDate,
          watchedDate,
          rating: rating > 0 ? rating : null,
          isRewatch,
          watchMethod,
          notes,
          tags,
        }
        const res = await createDiaryEntry(payload)
        toast.success(`Logged "${movieTitle}" to your diary!`)
        onSuccess?.(res.data?.entry)
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save diary entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-cs-card border border-cs-border rounded-3xl shadow-cs-lg overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Movie Brief */}
        <div className="flex items-center justify-between p-5 border-b border-cs-border bg-cs-bg-secondary/50">
          <div className="flex items-center gap-3.5 min-w-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-12 h-16 object-cover rounded-lg border border-cs-border shrink-0 shadow-md"
              />
            ) : (
              <div className="w-12 h-16 bg-cs-border/40 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-cs-accent" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cs-accent">
                {isEditing ? 'Edit Diary Entry' : 'Log Film to Diary'}
              </span>
              <h3 className="text-base font-black text-cs-text truncate">
                {movieTitle}
              </h3>
              {releaseDate && (
                <p className="text-xs text-cs-text-secondary">
                  {releaseDate.substring(0, 4)} • {mediaType === 'tv' ? 'TV Series' : 'Feature Film'}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-cs-text-secondary hover:text-cs-text hover:bg-cs-border/30 rounded-xl transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5">
          {/* Watched Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-cs-accent" />
              <span>Date Watched</span>
            </label>
            <input
              type="date"
              value={watchedDate}
              onChange={(e) => setWatchedDate(e.target.value)}
              required
              className="w-full bg-cs-bg-secondary border border-cs-border rounded-xl px-4 py-2.5 text-sm text-cs-text focus:outline-none focus:border-cs-accent transition-colors"
            />
          </div>

          {/* Rating (1 - 10) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-cs-text-secondary flex items-center gap-1.5">
                <Star size={14} className="text-cs-accent" />
                <span>Your Rating</span>
              </label>
              <span className="text-xs font-bold text-cs-accent">
                {(hoverRating || rating) > 0 ? `${hoverRating || rating} / 10` : 'No rating'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-cs-bg-secondary rounded-xl border border-cs-border">
              <div className="flex items-center gap-1 flex-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
                  const active = (hoverRating || rating) >= starVal
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(rating === starVal ? 0 : starVal)}
                      className="p-1 hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        size={18}
                        className={
                          active
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-cs-border hover:text-amber-300'
                        }
                      />
                    </button>
                  )
                })}
              </div>
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="text-[11px] text-cs-text-secondary hover:text-cs-error ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Rewatch Toggle */}
          <div className="p-3 bg-cs-bg-secondary rounded-xl border border-cs-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isRewatch ? 'bg-cs-accent/20 text-cs-accent' : 'bg-cs-border/30 text-cs-text-secondary'}`}>
                <Repeat size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-cs-text block">I've watched this before</span>
                <span className="text-[11px] text-cs-text-secondary">Mark as a rewatch in your diary statistics</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRewatch(!isRewatch)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                isRewatch ? 'bg-cs-accent' : 'bg-cs-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isRewatch ? 'translate-x-5 bg-black' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Watch Method / Platform */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text-secondary mb-2">
              Viewing Medium
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {WATCH_METHODS.map((method) => {
                const Icon = method.icon
                const selected = watchMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setWatchMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center focus:outline-none ${
                      selected
                        ? 'border-cs-accent bg-cs-accent/15 text-cs-accent shadow-sm'
                        : 'border-cs-border bg-cs-bg-secondary text-cs-text-secondary hover:text-cs-text hover:border-cs-border/80'
                    }`}
                  >
                    <Icon size={18} className="mb-1.5" />
                    <span className="text-xs font-bold leading-none">{method.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Personal Journal / Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text-secondary mb-2">
              Review & Diary Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record your thoughts, memorable scenes, who you watched it with, or cinema venue..."
              className="w-full bg-cs-bg-secondary border border-cs-border rounded-xl p-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none focus:border-cs-accent transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Tag size={13} className="text-cs-accent" />
              <span>Tags & Experience</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {QUICK_TAGS.map((tag) => {
                const active = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-cs-accent text-black font-bold shadow-sm'
                        : 'bg-cs-bg-secondary border border-cs-border text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    {active ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Type a custom tag and press Enter..."
                className="flex-1 bg-cs-bg-secondary border border-cs-border rounded-xl px-3 py-1.5 text-xs text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none focus:border-cs-accent"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-cs-border/50 hover:bg-cs-border text-xs font-semibold rounded-xl text-cs-text transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-cs-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-cs-border text-xs font-semibold text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/25 shadow-md hover:shadow-cs-accent/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>{isEditing ? 'Update Entry' : 'Save to Diary'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LogToDiaryModal
