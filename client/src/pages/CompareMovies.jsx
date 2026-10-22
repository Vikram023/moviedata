import React, { useState, useEffect, useRef } from 'react'
import {
  GitCompare,
  Search,
  X,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  TrendingUp,
  Award,
  Users,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { searchMulti, getMovieDetails, getTVDetails } from '../services/movieService'
import { useDebouncedValue } from '../hooks/useDebounce'
import {
  getPosterUrl,
  formatYear,
  formatRuntime,
  formatRating,
  formatNumber,
} from '../utils/helpers'
import RatingBadge from '../components/movies/RatingBadge'

// Subcomponent: Search Select Box for each compare slot
const MovieSearchSelector = ({
  slotNumber,
  selectedItem,
  onSelectItem,
  onClearItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const debouncedSearch = useDebouncedValue(searchTerm, 350)

  // Search when debounced value changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    let isMounted = true
    const performSearch = async () => {
      try {
        setLoading(true)
        const res = await searchMulti(debouncedSearch.trim())
        const hits = res.data?.results || res.results || []
        // Filter out people, only keep movies and tv
        const filtered = hits.filter((h) => h.media_type === 'movie' || h.media_type === 'tv')
        if (isMounted) setResults(filtered.slice(0, 8))
      } catch (err) {
        if (isMounted) setResults([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    performSearch()
    return () => {
      isMounted = false
    }
  }, [debouncedSearch])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      {selectedItem ? (
        // Selected Pill / Compact View
        <div className="flex items-center justify-between p-3 rounded-xl bg-cs-card border border-cs-accent/40 shadow-cs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-14 rounded-md overflow-hidden bg-cs-bg-secondary shrink-0 border border-cs-border">
              {selectedItem.poster_path ? (
                <img
                  src={getPosterUrl(selectedItem.poster_path, 'w185')}
                  alt={selectedItem.title || selectedItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cs-text-secondary text-xs">
                  {selectedItem.media_type === 'tv' ? <Tv size={16} /> : <Film size={16} />}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-cs-accent tracking-wider">
                  Slot {slotNumber}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-cs-bg-secondary text-cs-text-secondary border border-cs-border">
                  {selectedItem.media_type === 'tv' ? 'TV' : 'Movie'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-cs-text truncate">
                {selectedItem.title || selectedItem.name}
              </h4>
              <p className="text-xs text-cs-text-secondary">
                {formatYear(selectedItem.release_date || selectedItem.first_air_date)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearItem}
            className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-error hover:bg-cs-bg-secondary transition-colors"
            title="Change Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Search Input Box
        <div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-secondary" />
            <input
              type="text"
              placeholder={`Search & select Movie/TV #${slotNumber}...`}
              value={searchTerm}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsOpen(true)
              }}
              className="w-full pl-10 pr-10 py-3 bg-cs-card border border-cs-border rounded-xl text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent focus:ring-1 focus:ring-cs-accent transition-all shadow-cs"
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cs-accent" />
            )}
          </div>

          {/* Search Dropdown Results */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-cs-card border border-cs-border rounded-xl shadow-cs-lg overflow-hidden max-h-72 overflow-y-auto">
              {results.length > 0 ? (
                <div className="divide-y divide-cs-border/60">
                  {results.map((hit) => {
                    const title = hit.title || hit.name
                    const year = formatYear(hit.release_date || hit.first_air_date)
                    const isTv = hit.media_type === 'tv'

                    return (
                      <button
                        key={`${hit.media_type}-${hit.id}`}
                        type="button"
                        onClick={() => {
                          onSelectItem(hit)
                          setIsOpen(false)
                          setSearchTerm('')
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-cs-bg-secondary transition-colors"
                      >
                        <div className="w-9 h-12 rounded bg-cs-bg-secondary shrink-0 overflow-hidden border border-cs-border/60">
                          {hit.poster_path ? (
                            <img
                              src={getPosterUrl(hit.poster_path, 'w92')}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-cs-text-secondary">
                              {isTv ? <Tv size={14} /> : <Film size={14} />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-cs-text truncate">
                            {title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-cs-text-secondary mt-0.5">
                            <span className="uppercase text-[10px] font-bold text-cs-accent">
                              {isTv ? 'TV' : 'Movie'}
                            </span>
                            <span>•</span>
                            <span>{year || 'Unknown year'}</span>
                            {hit.vote_average > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-yellow-400">
                                  <Star size={11} className="fill-yellow-400" />
                                  {Math.round(hit.vote_average * 10) / 10}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : debouncedSearch.trim() && !loading ? (
                <div className="p-4 text-center text-xs text-cs-text-secondary">
                  No matching titles found for "{debouncedSearch}"
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-cs-text-secondary">
                  Type a movie or TV show title to search
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const CompareMovies = () => {
  // Items in compare slots
  const [slot1, setSlot1] = useState(null)
  const [slot2, setSlot2] = useState(null)

  // Full detailed fetched data for both
  const [details1, setDetails1] = useState(null)
  const [details2, setDetails2] = useState(null)

  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  // Fetch full details when slot1 is chosen
  const fetchSlot1Details = async (item) => {
    try {
      setLoading1(true)
      const res = item.media_type === 'tv'
        ? await getTVDetails(item.id)
        : await getMovieDetails(item.id)
      const data = res.data?.movie || res.data?.tv || res.data || res
      setDetails1({ ...data, media_type: item.media_type || (data.number_of_seasons ? 'tv' : 'movie') })
    } catch {
      setDetails1(item)
    } finally {
      setLoading1(false)
    }
  }

  // Fetch full details when slot2 is chosen
  const fetchSlot2Details = async (item) => {
    try {
      setLoading2(true)
      const res = item.media_type === 'tv'
        ? await getTVDetails(item.id)
        : await getMovieDetails(item.id)
      const data = res.data?.movie || res.data?.tv || res.data || res
      setDetails2({ ...data, media_type: item.media_type || (data.number_of_seasons ? 'tv' : 'movie') })
    } catch {
      setDetails2(item)
    } finally {
      setLoading2(false)
    }
  }

  const handleSelectSlot1 = (item) => {
    setSlot1(item)
    fetchSlot1Details(item)
  }

  const handleSelectSlot2 = (item) => {
    setSlot2(item)
    fetchSlot2Details(item)
  }

  // Quick swap slots
  const handleSwapSlots = () => {
    const tempSlot = slot1
    const tempDetails = details1
    setSlot1(slot2)
    setDetails1(details2)
    setSlot2(tempSlot)
    setDetails2(tempDetails)
  }

  // Calculation helpers for comparison highlights
  const movie1 = details1 || slot1
  const movie2 = details2 || slot2

  const rating1 = movie1?.vote_average ?? 0
  const rating2 = movie2?.vote_average ?? 0

  const pop1 = movie1?.popularity ?? 0
  const pop2 = movie2?.popularity ?? 0

  const votes1 = movie1?.vote_count ?? 0
  const votes2 = movie2?.vote_count ?? 0

  const runtime1 = movie1?.runtime || (movie1?.episode_run_time?.[0]) || 0
  const runtime2 = movie2?.runtime || (movie2?.episode_run_time?.[0]) || 0

  // Shared genres computation
  const genres1 = (movie1?.genres || []).map((g) => g.name || g)
  const genres2 = (movie2?.genres || []).map((g) => g.name || g)
  const sharedGenres = genres1.filter((g) => genres2.includes(g))

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cs-accent/15 border border-cs-accent/30 text-cs-accent text-xs font-bold tracking-wide uppercase mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Side-by-Side Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-cs-text">
            Compare Titles
          </h1>
          <p className="text-sm sm:text-base text-cs-text-secondary mt-2">
            Pit two films or series against each other. Compare ratings, popularity, runtime, and
            storylines head to head.
          </p>
        </div>

        {/* Selection Bar: Slot 1 vs Slot 2 */}
        <div className="bg-cs-card/80 border border-cs-border rounded-2xl p-4 sm:p-6 mb-10 shadow-cs">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Slot 1 Search */}
            <MovieSearchSelector
              slotNumber={1}
              selectedItem={slot1}
              onSelectItem={handleSelectSlot1}
              onClearItem={() => {
                setSlot1(null)
                setDetails1(null)
              }}
            />

            {/* Swap Button / VS indicator */}
            <div className="shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapSlots}
                disabled={!slot1 && !slot2}
                className="w-10 h-10 rounded-full bg-cs-bg-secondary border border-cs-border hover:border-cs-accent text-cs-text-secondary hover:text-cs-accent flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:border-cs-border disabled:hover:text-cs-text-secondary"
                title="Swap Titles"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Slot 2 Search */}
            <MovieSearchSelector
              slotNumber={2}
              selectedItem={slot2}
              onSelectItem={handleSelectSlot2}
              onClearItem={() => {
                setSlot2(null)
                setDetails2(null)
              }}
            />
          </div>
        </div>

        {/* Comparison Presentation */}
        {slot1 && slot2 ? (
          <div className="space-y-8 animate-fade-in">
            {/* Top Posters & Hero Showcase */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {/* Card 1 */}
              <div
                className={`relative rounded-2xl p-5 sm:p-6 bg-cs-card border transition-all ${
                  rating1 > rating2
                    ? 'border-cs-accent shadow-cs-accent/20'
                    : 'border-cs-border'
                }`}
              >
                {rating1 > rating2 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cs-accent text-cs-bg px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-cs">
                    <Award size={12} className="stroke-[3]" />
                    <span>Higher Rated</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-cs-bg-secondary shrink-0 border border-cs-border shadow-md">
                    {movie1.poster_path ? (
                      <img
                        src={getPosterUrl(movie1.poster_path, 'w342')}
                        alt={movie1.title || movie1.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cs-text-secondary text-xs">
                        No poster
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cs-accent">
                      {movie1.media_type === 'tv' ? 'TV Series' : 'Feature Film'}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-cs-text tracking-tight mt-0.5">
                      {movie1.title || movie1.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-cs-text-secondary mt-1">
                      {formatYear(movie1.release_date || movie1.first_air_date)}
                    </p>
                    <div className="mt-3 inline-block">
                      <RatingBadge rating={rating1} size="md" showOutOf />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className={`relative rounded-2xl p-5 sm:p-6 bg-cs-card border transition-all ${
                  rating2 > rating1
                    ? 'border-cs-accent shadow-cs-accent/20'
                    : 'border-cs-border'
                }`}
              >
                {rating2 > rating1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cs-accent text-cs-bg px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-cs">
                    <Award size={12} className="stroke-[3]" />
                    <span>Higher Rated</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-cs-bg-secondary shrink-0 border border-cs-border shadow-md">
                    {movie2.poster_path ? (
                      <img
                        src={getPosterUrl(movie2.poster_path, 'w342')}
                        alt={movie2.title || movie2.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cs-text-secondary text-xs">
                        No poster
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cs-accent">
                      {movie2.media_type === 'tv' ? 'TV Series' : 'Feature Film'}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-cs-text tracking-tight mt-0.5">
                      {movie2.title || movie2.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-cs-text-secondary mt-1">
                      {formatYear(movie2.release_date || movie2.first_air_date)}
                    </p>
                    <div className="mt-3 inline-block">
                      <RatingBadge rating={rating2} size="md" showOutOf />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-cs-card border border-cs-border rounded-2xl overflow-hidden shadow-cs">
              <div className="p-4 bg-cs-bg-secondary/70 border-b border-cs-border flex items-center gap-2">
                <Layers className="w-4 h-4 text-cs-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-cs-text">
                  Metric by Metric Breakdown
                </h3>
              </div>

              <div className="divide-y divide-cs-border/60">
                {/* Row 1: TMDB Rating */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className={`col-span-5 text-right pr-4 font-bold text-sm ${rating1 > rating2 ? 'text-cs-success' : 'text-cs-text'}`}>
                    {rating1 > 0 ? `${formatRating(rating1)} / 10` : 'Not Rated'}
                    {rating1 > rating2 && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider font-extrabold text-cs-success bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        +{Math.round((rating1 - rating2) * 10) / 10}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-cs-text-secondary uppercase tracking-wider">
                    TMDB Rating
                  </div>
                  <div className={`col-span-5 pl-4 font-bold text-sm ${rating2 > rating1 ? 'text-cs-success' : 'text-cs-text'}`}>
                    {rating2 > 0 ? `${formatRating(rating2)} / 10` : 'Not Rated'}
                    {rating2 > rating1 && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider font-extrabold text-cs-success bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        +{Math.round((rating2 - rating1) * 10) / 10}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Vote Count */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className={`col-span-5 text-right pr-4 font-medium text-sm ${votes1 > votes2 ? 'text-cs-accent font-bold' : 'text-cs-text'}`}>
                    {formatNumber(votes1)} votes
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-cs-text-secondary uppercase tracking-wider">
                    Vote Count
                  </div>
                  <div className={`col-span-5 pl-4 font-medium text-sm ${votes2 > votes1 ? 'text-cs-accent font-bold' : 'text-cs-text'}`}>
                    {formatNumber(votes2)} votes
                  </div>
                </div>

                {/* Row 3: Popularity Index */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className={`col-span-5 text-right pr-4 font-medium text-sm ${pop1 > pop2 ? 'text-cs-accent font-bold' : 'text-cs-text'}`}>
                    {Math.round(pop1)} pts
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-cs-text-secondary uppercase tracking-wider">
                    Popularity Score
                  </div>
                  <div className={`col-span-5 pl-4 font-medium text-sm ${pop2 > pop1 ? 'text-cs-accent font-bold' : 'text-cs-text'}`}>
                    {Math.round(pop2)} pts
                  </div>
                </div>

                {/* Row 4: Runtime */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-5 text-right pr-4 text-sm font-medium text-cs-text">
                    {runtime1 > 0 ? formatRuntime(runtime1) : 'Variable'}
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-cs-text-secondary uppercase tracking-wider">
                    Runtime
                  </div>
                  <div className="col-span-5 pl-4 text-sm font-medium text-cs-text">
                    {runtime2 > 0 ? formatRuntime(runtime2) : 'Variable'}
                  </div>
                </div>

                {/* Row 5: Genres */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-5 flex flex-wrap justify-end gap-1.5 pr-4">
                    {genres1.length > 0 ? (
                      genres1.map((g, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded-md border ${
                            sharedGenres.includes(g)
                              ? 'bg-cs-accent/15 border-cs-accent/40 text-cs-accent font-semibold'
                              : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                          }`}
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-cs-text-secondary">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-cs-text-secondary uppercase tracking-wider">
                    Genres
                  </div>
                  <div className="col-span-5 flex flex-wrap justify-start gap-1.5 pl-4">
                    {genres2.length > 0 ? (
                      genres2.map((g, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded-md border ${
                            sharedGenres.includes(g)
                              ? 'bg-cs-accent/15 border-cs-accent/40 text-cs-accent font-semibold'
                              : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                          }`}
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-cs-text-secondary">—</span>
                    )}
                  </div>
                </div>

                {/* Row 6: Synopses / Overview */}
                <div className="grid grid-cols-12 p-5 items-start">
                  <div className="col-span-5 text-right pr-4 text-xs sm:text-sm text-cs-text-secondary leading-relaxed">
                    {movie1.overview || 'No synopsis provided.'}
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-cs-text-secondary uppercase tracking-wider pt-1">
                    Storyline
                  </div>
                  <div className="col-span-5 pl-4 text-xs sm:text-sm text-cs-text-secondary leading-relaxed">
                    {movie2.overview || 'No synopsis provided.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Selection Placeholder */
          <div className="p-10 text-center rounded-2xl border border-dashed border-cs-border bg-cs-card/30">
            <GitCompare className="w-12 h-12 text-cs-accent/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-cs-text mb-1">
              Select Two Titles to Compare
            </h3>
            <p className="text-sm text-cs-text-secondary max-w-md mx-auto">
              Use the search inputs above to choose any two movies or television series.
              Discover differences in reception, length, genre DNA, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompareMovies
