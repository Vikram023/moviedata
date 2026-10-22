import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  maxPages = 500, // TMDB limit
}) => {
  const effectiveTotalPages = Math.min(totalPages || 1, maxPages)

  if (effectiveTotalPages <= 1) return null

  // Calculate visible page range with ellipsis
  const getPageNumbers = () => {
    const delta = 1 // Sibling pages on each side of current
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= effectiveTotalPages; i++) {
      if (
        i === 1 ||
        i === effectiveTotalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  const pages = getPageNumbers()

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || page < 1 || page > effectiveTotalPages) {
      return
    }
    if (onPageChange) {
      onPageChange(page)
    }
  }

  return (
    <nav
      aria-label="Pagination navigation"
      className={`flex items-center justify-center gap-1 sm:gap-2 my-8 ${className}`}
    >
      {/* First Page (desktop only) */}
      <button
        type="button"
        onClick={() => handlePageClick(1)}
        disabled={currentPage <= 1}
        aria-label="Go to first page"
        className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-cs-border bg-cs-card/60 text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 hover:bg-cs-card disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-cs-border disabled:hover:bg-cs-card/60 disabled:hover:text-cs-text-secondary transition-all"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Previous Page */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Go to previous page"
        className="inline-flex items-center justify-center gap-1 px-3 h-9 rounded-lg border border-cs-border bg-cs-card/60 text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 hover:bg-cs-card disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-cs-border disabled:hover:bg-cs-card/60 disabled:hover:text-cs-text-secondary transition-all text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Mobile Page indicator */}
      <div className="sm:hidden px-3 py-1 text-sm text-cs-text-secondary font-medium">
        <span className="text-cs-accent font-semibold">{currentPage}</span> / {effectiveTotalPages}
      </div>

      {/* Numbered Page Buttons (Desktop / Tablet) */}
      <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-9 h-9 flex items-center justify-center text-cs-text-secondary select-none text-sm"
              >
                …
              </span>
            )
          }

          const isActive = page === currentPage

          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => handlePageClick(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-cs-accent text-cs-bg shadow-md shadow-cs-accent/25 font-bold scale-105'
                  : 'border border-cs-border bg-cs-card/60 text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/40 hover:bg-cs-card'
              }`}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next Page */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= effectiveTotalPages}
        aria-label="Go to next page"
        className="inline-flex items-center justify-center gap-1 px-3 h-9 rounded-lg border border-cs-border bg-cs-card/60 text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 hover:bg-cs-card disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-cs-border disabled:hover:bg-cs-card/60 disabled:hover:text-cs-text-secondary transition-all text-sm font-medium"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page (desktop only) */}
      <button
        type="button"
        onClick={() => handlePageClick(effectiveTotalPages)}
        disabled={currentPage >= effectiveTotalPages}
        aria-label="Go to last page"
        className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-cs-border bg-cs-card/60 text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 hover:bg-cs-card disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-cs-border disabled:hover:bg-cs-card/60 disabled:hover:text-cs-text-secondary transition-all"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

export default Pagination
