import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Film, Tv, Users, Clapperboard, Sparkles, User, ExternalLink, X } from 'lucide-react'
import { searchMulti } from '../services/movieService'
import { getProfileUrl } from '../utils/helpers'
import MediaGrid from '../components/movies/MediaGrid'
import Pagination from '../components/common/Pagination'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import SkeletonCard from '../components/movies/SkeletonCard'

const TABS = [
  { id: 'multi', label: 'All', icon: Sparkles },
  { id: 'movie', label: 'Movies', icon: Film },
  { id: 'tv', label: 'TV Shows', icon: Tv },
  { id: 'person', label: 'People', icon: Users },
]

const POPULAR_SEARCH_SUGGESTIONS = [
  'Oppenheimer',
  'Dune: Part Two',
  'Interstellar',
  'Breaking Bad',
  'The Batman',
  'Stranger Things',
  'Christopher Nolan',
  'Succession',
]

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') || ''
  const tabFromUrl = searchParams.get('type') || 'multi'
  const pageFromUrl = parseInt(searchParams.get('page')) || 1

  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [searchInput, setSearchInput] = useState(query)

  const [results, setResults] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sync state if URL search params change
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const t = searchParams.get('type') || 'multi'
    const p = parseInt(searchParams.get('page')) || 1

    setSearchInput(q)
    setActiveTab(t)
    setCurrentPage(p)
  }, [searchParams])

  // Perform search query
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      setTotalPages(1)
      setTotalResults(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await searchMulti(query.trim(), currentPage, activeTab)
      const data = res?.data || res || {}
      setResults(data.results || [])
      setTotalPages(data.total_pages || 1)
      setTotalResults(data.total_results || 0)
    } catch (err) {
      console.error('Search failed:', err)
      setError(err?.message || 'Search request failed. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }, [query, currentPage, activeTab])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  // Submit search from local input
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return

    const newParams = new URLSearchParams()
    newParams.set('q', searchInput.trim())
    newParams.set('type', activeTab)
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  // Handle clicking quick suggestion
  const handleQuickSuggestion = (suggestion) => {
    setSearchInput(suggestion)
    const newParams = new URLSearchParams()
    newParams.set('q', suggestion)
    newParams.set('type', activeTab)
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  // Handle tab switch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setCurrentPage(1)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('type', tabId)
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Separate people vs media when on 'multi' tab
  const mediaResults = activeTab === 'person' ? [] : results.filter((item) => item.media_type !== 'person')
  const personResults = activeTab === 'person' ? results : results.filter((item) => item.media_type === 'person')

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SEARCH HEADER & BAR                                                      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
          <Clapperboard className="text-cs-accent w-8 h-8 sm:w-9 sm:h-9" />
          <span>Search CineScope</span>
        </h1>
        <p className="text-xs sm:text-sm text-cs-text-secondary">
          Find movies, television series, directors, actors, and creative talent
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative mt-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-cs-text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for movies, TV series, actors, directors..."
              className="w-full pl-12 pr-28 py-3.5 bg-cs-card border border-cs-border hover:border-cs-accent/50 focus:border-cs-accent rounded-2xl text-cs-text placeholder-cs-text-secondary/60 text-sm sm:text-base focus:outline-none transition-all shadow-cs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-20 text-cs-text-secondary hover:text-white p-1"
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2.5 px-4 py-2 rounded-xl bg-cs-accent text-cs-bg font-bold text-xs sm:text-sm hover:bg-yellow-400 active:scale-95 transition-all shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* INITIAL STATE (WHEN NO QUERY IS GIVEN)                                   */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {!query.trim() && (
        <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-cs-card/40 border border-cs-border/80 backdrop-blur-sm space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-cs-text">
              Popular Searches & Trending Titles
            </h3>
            <p className="text-xs sm:text-sm text-cs-text-secondary max-w-md mx-auto">
              Select one of our popular inquiries or type any movie title in the search box above.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {POPULAR_SEARCH_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickSuggestion(tag)}
                  className="px-3.5 py-1.5 rounded-full bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/50 hover:text-cs-accent text-xs font-medium text-cs-text-secondary transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* RESULTS DISPLAY                                                          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {query.trim() && (
        <div className="space-y-6">
          {/* Tabs & Result Count Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cs-border">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                      isActive
                        ? 'bg-cs-accent text-cs-bg shadow-cs-accent shadow-sm font-bold'
                        : 'bg-cs-card/60 text-cs-text-secondary hover:text-cs-text hover:bg-cs-card border border-cs-border'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'stroke-[2.5]' : ''} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Result count */}
            {!loading && (
              <div className="text-xs sm:text-sm text-cs-text-secondary">
                <span>Results for </span>
                <span className="font-bold text-white">"{query}"</span>
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-cs-card border border-cs-border text-cs-accent text-xs font-semibold">
                  {totalResults.toLocaleString()} found
                </span>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <ErrorState
              title="Search failed"
              message={error}
              onRetry={performSearch}
              retryLabel="Retry Search"
            />
          )}

          {/* Empty State */}
          {!loading && !error && results.length === 0 && (
            <EmptyState
              icon={Search}
              title={`No results found for "${query}"`}
              description="We couldn't find any matches. Please verify spelling, try different keywords, or broaden your search."
              actionLabel="Clear Search"
              onAction={() => setSearchParams({})}
            >
              <div className="mt-4 pt-4 border-t border-cs-border/60 w-full text-center">
                <span className="text-xs text-cs-text-secondary block mb-2 font-semibold">
                  Try searching for:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCH_SUGGESTIONS.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleQuickSuggestion(s)}
                      className="text-xs px-2.5 py-1 rounded-md bg-cs-bg-secondary border border-cs-border text-cs-accent hover:border-cs-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </EmptyState>
          )}

          {/* Media & People Results */}
          {!error && (
            <div className="space-y-8">
              {/* 1. If tab is 'person', render People Grid */}
              {activeTab === 'person' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {loading
                    ? Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={`person-skeleton-${i}`}
                          className="h-64 rounded-2xl bg-cs-card skeleton border border-cs-border"
                        />
                      ))
                    : results.map((person) => {
                        const profileUrl = getProfileUrl(person.profile_path, 'w185')
                        return (
                          <div
                            key={person.id}
                            className="group relative flex flex-col rounded-2xl overflow-hidden bg-cs-card border border-cs-border hover:border-cs-accent/50 shadow-cs hover:shadow-cs-lg transition-all"
                          >
                            <div className="relative aspect-[3/4] bg-cs-bg-secondary overflow-hidden">
                              {profileUrl ? (
                                <img
                                  src={profileUrl}
                                  alt={person.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-cs-text-secondary bg-cs-bg-secondary">
                                  <User size={36} className="opacity-40 mb-1" />
                                  <span className="text-[10px]">No Photo</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            </div>

                            <div className="p-3">
                              <h3
                                title={person.name}
                                className="font-bold text-sm text-cs-text truncate group-hover:text-cs-accent transition-colors"
                              >
                                {person.name}
                              </h3>
                              <p className="text-[11px] text-cs-text-secondary mt-0.5 truncate">
                                {person.known_for_department || 'Artist'}
                              </p>
                              {person.known_for?.length > 0 && (
                                <p className="text-[10px] text-cs-text-secondary/70 mt-1 truncate">
                                  {person.known_for.map((k) => k.title || k.name).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                </div>
              )}

              {/* 2. If tab is 'movie', 'tv', or 'multi' */}
              {activeTab !== 'person' && (
                <>
                  {/* Media Grid */}
                  <MediaGrid
                    items={mediaResults}
                    mediaType={activeTab === 'tv' ? 'tv' : activeTab === 'movie' ? 'movie' : 'mixed'}
                    loading={loading}
                    skeletonCount={18}
                    columns={6}
                    emptyTitle={personResults.length > 0 ? '' : 'No titles found'}
                  />

                  {/* If in 'multi' tab and people were returned, show People strip */}
                  {activeTab === 'multi' && personResults.length > 0 && !loading && (
                    <div className="pt-6 border-t border-cs-border space-y-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-cs-accent" />
                        <h2 className="text-lg font-bold text-white">
                          People ({personResults.length})
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {personResults.slice(0, 6).map((person) => {
                          const profileUrl = getProfileUrl(person.profile_path, 'w185')
                          return (
                            <div
                              key={`multi-person-${person.id}`}
                              className="p-3 rounded-xl bg-cs-card border border-cs-border flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-cs-bg-secondary shrink-0 overflow-hidden border border-cs-border">
                                {profileUrl ? (
                                  <img
                                    src={profileUrl}
                                    alt={person.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-cs-text-secondary">
                                    <User size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">
                                  {person.name}
                                </p>
                                <p className="text-[10px] text-cs-text-secondary truncate">
                                  {person.known_for_department || 'Artist'}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
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
      )}
    </div>
  )
}

export default SearchResults
