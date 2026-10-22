import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  Globe,
  Lock,
  Calendar,
  User,
  Plus,
  Trash2,
  Search,
  Share2,
  Film,
  Tv,
  ArrowLeft,
  Loader2,
  X,
  Check,
  Compass,
  Star,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getList,
  removeItemFromList,
  addItemToList,
  searchMulti,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebounce'
import { getPosterUrl, formatDate, formatYear } from '../utils/helpers'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ListDetail = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?._id || user?.id

  // List data state
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Item removal state
  const [itemToRemove, setItemToRemove] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  // Add Item Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [addingTmdbId, setAddingTmdbId] = useState(null)
  const searchContainerRef = useRef(null)

  const debouncedSearch = useDebouncedValue(searchQuery, 350)

  // Fetch list details
  const fetchListDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getList(listId)
      const data = res.data?.list || res.list
      setList(data)
    } catch (err) {
      setError(err.message || 'Failed to load list')
      toast.error(err.message || 'Failed to load list')
    } finally {
      setLoading(false)
    }
  }, [listId])

  useEffect(() => {
    fetchListDetails()
  }, [fetchListDetails])

  // Search when debounced search query changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    let isMounted = true
    const doSearch = async () => {
      try {
        setSearchLoading(true)
        const res = await searchMulti(debouncedSearch.trim())
        const hits = res.data?.results || res.results || []
        const filtered = hits.filter(
          (h) => h.media_type === 'movie' || h.media_type === 'tv'
        )
        if (isMounted) setSearchResults(filtered.slice(0, 8))
      } catch {
        if (isMounted) setSearchResults([])
      } finally {
        if (isMounted) setSearchLoading(false)
      }
    }

    doSearch()
    return () => {
      isMounted = false
    }
  }, [debouncedSearch])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Check if current user is owner
  const isOwner = Boolean(
    list &&
      currentUserId &&
      (list.userId?._id === currentUserId ||
        list.userId === currentUserId ||
        list.userId?.id === currentUserId)
  )

  // Handle Add Item to List
  const handleAddItem = async (hit) => {
    const mediaType = hit.media_type || (hit.first_air_date ? 'tv' : 'movie')
    const title = hit.title || hit.name
    const tmdbId = hit.id
    const posterPath = hit.poster_path
    const releaseDate = hit.release_date || hit.first_air_date

    // Check if item already in list
    if (list?.items?.some((i) => i.tmdbId === tmdbId && i.mediaType === mediaType)) {
      toast.error('This title is already in your list')
      return
    }

    try {
      setAddingTmdbId(tmdbId)
      const res = await addItemToList(listId, {
        tmdbId,
        mediaType,
        title,
        posterPath,
        releaseDate,
      })

      const updatedList = res.data?.list || res.list
      if (updatedList) {
        setList(updatedList)
      } else {
        await fetchListDetails()
      }

      toast.success(`Added "${title}" to list!`)
      setSearchQuery('')
      setIsSearchOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to add item to list')
    } finally {
      setAddingTmdbId(null)
    }
  }

  // Handle Confirm Remove Item
  const handleConfirmRemoveItem = async () => {
    if (!itemToRemove) return
    try {
      setRemoveLoading(true)
      const res = await removeItemFromList(listId, itemToRemove._id)
      const updatedList = res.data?.list || res.list
      if (updatedList) {
        setList(updatedList)
      } else {
        setList((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i._id !== itemToRemove._id),
        }))
      }
      toast.success(`Removed "${itemToRemove.title}" from list`)
      setItemToRemove(null)
    } catch (err) {
      toast.error(err.message || 'Failed to remove item')
    } finally {
      setRemoveLoading(false)
    }
  }

  // Handle Share List URL
  const handleShareList = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('List link copied to clipboard!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cs-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-cs-bg text-cs-text flex flex-col items-center justify-center px-4">
        <EmptyState
          icon={Lock}
          title="List Not Accessible"
          description={error || 'This custom list is private or does not exist.'}
          actionText="Back to Custom Lists"
          actionLink="/my-lists"
          actionIcon={ArrowLeft}
        />
      </div>
    )
  }

  const items = list.items || []
  const isPublic = list.visibility === 'public'
  const ownerName = list.userId?.name || 'CineScope Curator'

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/my-lists"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cs-text-secondary hover:text-cs-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Lists</span>
          </Link>
        </div>

        {/* List Header Hero */}
        <div className="bg-cs-card border border-cs-border rounded-2xl p-6 sm:p-8 mb-8 shadow-cs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isPublic
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                  }`}
                >
                  {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{isPublic ? 'Public List' : 'Private List'}</span>
                </span>

                <span className="text-xs text-cs-text-secondary">
                  Created {formatDate(list.createdAt)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cs-text">
                {list.title}
              </h1>

              {list.description && (
                <p className="text-sm sm:text-base text-cs-text-secondary mt-2 leading-relaxed">
                  {list.description}
                </p>
              )}

              {/* Owner and Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-cs-border/60 text-xs text-cs-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cs-accent text-cs-bg flex items-center justify-center font-bold text-xs uppercase">
                    {ownerName.charAt(0)}
                  </div>
                  <span className="font-semibold text-cs-text">{ownerName}</span>
                </div>
                <span>•</span>
                <span className="font-medium">
                  {items.length} {items.length === 1 ? 'title' : 'titles'} curated
                </span>
              </div>
            </div>

            {/* Quick Actions (Share / Add) */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleShareList}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cs-bg-secondary hover:bg-cs-card border border-cs-border hover:border-cs-accent/50 text-cs-text text-xs font-semibold transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Owner Controls: Add Movies Search Bar */}
        {isOwner && (
          <div className="bg-cs-card/80 border border-cs-border rounded-2xl p-5 mb-8 shadow-cs" ref={searchContainerRef}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cs-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-cs-text">
                  Add Movies or TV Shows to this List
                </h3>
              </div>
              <span className="text-[11px] text-cs-text-secondary">
                Search TMDB catalog
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-secondary" />
              <input
                type="text"
                placeholder="Type movie or TV show title to search and add..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                className="w-full pl-10 pr-10 py-3 bg-cs-bg-secondary border border-cs-border rounded-xl text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent focus:ring-1 focus:ring-cs-accent transition-all"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cs-accent" />
              )}
            </div>

            {/* Search Dropdown Results */}
            {isSearchOpen && (
              <div className="mt-2 bg-cs-bg-secondary border border-cs-border rounded-xl shadow-cs-lg overflow-hidden max-h-72 overflow-y-auto divide-y divide-cs-border/60">
                {searchResults.length > 0 ? (
                  searchResults.map((hit) => {
                    const title = hit.title || hit.name
                    const year = formatYear(hit.release_date || hit.first_air_date)
                    const isTv = hit.media_type === 'tv'
                    const alreadyAdded = items.some(
                      (i) => i.tmdbId === hit.id && i.mediaType === hit.media_type
                    )

                    return (
                      <div
                        key={`${hit.media_type}-${hit.id}`}
                        className="flex items-center justify-between p-3 hover:bg-cs-card transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-12 rounded bg-cs-card shrink-0 overflow-hidden border border-cs-border">
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
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-cs-text truncate">
                              {title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-cs-text-secondary">
                              <span className="uppercase text-[10px] font-bold text-cs-accent">
                                {isTv ? 'TV' : 'Movie'}
                              </span>
                              <span>•</span>
                              <span>{year || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddItem(hit)}
                          disabled={alreadyAdded || addingTmdbId === hit.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            alreadyAdded
                              ? 'bg-cs-bg-secondary text-cs-text-secondary cursor-not-allowed border border-cs-border'
                              : 'bg-cs-accent text-cs-bg hover:bg-yellow-400 active:scale-95 shadow-sm'
                          }`}
                        >
                          {addingTmdbId === hit.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : alreadyAdded ? (
                            <Check className="w-3.5 h-3.5 text-cs-success" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                          <span>{alreadyAdded ? 'In List' : 'Add'}</span>
                        </button>
                      </div>
                    )
                  })
                ) : debouncedSearch.trim() && !searchLoading ? (
                  <div className="p-4 text-center text-xs text-cs-text-secondary">
                    No matching titles found for "{debouncedSearch}"
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-cs-text-secondary">
                    Type a title to search and add to this list
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Grid of Curated Items */}
        <div>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {items.map((item) => {
                const isTv = item.mediaType === 'tv'
                const detailUrl = isTv ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`
                const posterUrl = getPosterUrl(item.posterPath, 'w342')
                const year = formatYear(item.releaseDate)

                return (
                  <div
                    key={item._id}
                    className="group relative flex flex-col bg-cs-card border border-cs-border hover:border-cs-accent/50 rounded-xl overflow-hidden shadow-cs hover:shadow-cs-lg transition-all duration-300"
                  >
                    {/* Poster Image */}
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
                            {isTv ? (
                              <Tv className="w-8 h-8 text-cs-text-secondary/50 mb-2" />
                            ) : (
                              <Film className="w-8 h-8 text-cs-text-secondary/50 mb-2" />
                            )}
                            <span className="text-xs text-cs-text-secondary line-clamp-2">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Top Type Badge */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md border ${
                            isTv
                              ? 'bg-blue-950/80 border-blue-500/40 text-blue-400'
                              : 'bg-black/60 border-white/10 text-cs-accent'
                          }`}
                        >
                          {isTv ? 'TV' : 'Movie'}
                        </span>
                      </div>

                      {/* Hover Overlay with Remove Action for Owner */}
                      <div className="absolute inset-0 bg-gradient-to-t from-cs-bg/95 via-cs-bg/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-auto">
                        <div className="flex justify-end">
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => setItemToRemove(item)}
                              title="Remove from List"
                              className="w-8 h-8 rounded-full bg-black/70 hover:bg-cs-error border border-white/20 hover:border-cs-error text-white flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <Link
                          to={detailUrl}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cs-accent text-cs-bg font-bold text-xs shadow-cs-accent hover:brightness-110 active:scale-95 transition-all"
                        >
                          <span>View Details</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>

                    {/* Metadata below poster */}
                    <div className="p-3">
                      <Link
                        to={detailUrl}
                        className="block text-sm font-semibold text-cs-text hover:text-cs-accent transition-colors line-clamp-1"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      <span className="text-xs text-cs-text-secondary block mt-0.5">
                        {year || '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Film}
              title="This list is empty"
              description={
                isOwner
                  ? 'Start adding titles using the search bar above to build your curation!'
                  : 'The curator has not added any movies or shows to this collection yet.'
              }
            />
          )}
        </div>
      </div>

      {/* Remove Item Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToRemove)}
        title="Remove Title from List"
        message={`Are you sure you want to remove "${itemToRemove?.title}" from this custom list?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        loading={removeLoading}
        onConfirm={handleConfirmRemoveItem}
        onCancel={() => setItemToRemove(null)}
      />
    </div>
  )
}

export default ListDetail
