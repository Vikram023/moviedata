import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

const ErrorState = ({
  icon: Icon = AlertTriangle,
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this content. Please try again.',
  retry,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  const handleRetry = onRetry || retry

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-cs-card/40 border border-cs-border hover:border-cs-error/40 rounded-2xl max-w-lg mx-auto backdrop-blur-sm transition-all duration-300 ${className}`}
      role="alert"
    >
      {/* Icon with glowing red backdrop */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-cs-error/15 blur-xl" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cs-bg-secondary border border-cs-error/30 flex items-center justify-center text-cs-error shadow-cs">
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-cs-error" strokeWidth={1.75} />
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl sm:text-2xl font-bold text-cs-text tracking-tight mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-sm sm:text-base text-cs-text-secondary max-w-sm mb-6 leading-relaxed">
          {message}
        </p>
      )}

      {/* Retry Button */}
      {handleRetry && (
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cs-card hover:bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/50 text-cs-text hover:text-cs-accent font-medium text-sm transition-all shadow-sm active:scale-95 group"
        >
          <RotateCcw className="w-4 h-4 text-cs-accent transition-transform duration-300 group-hover:-rotate-90" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  )
}

export default ErrorState
