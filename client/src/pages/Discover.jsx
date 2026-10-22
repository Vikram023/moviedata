import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Compass,
  Sliders,
  RotateCcw,
  Film,
  Tv,
  Star,
  Calendar,
  Globe2,
  ArrowUpDown,
  Check,
  X,
  Search,
} from 'lucide-react'
import { discoverMovies, discoverTV, getGenres } from '../services/movieService'
import MediaGrid from '../components/movies/MediaGrid'
import Pagination from '../components/common/Pagination'
import ErrorState from '../components/common/ErrorState'

const SORT_OPTIONS = [
  { label: 'Popularity (High to Low)', value: 'popularity.desc' },
  { label: 'Rating (High to Low)', value: 'vote_average.desc' },
  { label: 'Release Date (Newest)', value: 'release_date.desc' },
  { label: 'Release Date (Oldest)', value: 'release_date.asc' },
  { label: 'Rating (Low to High)', value: 'vote_average.asc' },
]

const TV_SORT_OPTIONS = [
  { label: 'Popularity (High to Low)', value: 'popularity.desc' },
  { label: 'Rating (High to Low)', value: 'vote_average.desc' },
  { label: 'First Air Date (Newest)', value: 'first_air_date.desc' },
  { label: 'First Air Date (Oldest)', value: 'first_air_date.asc' },
]

