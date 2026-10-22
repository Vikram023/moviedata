import React, { useEffect } from 'react'
import { AlertTriangle, Info, AlertCircle, X, Loader2 } from 'lucide-react'

const ConfirmDialog = ({
  isOpen = false,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  variant = 'warning', // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel?.()
      }
    }

    // Lock body scrolling when dialog is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loading, onCancel])

  if (!isOpen) return null

  const isDestructive = isDanger || variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!loading) onCancel?.()
        }}
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-md bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs-lg z-10 animate-scale-in">
        {/* Close button in top corner */}
        <button
          type="button"
          onClick={() => {
            if (!loading) onCancel?.()
          }}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1 rounded-lg text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-cs-error/15 text-cs-error border border-cs-error/30'
                : variant === 'info'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'bg-cs-accent/15 text-cs-accent border border-cs-accent/30'
            }`}
          >
            {isDestructive ? (
              <AlertCircle className="w-6 h-6" />
            ) : variant === 'info' ? (
              <Info className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-4">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-bold text-cs-text tracking-tight mb-2"
            >
              {title}
            </h3>
            <p className="text-sm text-cs-text-secondary leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-cs-border bg-cs-bg-secondary/60 hover:bg-cs-bg-secondary text-cs-text-secondary hover:text-cs-text font-medium text-sm transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-cs-error hover:bg-red-600 text-white shadow-red-900/30'
                : 'bg-cs-accent hover:bg-yellow-400 text-cs-bg shadow-cs-accent/20'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
