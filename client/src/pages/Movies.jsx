import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, RotateCcw, Film, Calendar, Star, ArrowUpDown, X } from 'lucide-react'
import { discoverMovies, getGenres } from '../services/movieService'
import MediaGrid from '../components/movies/MediaGrid'
import Pagination from '../components/common/Pagination'
import ErrorState from '../components/common/ErrorState'

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
  { label: 'Newest First', value: 'release_date.desc' },
  { label: 'Oldest First', value: 'release_date.asc' },
]

const YEAR_OPTIONS = [
  { label: 'All Years', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2020-2029', value: '2020s' },
  { label: '2010-2019', value: '2010s' },
  { label: '2000-2009', value: '2000s' },
  { label: '1990-1999', value: '1990s' },
  { label: 'Classic (Before 1990)', value: 'pre-1990' },
]

const RATING_OPTIONS = [
  { label: 'Any Rating', value: '' },
  { label: '6.0+ Star', value: '6' },
  { label: '7.0+ Star', value: '7' },
  { label: '8.0+ High Acclaim', value: '8' },
]

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial values from URL query string if present
  const genreFromUrl = searchParams.get('genre') || ''
  const sortFromUrl = searchParams.get('sort') || 'popularity.desc'
  const yearFromUrl = searchParams.get('year') || ''
  const ratingFromUrl = searchParams.get('rating') || ''
  const pageFromUrl = parseInt(searchParams.get('page')) || 1

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState(genreFromUrl)
  const [selectedSort, setSelectedSort] = useState(sortFromUrl)
  const [selectedYear, setSelectedYear] = useState(yearFromUrl)
  const [selectedRating, setSelectedRating] = useState(ratingFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)

  // Mobile drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Data states
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1. Fetch available genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getGenres('movie')
        const genreList = res?.data?.genres || res?.genres || []
        setGenres(genreList)
      } catch (err) {
        console.error('Failed to fetch movie genres:', err)
      }
    }
    fetchGenres()
  }, [])

  // Keep internal state in sync if URL params change externally
  useEffect(() => {
    setSelectedGenre(searchParams.get('genre') || '')
    setSelectedSort(searchParams.get('sort') || 'popularity.desc')
    setSelectedYear(searchParams.get('year') || '')
    setSelectedRating(searchParams.get('rating') || '')
    setCurrentPage(parseInt(searchParams.get('page')) || 1)
  }, [searchParams])

  // 2. Fetch movies when filters or page change
  const fetchMovies = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Build API query payload
    const params = {
      page: currentPage,
      sort_by: selectedSort,
    }

    if (selectedGenre) {
      params.with_genres = selectedGenre
    }

    if (selectedRating) {
      params['vote_average.gte'] = selectedRating
      params['vote_count.gte'] = 50 // Avoid outliers with 1 vote
    }

    // Handle year ranges
    if (selectedYear) {
      if (selectedYear === '2020s') {
        params['primary_release_date.gte'] = '2020-01-01'
        params['primary_release_date.lte'] = '2029-12-31'
      } else if (selectedYear === '2010s') {
        params['primary_release_date.gte'] = '2010-01-01'
        params['primary_release_date.lte'] = '2019-12-31'
      } else if (selectedYear === '2000s') {
        params['primary_release_date.gte'] = '2000-01-01'
        params['primary_release_date.lte'] = '2009-12-31'
      } else if (selectedYear === '1990s') {
        params['primary_release_date.gte'] = '1990-01-01'
        params['primary_release_date.lte'] = '1999-12-31'
      } else if (selectedYear === 'pre-1990') {
        params['primary_release_date.lte'] = '1989-12-31'
      } else {
        // Specific year e.g. '2024'
        params['primary_release_date.gte'] = `${selectedYear}-01-01`
        params['primary_release_date.lte'] = `${selectedYear}-12-31`
      }
    }

    try {
      const res = await discoverMovies(params)
      const data = res?.data || res || {}
      setMovies(data.results || [])
      setTotalPages(data.total_pages || 1)
      setTotalResults(data.total_results || 0)
    } catch (err) {
      console.error('Failed to discover movies:', err)
      setError(err?.message || 'Failed to load movies. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedGenre, selectedSort, selectedYear, selectedRating])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  // Update URL search params helper
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    setSearchParams(newParams)
  }

  // Filter handlers
  const handleGenreChange = (genreId) => {
    const val = genreId === selectedGenre ? '' : genreId
    setSelectedGenre(val)
    setCurrentPage(1)
    updateParams({ genre: val, page: '1' })
  }

  const handleSortChange = (e) => {
    const val = e.target.value
    setSelectedSort(val)
    setCurrentPage(1)
    updateParams({ sort: val, page: '1' })
  }

  const handleYearChange = (e) => {
    const val = e.target.value
    setSelectedYear(val)
    setCurrentPage(1)
    updateParams({ year: val, page: '1' })
  }

  const handleRatingChange = (val) => {
    const nextVal = selectedRating === val ? '' : val
    setSelectedRating(nextVal)
    setCurrentPage(1)
    updateParams({ rating: nextVal, page: '1' })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    updateParams({ page: page.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setSelectedGenre('')
    setSelectedSort('popularity.desc')
    setSelectedYear('')
    setSelectedRating('')
    setCurrentPage(1)
    setSearchParams({})
  }

  const hasActiveFilters = Boolean(
    selectedGenre ||
    selectedSort !== 'popularity.desc' ||
    selectedYear ||
    selectedRating
  )

  // Current selected genre object
  const currentGenreObj = genres.find((g) => g.id.toString() === selectedGenre?.toString())

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* PAGE HEADER                                                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b border-cs-border gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-7 sm:h-8 bg-cs-accent rounded-full shrink-0 shadow-cs-accent" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Movies
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-cs-text-secondary mt-1 ml-4.5">
            {currentGenreObj
              ? `Browsing ${currentGenreObj.name} cinema`
              : 'Explore the vast universe of global cinema, curated releases, and timeless classics'}
            {totalResults > 0 && !loading && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-cs-card text-cs-accent text-xs font-semibold border border-cs-border">
                {totalResults.toLocaleString()} titles
              </span>
            )}
          </p>
        </div>

        {/* Mobile Filter Button & Quick Sort */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cs-card border border-cs-border hover:border-cs-accent/50 text-cs-text text-sm font-semibold transition-all active:scale-95 shadow-sm"
          >
            <SlidersHorizontal size={16} className="text-cs-accent" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-cs-accent animate-pulse" />
            )}
          </button>

          {/* Quick Sort Dropdown on Top */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-cs-text-secondary">
              <ArrowUpDown size={14} />
            </div>
            <select
              value={selectedSort}
              onChange={handleSortChange}
              className="pl-9 pr-8 py-2.5 bg-cs-card border border-cs-border hover:border-cs-accent/40 rounded-xl text-xs sm:text-sm font-medium text-cs-text focus:outline-none focus:border-cs-accent cursor-pointer transition-colors appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* MAIN LAYOUT: SIDEBAR + GRID                                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR (col-span-1) */}
        <aside className="hidden lg:block lg:col-span-1 bg-cs-card/70 border border-cs-border rounded-2xl p-5 sticky top-24 space-y-6 backdrop-blur-sm shadow-cs">
          <div className="flex items-center justify-between pb-3 border-b border-cs-border">
            <div className="flex items-center gap-2 text-cs-text font-bold text-base">
              <Filter size={18} className="text-cs-accent" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-cs-text-secondary hover:text-cs-accent transition-colors font-medium"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Genre filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-3">
              Genres
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleGenreChange('')}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                  !selectedGenre
                    ? 'bg-cs-accent text-cs-bg border-cs-accent font-bold shadow-cs-accent'
                    : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-border/80'
                }`}
              >
                All Genres
              </button>
              {genres.map((g) => {
                const isActive = selectedGenre === g.id.toString()
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGenreChange(g.id.toString())}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                      isActive
                        ? 'bg-cs-accent text-cs-bg border-cs-accent font-bold shadow-cs-accent'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-border/80'
                    }`}
                  >
                    {g.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Release Year Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Release Period</span>
            </label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full px-3 py-2 bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/40 rounded-xl text-xs font-medium text-cs-text focus:outline-none focus:border-cs-accent cursor-pointer"
            >
              {YEAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Minimum Rating Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2 flex items-center gap-1.5">
              <Star size={13} className="text-cs-accent" />
              <span>Minimum Rating</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RATING_OPTIONS.map((opt) => {
                const isActive = selectedRating === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleRatingChange(opt.value)}
                    className={`text-xs px-2.5 py-2 rounded-xl border font-medium transition-all text-center ${
                      isActive
                        ? 'bg-cs-accent/20 border-cs-accent text-cs-accent font-bold shadow-cs-accent'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ──────────────────────────────────────────────────────────────────────── */}
        {/* MOVIE GRID CONTENT (col-span-3)                                          */}
        {/* ──────────────────────────────────────────────────────────────────────── */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active filter pills bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-cs-card/50 border border-cs-border">
              <span className="text-xs text-cs-text-secondary font-semibold">Active:</span>

              {selectedGenre && currentGenreObj && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cs-bg-secondary border border-cs-accent/40 text-xs font-medium text-cs-accent">
                  <span>{currentGenreObj.name}</span>
                  <button
                    type="button"
                    onClick={() => handleGenreChange(selectedGenre)}
                    className="hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedYear && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cs-bg-secondary border border-cs-accent/40 text-xs font-medium text-cs-accent">
                  <span>Year: {selectedYear}</span>
                  <button
                    type="button"
                    onClick={() => handleYearChange({ target: { value: '' } })}
                    className="hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedRating && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cs-bg-secondary border border-cs-accent/40 text-xs font-medium text-cs-accent">
                  <span>Rating: {selectedRating}+</span>
                  <button
                    type="button"
                    onClick={() => handleRatingChange('')}
                    className="hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-cs-text-secondary hover:text-cs-accent underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Error State */}
          {error ? (
            <ErrorState
              title="Failed to load movies"
              message={error}
              onRetry={fetchMovies}
              retryLabel="Try Again"
            />
          ) : (
            <>
              {/* Media Grid */}
              <MediaGrid
                items={movies}
                mediaType="movie"
                loading={loading}
                skeletonCount={18}
                columns={5}
                emptyTitle="No movies match your criteria"
                emptyMessage="Try broadening your genre, year, or rating filters to discover more titles."
                emptyAction={
                  hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-lg bg-cs-accent text-cs-bg text-sm font-semibold hover:bg-yellow-400 active:scale-95 transition-all"
                    >
                      Reset All Filters
                    </button>
                  ) : null
                }
              />

              {/* Pagination */}
              {!loading && movies.length > 0 && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE FILTER DRAWER                                                     */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="w-full max-w-sm h-full bg-cs-card border-l border-cs-border flex flex-col p-6 overflow-y-auto animate-slide-left">
            <div className="flex items-center justify-between pb-4 border-b border-cs-border mb-6">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <SlidersHorizontal size={20} className="text-cs-accent" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-cs-bg-secondary text-cs-text-secondary hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content inside drawer */}
            <div className="space-y-6 flex-1">
              {/* Genres */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-3">
                  Genres
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleGenreChange('')}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                      !selectedGenre
                        ? 'bg-cs-accent text-cs-bg border-cs-accent font-bold'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                    }`}
                  >
                    All Genres
                  </button>
                  {genres.map((g) => {
                    const isActive = selectedGenre === g.id.toString()
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGenreChange(g.id.toString())}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          isActive
                            ? 'bg-cs-accent text-cs-bg border-cs-accent font-bold'
                            : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                        }`}
                      >
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2">
                  Release Period
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2.5 bg-cs-bg-secondary border border-cs-border rounded-xl text-sm font-medium text-cs-text"
                >
                  {YEAR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-2">
                  Minimum Rating
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RATING_OPTIONS.map((opt) => {
                    const isActive = selectedRating === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleRatingChange(opt.value)}
                        className={`text-xs px-2.5 py-2.5 rounded-xl border font-medium text-center ${
                          isActive
                            ? 'bg-cs-accent/20 border-cs-accent text-cs-accent font-bold'
                            : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-6 border-t border-cs-border flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-3 rounded-xl bg-cs-bg-secondary border border-cs-border text-cs-text text-sm font-semibold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 rounded-xl bg-cs-accent text-cs-bg text-sm font-bold shadow-cs-accent"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Movies