const LANGUAGES = [
  { label: 'All Languages', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Italian', value: 'it' },
]

const RATING_STEPS = [
  { label: 'Any', value: '' },
  { label: '5.0+', value: '5' },
  { label: '6.0+', value: '6' },
  { label: '7.0+', value: '7' },
  { label: '8.0+', value: '8' },
  { label: '8.5+ Masterpiece', value: '8.5' },
]

const CURRENT_YEAR = new Date().getFullYear()

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // URL parameters or defaults
  const typeFromUrl = searchParams.get('type') || 'movie'
  const genresFromUrl = searchParams.get('genres') ? searchParams.get('genres').split(',') : []
  const sortFromUrl = searchParams.get('sort') || 'popularity.desc'
  const yearFromFromUrl = searchParams.get('yearFrom') || ''
  const yearToFromUrl = searchParams.get('yearTo') || ''
  const ratingFromUrl = searchParams.get('minRating') || ''
  const langFromUrl = searchParams.get('lang') || ''
  const pageFromUrl = parseInt(searchParams.get('page')) || 1

  // Filter Form State (buffered until applied, or immediate)
  const [mediaType, setMediaType] = useState(typeFromUrl)
  const [selectedGenres, setSelectedGenres] = useState(genresFromUrl)
  const [selectedSort, setSelectedSort] = useState(sortFromUrl)
  const [yearFrom, setYearFrom] = useState(yearFromFromUrl)
  const [yearTo, setYearTo] = useState(yearToFromUrl)
  const [minRating, setMinRating] = useState(ratingFromUrl)
  const [language, setLanguage] = useState(langFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)

  // Applied Filters State (used to fetch data)
  const [appliedFilters, setAppliedFilters] = useState({
    mediaType: typeFromUrl,
    genres: genresFromUrl,
    sort: sortFromUrl,
    yearFrom: yearFromFromUrl,
    yearTo: yearToFromUrl,
    minRating: ratingFromUrl,
    language: langFromUrl,
    page: pageFromUrl,
  })

  // Data states
  const [results, setResults] = useState([])
  const [genreList, setGenreList] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1. Fetch genre list whenever mediaType changes
  useEffect(() => {
    const fetchGenreList = async () => {
      try {
        const res = await getGenres(mediaType)
        const list = res?.data?.genres || res?.genres || []
        setGenreList(list)
      } catch (err) {
        console.error('Failed to load genres:', err)
      }
    }
    fetchGenreList()
  }, [mediaType])

  // 2. Fetch discovered results based on appliedFilters
  const executeDiscover = useCallback(async () => {
    setLoading(true)
    setError(null)

    const isTV = appliedFilters.mediaType === 'tv'
    const params = {
      page: appliedFilters.page,
      sort_by: appliedFilters.sort,
    }

    if (appliedFilters.genres.length > 0) {
      params.with_genres = appliedFilters.genres.join(',')
    }

    if (appliedFilters.minRating) {
      params['vote_average.gte'] = appliedFilters.minRating
      if (!isTV) {
        params['vote_count.gte'] = 40
      }
    }

    if (appliedFilters.language) {
      params.with_original_language = appliedFilters.language
    }

    if (appliedFilters.yearFrom) {
      const gteKey = isTV ? 'first_air_date.gte' : 'primary_release_date.gte'
      params[gteKey] = `${appliedFilters.yearFrom}-01-01`
    }

    if (appliedFilters.yearTo) {
      const lteKey = isTV ? 'first_air_date.lte' : 'primary_release_date.lte'
      params[lteKey] = `${appliedFilters.yearTo}-12-31`
    }

    try {
      const fetcher = isTV ? discoverTV : discoverMovies
      const res = await fetcher(params)
      const data = res?.data || res || {}
      setResults(data.results || [])
      setTotalPages(data.total_pages || 1)
      setTotalResults(data.total_results || 0)
    } catch (err) {
      console.error('Discover request failed:', err)
      setError(err?.message || 'Failed to discover media. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    executeDiscover()
  }, [executeDiscover])

  // Sync state with URL params
  const syncToUrl = (filters) => {
    const newParams = new URLSearchParams()
    if (filters.mediaType) newParams.set('type', filters.mediaType)
    if (filters.genres.length > 0) newParams.set('genres', filters.genres.join(','))
    if (filters.sort) newParams.set('sort', filters.sort)
    if (filters.yearFrom) newParams.set('yearFrom', filters.yearFrom)
    if (filters.yearTo) newParams.set('yearTo', filters.yearTo)
    if (filters.minRating) newParams.set('minRating', filters.minRating)
    if (filters.language) newParams.set('lang', filters.language)
    if (filters.page && filters.page > 1) newParams.set('page', filters.page.toString())
    setSearchParams(newParams)
  }

  // Toggle genre in selection
  const handleGenreToggle = (genreId) => {
    const strId = genreId.toString()
    setSelectedGenres((prev) =>
      prev.includes(strId) ? prev.filter((id) => id !== strId) : [...prev, strId]
    )
  }

  // Handle Media Type Switch
  const handleMediaTypeChange = (type) => {
    setMediaType(type)
    setSelectedGenres([]) // reset genres because IDs differ between movie and tv
    const newFilters = {
      ...appliedFilters,
      mediaType: type,
      genres: [],
      page: 1,
      sort: 'popularity.desc',
    }
    setAppliedFilters(newFilters)
    setCurrentPage(1)
    syncToUrl(newFilters)
  }

  // Apply button click
  const handleApplyFilters = () => {
    const newFilters = {
      mediaType,
      genres: selectedGenres,
      sort: selectedSort,
      yearFrom,
      yearTo,
      minRating,
      language,
      page: 1,
    }
    setCurrentPage(1)
    setAppliedFilters(newFilters)
    syncToUrl(newFilters)
  }

  // Reset button click
  const handleResetFilters = () => {
    setSelectedGenres([])
    setSelectedSort('popularity.desc')
    setYearFrom('')
    setYearTo('')
    setMinRating('')
    setLanguage('')
    setCurrentPage(1)

    const resetFilters = {
      mediaType,
      genres: [],
      sort: 'popularity.desc',
      yearFrom: '',
      yearTo: '',
      minRating: '',
      language: '',
      page: 1,
    }
    setAppliedFilters(resetFilters)
    syncToUrl(resetFilters)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    const newFilters = { ...appliedFilters, page }
    setAppliedFilters(newFilters)
    syncToUrl(newFilters)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilters = Boolean(
    appliedFilters.genres.length > 0 ||
    appliedFilters.sort !== 'popularity.desc' ||
    appliedFilters.yearFrom ||
    appliedFilters.yearTo ||
    appliedFilters.minRating ||
    appliedFilters.language
  )

  const sortList = mediaType === 'tv' ? TV_SORT_OPTIONS : SORT_OPTIONS

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* DISCOVER HEADER                                                          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="pb-6 border-b border-cs-border space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-8 bg-cs-accent rounded-full shrink-0 shadow-cs-accent" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Compass className="text-cs-accent w-7 h-7 sm:w-8 sm:h-8" />
            <span>Discover</span>
          </h1>
        </div>
        <p className="text-sm text-cs-text-secondary ml-4.5 max-w-2xl leading-relaxed">
          Find the perfect movie or TV show with custom filters. Mix and match genres, release periods, ratings, and international languages.
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* FILTER CONTROL PANEL                                                     */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="bg-cs-card/80 border border-cs-border rounded-3xl p-5 sm:p-7 backdrop-blur-md shadow-cs space-y-6">
        {/* Row 1: Media Type & Sort & Apply / Reset buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-cs-border/80">
          {/* Media Type Toggle: Movies / TV */}
          <div className="flex items-center gap-2 p-1 bg-cs-bg-secondary rounded-xl border border-cs-border w-fit">
            <button
              type="button"
              onClick={() => handleMediaTypeChange('movie')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mediaType === 'movie'
                  ? 'bg-cs-accent text-cs-bg shadow-cs-accent shadow-sm'
                  : 'text-cs-text-secondary hover:text-white'
              }`}
            >
              <Film size={15} />
              <span>Movies</span>
            </button>
            <button
              type="button"
              onClick={() => handleMediaTypeChange('tv')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mediaType === 'tv'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-cs-text-secondary hover:text-white'
              }`}
            >
              <Tv size={15} />
              <span>TV Shows</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cs-bg-secondary hover:bg-cs-border/40 text-cs-text-secondary hover:text-white text-xs sm:text-sm font-semibold transition-all border border-cs-border"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cs-accent text-cs-bg text-xs sm:text-sm font-bold hover:bg-yellow-400 active:scale-95 transition-all shadow-cs-accent shadow-sm"
            >
              <Sliders size={15} className="stroke-[2.5]" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filters (Year Range, Min Rating, Language, Sort) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Sort By */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <ArrowUpDown size={13} className="text-cs-accent" />
              <span>Sort By</span>
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-3 py-2.5 bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/40 rounded-xl text-xs sm:text-sm font-medium text-cs-text focus:outline-none focus:border-cs-accent cursor-pointer"
            >
              {sortList.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Minimum Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Star size={13} className="text-cs-accent" />
              <span>Minimum Rating</span>
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2.5 bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/40 rounded-xl text-xs sm:text-sm font-medium text-cs-text focus:outline-none focus:border-cs-accent cursor-pointer"
            >
              {RATING_STEPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Year Range (From - To) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Calendar size={13} className="text-cs-accent" />
              <span>Year Range</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="From (1970)"
                min="1900"
                max={CURRENT_YEAR + 5}
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="w-1/2 px-3 py-2 bg-cs-bg-secondary border border-cs-border rounded-xl text-xs sm:text-sm text-cs-text placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-accent"
              />
              <span className="text-cs-text-secondary text-xs">—</span>
              <input
                type="number"
                placeholder={`To (${CURRENT_YEAR})`}
                min="1900"
                max={CURRENT_YEAR + 5}
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="w-1/2 px-3 py-2 bg-cs-bg-secondary border border-cs-border rounded-xl text-xs sm:text-sm text-cs-text placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-accent"
              />
            </div>
          </div>

          {/* 4. Language Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Globe2 size={13} className="text-cs-accent" />
              <span>Original Language</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/40 rounded-xl text-xs sm:text-sm font-medium text-cs-text focus:outline-none focus:border-cs-accent cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Genre Multi-Select Pills */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2.5">
            Select Genres ({selectedGenres.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {genreList.map((g) => {
              const isSelected = selectedGenres.includes(g.id.toString())
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGenreToggle(g.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-cs-accent text-cs-bg border-cs-accent font-bold shadow-cs-accent'
                      : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-border/80'
                  }`}
                >
                  {isSelected && <Check size={12} className="stroke-[3]" />}
                  <span>{g.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE FILTER SUMMARY & RESULTS STATS                                    */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">
            {appliedFilters.mediaType === 'tv' ? 'TV Shows' : 'Movies'} Found:
          </span>
          {!loading && (
            <span className="px-2.5 py-0.5 rounded-full bg-cs-card text-cs-accent text-xs font-bold border border-cs-border">
              {totalResults.toLocaleString()} titles
            </span>
          )}
        </div>

        {/* Active badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-cs-text-secondary font-semibold">Active:</span>

            {appliedFilters.genres.length > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-cs-card border border-cs-accent/40 text-cs-accent font-medium">
                {appliedFilters.genres.length} Genres
              </span>
            )}

            {appliedFilters.minRating && (
              <span className="px-2.5 py-1 rounded-md bg-cs-card border border-cs-accent/40 text-cs-accent font-medium">
                ★ {appliedFilters.minRating}+
              </span>
            )}

            {(appliedFilters.yearFrom || appliedFilters.yearTo) && (
              <span className="px-2.5 py-1 rounded-md bg-cs-card border border-cs-accent/40 text-cs-accent font-medium">
                {appliedFilters.yearFrom || 'Early'} - {appliedFilters.yearTo || CURRENT_YEAR}
              </span>
            )}

            {appliedFilters.language && (
              <span className="px-2.5 py-1 rounded-md bg-cs-card border border-cs-accent/40 text-cs-accent font-medium uppercase">
                Lang: {appliedFilters.language}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* RESULTS GRID & PAGINATION                                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {error ? (
        <ErrorState
          title="Discovery query failed"
          message={error}
          onRetry={executeDiscover}
          retryLabel="Try Again"
        />
      ) : (
        <div className="space-y-8">
          <MediaGrid
            items={results}
            mediaType={appliedFilters.mediaType}
            loading={loading}
            skeletonCount={18}
            columns={6}
            emptyTitle="No titles match your specific criteria"
            emptyMessage="Try selecting fewer genres, lowering the minimum rating, or broadening the release year range."
            emptyAction={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-cs-accent text-cs-bg font-bold text-sm hover:bg-yellow-400 active:scale-95 transition-all shadow-sm"
                >
                  Reset All Filters
                </button>
              ) : null
            }
          />

          {!loading && results.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Discover
