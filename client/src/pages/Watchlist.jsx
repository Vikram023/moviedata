import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Film,
  Tv,
  Search,
  SlidersHorizontal,
  Trash2,
  ArrowUpDown,
  Compass,
  Star,
  ExternalLink,
  Check,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getWatchlist,
  removeFromWatchlist,
  updateWatchlistEntry,
} from '../services/movieService'
import { getPosterUrl, formatYear, formatRating, getRatingColor } from '../utils/helpers'
import RatingBadge from '../components/movies/RatingBadge'
import SkeletonCard from '../components/movies/SkeletonCard'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'

const Watchlist = () => {
  // Tab state: 'planned' (Want to Watch) | 'watched' (Watched)
  const [activeTab, setActiveTab] = useState('planned')

  // Filter & Search states
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all') // 'all' | 'movie' | 'tv'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'title-asc' | 'rating-desc'

  // Data states
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  // Remove confirmation modal
  const [itemToRemove, setItemToRemove] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  // Fetch watchlist data
  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch all items for the user so client can quickly switch tabs, filter, and sort
      const res = await getWatchlist({ limit: 100 })
      const data = res.data?.items || res.items || []
      setItems(data)
    } catch (err) {
      toast.error(err.message || 'Failed to load your watchlist')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  // Count metrics for tabs
  const plannedCount = useMemo(
    () => items.filter((i) => (i.status || 'planned') === 'planned').length,
    [items]
  )
  const watchedCount = useMemo(
    () => items.filter((i) => i.status === 'watched').length,
    [items]
  )

  // Handle Mark as Watched
  const handleMarkAsWatched = async (entry) => {
    try {
      setUpdatingId(entry._id)
      await updateWatchlistEntry(entry._id, { status: 'watched' })
      setItems((prev) =>
        prev.map((i) =>
          i._id === entry._id
            ? { ...i, status: 'watched', watchedAt: new Date().toISOString() }
            : i
        )
      )
      toast.success(`Marked "${entry.title}" as Watched!`)
    } catch (err) {
      toast.error(err.message || 'Failed to update entry')
    } finally {
      setUpdatingId(null)
    }
  }

  // Handle Move back to Planned
  const handleMoveToPlanned = async (entry) => {
    try {
      setUpdatingId(entry._id)
      await updateWatchlistEntry(entry._id, { status: 'planned' })
      setItems((prev) =>
        prev.map((i) =>
          i._id === entry._id ? { ...i, status: 'planned', watchedAt: null } : i
        )
      )
      toast.success(`Moved "${entry.title}" back to Want to Watch`)
    } catch (err) {
      toast.error(err.message || 'Failed to update entry')
    } finally {
      setUpdatingId(null)
    }
  }

  // Confirm and Execute Remove
  const handleConfirmRemove = async () => {
    if (!itemToRemove) return
    try {
      setRemoveLoading(true)
      await removeFromWatchlist(itemToRemove._id)
      setItems((prev) => prev.filter((i) => i._id !== itemToRemove._id))
      toast.success(`Removed "${itemToRemove.title}" from watchlist`)
      setItemToRemove(null)
    } catch (err) {
      toast.error(err.message || 'Failed to remove from watchlist')
    } finally {
      setRemoveLoading(false)
    }
  }

  // Filtered and Sorted list
  const displayItems = useMemo(() => {
    return items
      .filter((item) => {
        // Tab filter (planned vs watched)
        const itemStatus = item.status || 'planned'
        if (itemStatus !== activeTab) return false

        // Media type filter
        if (mediaTypeFilter !== 'all' && item.mediaType !== mediaTypeFilter) {
          return false
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          return item.title?.toLowerCase().includes(q)
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.addedAt || b.createdAt || 0) - new Date(a.addedAt || a.createdAt || 0)
        }
        if (sortBy === 'date-asc') {
          return new Date(a.addedAt || a.createdAt || 0) - new Date(b.addedAt || b.createdAt || 0)
        }
        if (sortBy === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '')
        }
        if (sortBy === 'rating-desc') {
          const ratingA = a.externalRating || a.voteAverage || 0
          const ratingB = b.externalRating || b.voteAverage || 0
          return ratingB - ratingA
        }
        return 0
      })
  }, [items, activeTab, mediaTypeFilter, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-16 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cs-border">
          <div>
            <div className="flex items-center gap-2.5 text-cs-accent mb-1.5">
              <Bookmark className="w-6 h-6 fill-cs-accent" />
              <span className="text-xs uppercase tracking-widest font-bold">Personal Library</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cs-text">
              My Watchlist
            </h1>
            <p className="text-sm sm:text-base text-cs-text-secondary mt-1">
              Organize, track, and curate the stories you love and want to experience.
            </p>
          </div>

          {/* Quick tab metrics banner */}
          <div className="flex items-center gap-3">
            <div className="bg-cs-card border border-cs-border rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-cs-text-secondary block">Total Saved</span>
                <span className="text-lg font-bold text-cs-text">{items.length}</span>
              </div>
              <div className="w-px h-8 bg-cs-border" />
              <div className="text-left">
                <span className="text-xs text-cs-text-secondary block">Watched</span>
                <span className="text-lg font-bold text-cs-accent">{watchedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-cs-border">
          <button
            type="button"
            onClick={() => setActiveTab('planned')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm sm:text-base font-semibold border-b-2 transition-all relative ${
              activeTab === 'planned'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Want to Watch</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'planned'
                  ? 'bg-cs-accent/20 text-cs-accent font-bold'
                  : 'bg-cs-card text-cs-text-secondary'
              }`}
            >
              {plannedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watched')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm sm:text-base font-semibold border-b-2 transition-all relative ${
              activeTab === 'watched'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Watched</span>
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'watched'
                  ? 'bg-cs-accent/20 text-cs-accent font-bold'
                  : 'bg-cs-card text-cs-text-secondary'
              }`}
            >
              {watchedCount}
            </span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="mt-6 p-4 rounded-xl bg-cs-card/70 border border-cs-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search within watchlist */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-secondary" />
            <input
              type="text"
              placeholder={`Search within ${activeTab === 'planned' ? 'planned titles' : 'watched history'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cs-bg-secondary border border-cs-border rounded-lg text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent focus:ring-1 focus:ring-cs-accent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cs-text-secondary hover:text-cs-text"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Media Type Filter */}
            <div className="flex items-center bg-cs-bg-secondary border border-cs-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMediaTypeFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mediaTypeFilter === 'all'
                    ? 'bg-cs-accent text-cs-bg shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter('movie')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mediaTypeFilter === 'movie'
                    ? 'bg-cs-accent text-cs-bg shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Movies</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter('tv')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mediaTypeFilter === 'tv'
                    ? 'bg-cs-accent text-cs-bg shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>TV Shows</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-cs-bg-secondary border border-cs-border rounded-lg px-3 py-1.5 text-xs text-cs-text-secondary">
              <ArrowUpDown className="w-3.5 h-3.5 text-cs-accent" />
              <span className="hidden sm:inline font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-cs-text font-medium focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-cs-card text-cs-text">Date Added (Newest)</option>
                <option value="date-asc" className="bg-cs-card text-cs-text">Date Added (Oldest)</option>
                <option value="title-asc" className="bg-cs-card text-cs-text">Title (A - Z)</option>
                <option value="rating-desc" className="bg-cs-card text-cs-text">Rating (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <SkeletonCard key={idx} size="full" />
              ))}
            </div>
          ) : displayItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {displayItems.map((item) => {
                const isMovie = item.mediaType === 'movie'
                const detailUrl = isMovie ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`
                const posterUrl = getPosterUrl(item.posterPath, 'w342')
                const year = formatYear(item.releaseDate)
                const rating = item.externalRating || item.voteAverage

                return (
                  <div
                    key={item._id}
                    className="group relative flex flex-col bg-cs-card border border-cs-border hover:border-cs-accent/50 rounded-xl overflow-hidden shadow-cs hover:shadow-cs-lg transition-all duration-300"
                  >
                    {/* Poster & Badges Container */}
                    <div className="relative aspect-[2/3] w-full bg-cs-bg-secondary overflow-hidden">
                      <Link to={detailUrl} className="block w-full h-full">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-cs-bg-secondary">
                            {isMovie ? (
                              <Film className="w-8 h-8 text-cs-text-secondary/50 mb-2" />
                            ) : (
                              <Tv className="w-8 h-8 text-cs-text-secondary/50 mb-2" />
                            )}
                            <span className="text-xs text-cs-text-secondary line-clamp-2">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Top Badges */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                        {rating ? (
                          <RatingBadge rating={rating} size="xs" />
                        ) : (
                          <div />
                        )}

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md border ${
                            isMovie
                              ? 'bg-black/60 border-white/10 text-cs-accent'
                              : 'bg-blue-950/80 border-blue-500/40 text-blue-400'
                          }`}
                        >
                          {isMovie ? 'Movie' : 'TV'}
                        </span>
                      </div>

                      {/* Hover Overlay with Quick Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-cs-bg/95 via-cs-bg/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-auto">
                        {/* Remove Action (Top right) */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setItemToRemove(item)}
                            title="Remove from Watchlist"
                            className="w-8 h-8 rounded-full bg-black/70 hover:bg-cs-error border border-white/20 hover:border-cs-error text-white flex items-center justify-center transition-all duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bottom Actions inside hover */}
                        <div className="space-y-1.5">
                          {activeTab === 'planned' ? (
                            <button
                              type="button"
                              onClick={() => handleMarkAsWatched(item)}
                              disabled={updatingId === item._id}
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-cs-accent text-cs-bg font-bold text-xs shadow-cs-accent hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Mark as Watched</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMoveToPlanned(item)}
                              disabled={updatingId === item._id}
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-cs-card border border-cs-border hover:border-cs-accent text-cs-text hover:text-cs-accent font-semibold text-xs transition-all disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Move to Planned</span>
                            </button>
                          )}

                          <Link
                            to={detailUrl}
                            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-cs-text text-[11px] font-medium border border-white/10 transition-colors"
                          >
                            <span>Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Meta info below poster */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={detailUrl}
                          className="block text-sm font-semibold text-cs-text hover:text-cs-accent transition-colors line-clamp-1"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center justify-between text-xs text-cs-text-secondary mt-1">
                          <span>{year || '—'}</span>
                          {item.status === 'watched' ? (
                            <span className="text-[10px] text-cs-success font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Watched
                            </span>
                          ) : (
                            <span className="text-[10px] text-cs-accent font-semibold flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> Planned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <EmptyState
              icon={activeTab === 'planned' ? Bookmark : CheckCircle2}
              title={
                searchQuery
                  ? 'No matching titles found'
                  : activeTab === 'planned'
                  ? 'Your watchlist is empty'
                  : 'No watched history yet'
              }
              description={
                searchQuery
                  ? `No titles matched "${searchQuery}". Try adjusting your search or filters.`
                  : activeTab === 'planned'
                  ? 'Save movies and series you want to watch next. Explore popular and trending titles to get started!'
                  : 'Titles you mark as watched will appear here. Track your viewing milestones effortlessly.'
              }
              actionText="Discover Movies"
              actionLink="/discover"
              actionIcon={Compass}
            />
          )}
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToRemove)}
        title="Remove from Watchlist"
        message={`Are you sure you want to remove "${itemToRemove?.title}" from your watchlist?`}
        confirmText="Remove"
        cancelText="Keep"
        variant="danger"
        loading={removeLoading}
        onConfirm={handleConfirmRemove}
        onCancel={() => setItemToRemove(null)}
      />
    </div>
  )
}

export default Watchlist
