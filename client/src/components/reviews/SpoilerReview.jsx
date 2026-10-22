import React, { useState } from 'react'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'

/**
 * SpoilerReview component
 * Wraps review content and provides a spoiler shield that users can click to reveal or re-hide.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Review text / elements to protect
 * @param {boolean} [props.hasSpoiler=false] - Whether this review contains spoilers
 * @param {string} [props.className=''] - Custom styling
 */
const SpoilerReview = ({
  children,
  hasSpoiler = false,
  className = '',
}) => {
  const [isRevealed, setIsRevealed] = useState(false)

  // If no spoiler, render content directly
  if (!hasSpoiler) {
    return <div className={className}>{children}</div>
  }

  // If spoiler is hidden
  if (!isRevealed) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-amber-950/20 border border-amber-500/30 p-4 sm:p-5 transition-all duration-200 group hover:border-amber-500/50 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Spoiler Warning
              </p>
              <p className="text-xs text-amber-200/70 mt-0.5">
                This review contains key plot twists or ending details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all duration-150 shrink-0 active:scale-95"
            aria-label="Reveal spoiler content"
          >
            <Eye size={14} />
            <span>Reveal Review</span>
          </button>
        </div>
      </div>
    )
  }

  // If spoiler is revealed
  return (
    <div className={`space-y-2 animate-fade-in ${className}`}>
      {/* Revealed bar with re-hide control */}
      <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300/80">
        <span className="flex items-center gap-1.5 font-medium">
          <AlertTriangle size={12} className="text-amber-400" />
          <span>Spoiler revealed</span>
        </span>
        <button
          type="button"
          onClick={() => setIsRevealed(false)}
          className="inline-flex items-center gap-1 text-[11px] text-amber-200/70 hover:text-amber-200 transition-colors p-1"
          aria-label="Hide spoiler again"
        >
          <EyeOff size={13} />
          <span>Hide</span>
        </button>
      </div>

      {/* Review content with amber accent bar */}
      <div className="border-l-2 border-amber-500/40 pl-3 sm:pl-4 py-0.5">
        {children}
      </div>
    </div>
  )
}

export default SpoilerReview
