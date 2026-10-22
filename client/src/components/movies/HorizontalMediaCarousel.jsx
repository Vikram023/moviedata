import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import MovieCard from './MovieCard'
import TVShowCard from './TVShowCard'
import SkeletonCard from './SkeletonCard'

/**
 * HorizontalMediaCarousel component
 * Displays a section title with yellow accent bar and a horizontally scrollable
 * carousel of movie or TV show cards with navigation arrows.
 *
 * @param {Object} props
 * @param {string} props.title - Carousel section title
 * @param {string} [props.subtitle] - Optional subtitle/description
 * @param {Array} props.items - List of media items
 * @param {'movie'|'tv'|'mixed'} [props.mediaType='movie'] - Media category
 * @param {boolean} [props.loading=false] - Whether data is loading
 * @param {string} [props.viewAllLink] - Destination link for "View All" button
 * @param {'sm'|'md'|'lg'} [props.cardSize='md'] - Card width sizing
 * @param {number} [props.skeletonCount=6] - Number of skeleton cards while loading
 * @param {string} [props.className=''] - Additional CSS classes
 */
const HorizontalMediaCarousel = ({
  title,
  subtitle,
  items = [],
  mediaType = 'movie',
  loading = false,
  viewAllLink,
  cardSize = 'md',
  skeletonCount = 6,
  className = '',
}) => {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check scroll positions to show/hide/disable buttons
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    checkScrollState()
    el.addEventListener('scroll', checkScrollState, { passive: true })
    window.addEventListener('resize', checkScrollState)

    return () => {
      el.removeEventListener('scroll', checkScrollState)
      window.removeEventListener('resize', checkScrollState)
    }
  }, [items, loading, checkScrollState])

  // Scroll left/right with smooth transition
  const handleScroll = (direction) => {
    const el = scrollContainerRef.current
    if (!el) return

    // Scroll by roughly 75% of container width for natural pagination
    const scrollAmount = direction === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const isTVShow = (item) => {
    if (mediaType === 'tv') return true
    if (mediaType === 'movie') return false
    return (
      item.media_type === 'tv' ||
      Boolean(item.first_air_date) ||
      (Boolean(item.name) && !item.title)
    )
  }

  // If not loading and no items, don't display empty section unless title is critical
  if (!loading && (!items || items.length === 0)) {
    return null
  }

  return (
    <section className={`relative group/carousel my-8 ${className}`}>
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-3">
            {/* Yellow left accent bar */}
            <span className="w-1.5 h-6 sm:h-7 bg-cs-accent rounded-full shrink-0 shadow-cs-accent" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-cs-text">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-cs-text-secondary mt-1 ml-4.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* View All link and/or desktop scroll buttons */}
        <div className="flex items-center gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cs-accent hover:text-yellow-400 transition-colors group/link pb-0.5"
            >
              <span>View All</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover/link:translate-x-0.5 stroke-[2.5]"
              />
            </Link>
          )}

          {/* Quick scroll arrows in header for larger viewports */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-cs-card border border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-cs-card border border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Floating Left Scroll Overlay Button (Desktop hover) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full items-center justify-center bg-cs-card/90 backdrop-blur-md border border-cs-border hover:border-cs-accent text-cs-text hover:text-cs-accent shadow-cs-lg hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>
        )}

        {/* Floating Right Scroll Overlay Button (Desktop hover) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full items-center justify-center bg-cs-card/90 backdrop-blur-md border border-cs-border hover:border-cs-accent text-cs-text hover:text-cs-accent shadow-cs-lg hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {loading ? (
            Array.from({ length: skeletonCount }).map((_, idx) => (
              <div key={`carousel-skeleton-${idx}`} style={{ scrollSnapAlign: 'start' }}>
                <SkeletonCard size={cardSize} />
              </div>
            ))
          ) : (
            items.map((item, idx) => {
              const isTV = isTVShow(item)
              const key = item.id || item.tmdbId || item._id || `carousel-item-${idx}`

              return (
                <div
                  key={`carousel-${key}`}
                  style={{ scrollSnapAlign: 'start' }}
                  className="shrink-0"
                >
                  {isTV ? (
                    <TVShowCard
                      tv={item}
                      size={cardSize}
                      showType={mediaType === 'mixed'}
                    />
                  ) : (
                    <MovieCard
                      movie={item}
                      size={cardSize}
                      showType={mediaType === 'mixed'}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default HorizontalMediaCarousel
