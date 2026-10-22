import React, { useEffect, useRef } from 'react'
import { X, Film, AlertCircle } from 'lucide-react'

/**
 * TrailerModal component
 * Full-screen modal overlay for streaming official trailers with YouTube iframe embed.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Modal close handler
 * @param {string} [props.trailerUrl] - YouTube URL, embed URL, or TMDB video key
 * @param {string} [props.title='Trailer'] - Movie/TV show title
 */
const TrailerModal = ({
  isOpen,
  onClose,
  trailerUrl,
  title = 'Official Trailer',
}) => {
  const backdropRef = useRef(null)

  // Parse and normalize YouTube embed URL
  const getEmbedUrl = (urlOrKey) => {
    if (!urlOrKey) return null

    // If it's already an embed URL
    if (urlOrKey.includes('youtube.com/embed/')) {
      const separator = urlOrKey.includes('?') ? '&' : '?'
      return `${urlOrKey}${separator}autoplay=1&rel=0&modestbranding=1`
    }

    // If it's a standard youtube watch URL
    const watchMatch = urlOrKey.match(/(?:watch\?v=|\/watch\?.*&v=)([^&\s]+)/)
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    }

    // If it's a youtu.be short URL
    const shortMatch = urlOrKey.match(/youtu\.be\/([^?&\s]+)/)
    if (shortMatch && shortMatch[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    }

    // If it's just the video key (alphanumeric string without slashes or query)
    if (/^[a-zA-Z0-9_-]{10,12}$/.test(urlOrKey)) {
      return `https://www.youtube.com/embed/${urlOrKey}?autoplay=1&rel=0&modestbranding=1`
    }

    return urlOrKey
  }

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const embedSrc = getEmbedUrl(trailerUrl)

  const handleBackdropClick = (e) => {
    if (backdropRef.current && e.target === backdropRef.current) {
      onClose?.()
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-cs-card border border-cs-border rounded-2xl overflow-hidden shadow-cs-lg flex flex-col animate-scale-in">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cs-border bg-cs-bg-secondary/70">
          <div className="flex items-center gap-2.5 truncate mr-4">
            <Film size={18} className="text-cs-accent shrink-0" />
            <h3
              id="trailer-modal-title"
              className="text-base sm:text-lg font-bold text-cs-text truncate"
            >
              {title}
            </h3>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trailer modal"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-cs-card border border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-accent hover:bg-cs-bg transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player Container (16:9 Aspect Ratio) */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <AlertCircle size={40} className="text-cs-accent/70" />
              <p className="text-base font-semibold text-cs-text">
                Trailer Not Available
              </p>
              <p className="text-xs text-cs-text-secondary max-w-sm">
                We couldn't find an official video trailer for this title at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrailerModal
