import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'
import { getProfileUrl } from '../../utils/helpers'

/**
 * Individual Cast or Crew Member Card
 */
const PersonCard = ({ person, roleLabel }) => {
  const [imgError, setImgError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const name = person?.name || 'Unknown'
  const role = person?.character || person?.job || roleLabel || 'Cast'
  const profileUrl = !imgError && person?.profile_path ? getProfileUrl(person.profile_path, 'w185') : null

  // Generate initials for fallback avatar
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')

  return (
    <div
      className="group relative flex flex-col items-center text-center w-28 sm:w-32 shrink-0 select-none"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Profile Image / Initials Avatar */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-cs-card border-2 border-cs-border group-hover:border-cs-accent/70 shadow-md group-hover:shadow-cs transition-all duration-300">
        {profileUrl ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 skeleton" aria-hidden="true" />
            )}
            <img
              src={profileUrl}
              alt={name}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                setImgError(true)
                setIsLoaded(true)
              }}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          /* Initials avatar fallback with cinematic dark gradient */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1e2535] via-[#121620] to-[#0B0D12] text-cs-text-secondary group-hover:text-cs-accent transition-colors">
            {initials ? (
              <span className="text-base sm:text-lg font-bold tracking-wider text-cs-text group-hover:text-cs-accent transition-colors">
                {initials}
              </span>
            ) : (
              <User size={30} className="stroke-[1.5]" />
            )}
          </div>
        )}
      </div>

      {/* Person Name & Character/Role */}
      <div className="mt-2.5 w-full px-1">
        <h4
          title={name}
          className="text-xs sm:text-sm font-semibold text-cs-text truncate group-hover:text-cs-accent transition-colors"
        >
          {name}
        </h4>
        <p
          title={role}
          className="text-[11px] text-cs-text-secondary truncate mt-0.5"
        >
          {role}
        </p>
      </div>
    </div>
  )
}

/**
 * CastCarousel component
 * Horizontal scrollable row displaying movie or TV show cast & crew members.
 *
 * @param {Object} props
 * @param {Array} props.cast - Cast members array from TMDB
 * @param {Array} [props.crew] - Crew members array from TMDB
 * @param {string} [props.title='Top Cast'] - Section title
 * @param {number} [props.maxItems=20] - Maximum members to display per tab
 * @param {string} [props.className=''] - Additional CSS classes
 */
const CastCarousel = ({
  cast = [],
  crew = [],
  title = 'Top Cast',
  maxItems = 20,
  className = '',
}) => {
  const scrollContainerRef = useRef(null)
  const [activeTab, setActiveTab] = useState('cast')
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const hasCast = cast && cast.length > 0
  const hasCrew = crew && crew.length > 0

  // Filter top crew (Directors, Writers, Producers, DP, etc.)
  const prominentCrew = hasCrew
    ? crew
        .filter(
          (c) =>
            c.job === 'Director' ||
            c.job === 'Writer' ||
            c.job === 'Screenplay' ||
            c.job === 'Producer' ||
            c.job === 'Executive Producer' ||
            c.job === 'Director of Photography' ||
            c.job === 'Original Music Composer'
        )
        .slice(0, maxItems)
    : []

  const activeItems =
    activeTab === 'crew'
      ? prominentCrew.length > 0
        ? prominentCrew
        : crew.slice(0, maxItems)
      : (cast || []).slice(0, maxItems)

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
  }, [activeItems, checkScrollState])

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current
    if (!el) return

    const scrollAmount = direction === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (!hasCast && !hasCrew) {
    return null
  }

  return (
    <section className={`relative group/cast my-8 ${className}`}>
      {/* Header with Title and Cast/Crew Tab Switcher */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 sm:h-7 bg-cs-accent rounded-full shrink-0 shadow-cs-accent" />
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-cs-text">
            {title}
          </h3>

          {/* Toggle between Cast and Crew if both are available */}
          {hasCast && hasCrew && (
            <div className="flex items-center ml-3 p-0.5 rounded-lg bg-cs-card border border-cs-border">
              <button
                type="button"
                onClick={() => setActiveTab('cast')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'cast'
                    ? 'bg-cs-accent text-cs-bg shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                Cast ({cast.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('crew')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'crew'
                    ? 'bg-cs-accent text-cs-bg shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                Crew ({prominentCrew.length || crew.length})
              </button>
            </div>
          )}
        </div>

        {/* Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll cast left"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-cs-card border border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll cast right"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-cs-card border border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/50 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Floating Left Arrow (Desktop hover) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll cast left"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full items-center justify-center bg-cs-card/90 backdrop-blur-md border border-cs-border hover:border-cs-accent text-cs-text hover:text-cs-accent shadow-cs hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover/cast:opacity-100"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>
        )}

        {/* Floating Right Arrow (Desktop hover) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll cast right"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full items-center justify-center bg-cs-card/90 backdrop-blur-md border border-cs-border hover:border-cs-accent text-cs-text hover:text-cs-accent shadow-cs hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover/cast:opacity-100"
          >
            <ChevronRight size={20} className="stroke-[2.5]" />
          </button>
        )}

        {/* Horizontal Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {activeItems.map((person, idx) => (
            <PersonCard
              key={`${person.id || person.credit_id || 'person'}-${idx}`}
              person={person}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CastCarousel
