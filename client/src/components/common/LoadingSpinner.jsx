import React from 'react'

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
}

const LoadingSpinner = ({ size = 'md', fullScreen = false, label, className = '' }) => {
  const spinnerClass = sizeMap[size] || sizeMap.md

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Ambient glow behind spinner */}
        <div className="absolute inset-0 rounded-full bg-cs-accent/20 blur-md animate-pulse-slow" />
        {/* Outer rotating ring */}
        <div
          className={`${spinnerClass} rounded-full border-cs-border border-t-cs-accent border-r-cs-accent/60 animate-spin`}
          role="status"
          aria-label="Loading"
        />
      </div>
      {label && (
        <p className="text-sm font-medium text-cs-text-secondary animate-pulse tracking-wide">
          {label}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cs-bg/95 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          {/* Subtle branding accent in full screen */}
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-cs-accent/70">
            CineScope
          </div>
          {content}
        </div>
      </div>
    )
  }

  return content
}

export default LoadingSpinner
