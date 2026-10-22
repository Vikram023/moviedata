import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Star,
  Repeat,
  Film,
  Tv,
  Disc,
  Radio,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Loader2,
  TrendingUp,
  BarChart3,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getDiaryEntries, getDiaryStats, deleteDiaryEntry } from '../services/movieService'
import { getPosterUrl } from '../utils/helpers'
import LogToDiaryModal from '../components/diary/LogToDiaryModal'

const METHOD_ICONS = {
  theater: { label: 'Cinema', icon: Film, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  streaming: { label: 'Streaming', icon: Tv, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  physical_media: { label: 'Blu-ray', icon: Disc, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  tv: { label: 'Cable TV', icon: Radio, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  other: { label: 'Other', icon: Film, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
}

const Diary = () => {
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Filters & Pagination
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedRewatch, setSelectedRewatch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0)

  // Edit / Log Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  // Fetch Stats from MongoDB Aggregations
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await getDiaryStats(selectedYear || undefined)
      setStats(res.data)
    } catch {
      // Non-critical error
    } finally {
      setStatsLoading(false)
    }
  }, [selectedYear])

  // Fetch Diary Entries from MongoDB
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 15,
        ...(selectedYear && { year: selectedYear }),
        ...(selectedMethod !== 'all' && { watchMethod: selectedMethod }),
        ...(selectedRewatch !== '' && { isRewatch: selectedRewatch }),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      }
      const res = await getDiaryEntries(params)
      setEntries(res.data.entries || [])
      setTotalPages(res.data.totalPages || 1)
      setTotalEntries(res.data.total || 0)
    } catch (err) {
      toast.error(err.message || 'Failed to load diary entries')
    } finally {
      setLoading(false)
    }
  }, [page, selectedYear, selectedMethod, selectedRewatch, searchQuery])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Reset page when filters change
  const handleYearChange = (year) => {
    setSelectedYear(year)
    setPage(1)
  }

  const handleMethodChange = (method) => {
    setSelectedMethod(method)
    setPage(1)
  }

  const handleRewatchChange = (val) => {
    setSelectedRewatch(val)
    setPage(1)
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove "${title}" from your diary?`)) return
    try {
      await deleteDiaryEntry(id)
      toast.success('Diary entry removed')
      fetchEntries()
      fetchStats()
    } catch (err) {
      toast.error(err.message || 'Failed to delete entry')
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchEntries()
    fetchStats()
  }

  // Format date helper: "15 Oct 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getMonthAndDay = (dateStr) => {
    if (!dateStr) return { day: '', month: '' }
    const d = new Date(dateStr)
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    }
  }

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ─── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-cs-border pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cs-accent/10 border border-cs-accent/30 text-cs-accent mb-3">
            <BookOpen size={13} />
            <span>Database-Backed Viewing Journal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-cs-text tracking-tight">
            Movie Diary & Watch Log
          </h1>
          <p className="text-sm text-cs-text-secondary mt-1 max-w-xl">
            Track every film and episode you watch with dates, venues, rewatch counters, and ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/discover"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-cs-card hover:bg-cs-bg-secondary border border-cs-border text-cs-text hover:text-cs-accent transition-all shadow-sm"
          >
            <Sparkles size={14} className="text-cs-accent" />
            <span>Browse Titles to Log</span>
          </Link>
        </div>
      </div>

      {/* ─── Annual Statistics Cards (MongoDB Aggregation) ────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Films Logged */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cs-card border border-cs-border shadow-cs relative overflow-hidden group">
            <div className="flex items-center justify-between text-cs-text-secondary mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {selectedYear ? `${selectedYear} Films` : 'Total Logged'}
              </span>
              <Film size={18} className="text-cs-accent group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-cs-text">
              {stats.totalLogged}
            </div>
            <p className="text-[11px] text-cs-text-secondary mt-1">
              {stats.firstWatches} first-time watches
            </p>
          </div>

          {/* Rewatch Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cs-card border border-cs-border shadow-cs relative overflow-hidden group">
            <div className="flex items-center justify-between text-cs-text-secondary mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Rewatch Rate</span>
              <Repeat size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-cs-text">
              {stats.rewatchPercentage}%
            </div>
            <p className="text-[11px] text-cs-text-secondary mt-1">
              {stats.rewatches} titles revisited
            </p>
          </div>

          {/* Average Rating */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cs-card border border-cs-border shadow-cs relative overflow-hidden group">
            <div className="flex items-center justify-between text-cs-text-secondary mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Diary Rating</span>
              <Star size={18} className="text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-cs-text flex items-baseline gap-1.5">
              <span>{stats.avgRating !== null ? stats.avgRating : '—'}</span>
              {stats.avgRating !== null && (
                <span className="text-xs text-cs-text-secondary font-normal">/ 10</span>
              )}
            </div>
            <p className="text-[11px] text-cs-text-secondary mt-1">
              Personal quality score
            </p>
          </div>

          {/* Top Viewing Method */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cs-card border border-cs-border shadow-cs relative overflow-hidden group">
            <div className="flex items-center justify-between text-cs-text-secondary mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Top Medium</span>
              <TrendingUp size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cs-text truncate capitalize">
              {stats.watchMethods?.length > 0
                ? (METHOD_ICONS[stats.watchMethods[0].method]?.label || stats.watchMethods[0].method)
                : '—'}
            </div>
            <p className="text-[11px] text-cs-text-secondary mt-1">
              {stats.watchMethods?.length > 0
                ? `${stats.watchMethods[0].count} titles watched here`
                : 'Log films to see habits'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Monthly Visualizer Heatmap / Trend ─────────────────────────────────── */}
      {stats?.monthlyTrend && stats.totalLogged > 0 && (
        <div className="mb-8 p-5 bg-cs-card border border-cs-border rounded-2xl shadow-cs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-cs-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cs-text">
                Monthly Viewing Activity ({selectedYear || 'All Time'})
              </h3>
            </div>
            <span className="text-xs text-cs-text-secondary font-medium">
              Total {stats.totalLogged} watches
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2 h-20 items-end pt-2">
            {stats.monthlyTrend.map((m) => {
              const maxCount = Math.max(...stats.monthlyTrend.map((x) => x.count), 1)
              const heightPct = Math.round((m.count / maxCount) * 100)
              return (
                <div key={m.month} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-cs-accent opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {m.count}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      m.count > 0
                        ? 'bg-gradient-to-t from-cs-accent/40 to-cs-accent group-hover:brightness-125'
                        : 'bg-cs-border/40'
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-cs-text-secondary mt-2">
                    {m.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Filters & Search Bar ─────────────────────────────────────────────── */}
      <div className="bg-cs-card border border-cs-border rounded-2xl p-4 sm:p-5 mb-8 shadow-cs space-y-4">
        {/* Year Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Calendar size={13} />
            <span>Year:</span>
          </span>
          <button
            type="button"
            onClick={() => handleYearChange('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedYear === ''
                ? 'bg-cs-accent text-black shadow-cs-accent/20 shadow-sm'
                : 'bg-cs-bg-secondary text-cs-text-secondary hover:text-cs-text border border-cs-border'
            }`}
          >
            All Years
          </button>
          {stats?.availableYears?.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => handleYearChange(yr.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedYear === yr.toString()
                  ? 'bg-cs-accent text-black shadow-cs-accent/20 shadow-sm'
                  : 'bg-cs-bg-secondary text-cs-text-secondary hover:text-cs-text border border-cs-border'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Medium & Rewatch & Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2 border-t border-cs-border/80">
          {/* Method Filter */}
          <div className="sm:col-span-4 flex items-center gap-1 bg-cs-bg-secondary p-1 rounded-xl border border-cs-border overflow-x-auto">
            {['all', 'theater', 'streaming', 'physical_media'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMethodChange(m)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap text-center ${
                  selectedMethod === m
                    ? 'bg-cs-card text-cs-accent shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                {m === 'all' ? 'All Mediums' : m === 'physical_media' ? 'Physical' : m}
              </button>
            ))}
          </div>

          {/* Rewatch Filter */}
          <div className="sm:col-span-3 flex items-center gap-1 bg-cs-bg-secondary p-1 rounded-xl border border-cs-border">
            {[
              { val: '', label: 'All Watches' },
              { val: 'false', label: '1st Watch' },
              { val: 'true', label: 'Rewatches' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleRewatchChange(opt.val)}
                className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-semibold transition-all text-center ${
                  selectedRewatch === opt.val
                    ? 'bg-cs-card text-cs-accent shadow-sm'
                    : 'text-cs-text-secondary hover:text-cs-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search your diary titles..."
              className="w-full bg-cs-bg-secondary border border-cs-border rounded-xl pl-9 pr-4 py-2 text-xs text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none focus:border-cs-accent transition-colors"
            />
            <Search size={14} className="text-cs-text-secondary absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* ─── Timeline Feed List ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-cs-text-secondary gap-3">
          <Loader2 size={32} className="animate-spin text-cs-accent" />
          <p className="text-sm font-semibold">Loading diary entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 bg-cs-card border border-cs-border rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cs-accent/15 border border-cs-accent/30 text-cs-accent flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-black text-cs-text">No diary entries found</h3>
          <p className="text-xs text-cs-text-secondary mt-1.5 mb-6 leading-relaxed">
            {searchQuery || selectedYear || selectedMethod !== 'all' || selectedRewatch !== ''
              ? 'Try resetting your filters or search query to see other logged titles.'
              : 'Start logging films to build your personal viewing timeline with dates and ratings!'}
          </p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-cs-accent hover:bg-yellow-400 text-black transition-transform active:scale-95 shadow-md shadow-cs-accent/20"
          >
            <Plus size={15} />
            <span>Discover Films to Log</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const { day, month } = getMonthAndDay(entry.watchedDate)
            const posterUrl = getPosterUrl(entry.posterPath, 'w185')
            const methodInfo = METHOD_ICONS[entry.watchMethod] || METHOD_ICONS.other
            const MethodIcon = methodInfo.icon

            return (
              <div
                key={entry._id}
                className="group p-3.5 sm:p-4 rounded-2xl bg-cs-card border border-cs-border hover:border-cs-accent/40 transition-all flex items-start gap-3 sm:gap-4 shadow-sm"
              >
                {/* Date Box (Letterboxd Style) */}
                <div className="shrink-0 w-12 sm:w-14 text-center py-2 bg-cs-bg-secondary rounded-xl border border-cs-border group-hover:border-cs-accent/30 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-cs-text-secondary block tracking-wider">
                    {month}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-cs-text block leading-none mt-0.5">
                    {day}
                  </span>
                  <span className="text-[9px] text-cs-text-secondary/70 block mt-0.5">
                    {new Date(entry.watchedDate).getFullYear()}
                  </span>
                </div>

                {/* Poster Thumbnail */}
                <Link
                  to={`/${entry.mediaType === 'tv' ? 'tv' : 'movie'}/${entry.tmdbId}`}
                  className="shrink-0 relative overflow-hidden rounded-xl border border-cs-border shadow-sm group-hover:shadow-md transition-shadow"
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={entry.title}
                      className="w-14 sm:w-16 aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-14 sm:w-16 aspect-[2/3] bg-cs-bg-secondary flex items-center justify-center">
                      <Film size={20} className="text-cs-text-secondary" />
                    </div>
                  )}
                </Link>

                {/* Details Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/${entry.mediaType === 'tv' ? 'tv' : 'movie'}/${entry.tmdbId}`}
                        className="text-sm sm:text-base font-black text-cs-text hover:text-cs-accent transition-colors truncate block"
                      >
                        {entry.title}
                      </Link>
                      {entry.releaseDate && (
                        <span className="text-xs text-cs-text-secondary">
                          {entry.releaseDate.substring(0, 4)}
                        </span>
                      )}
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEdit(entry)}
                        className="p-1.5 text-cs-text-secondary hover:text-cs-accent hover:bg-cs-bg-secondary rounded-lg transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry._id, entry.title)}
                        className="p-1.5 text-cs-text-secondary hover:text-cs-error hover:bg-cs-bg-secondary rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Badges Row: Rating, Rewatch, Medium */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Rating Stars */}
                    {entry.rating ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold">
                        <Star size={11} className="fill-amber-400" />
                        <span>{entry.rating} / 10</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-cs-text-secondary/70">Unrated</span>
                    )}

                    {/* Rewatch Pill */}
                    {entry.isRewatch && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold">
                        <Repeat size={11} />
                        <span>Rewatch</span>
                      </span>
                    )}

                    {/* Venue / Medium Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${methodInfo.color}`}
                    >
                      <MethodIcon size={11} />
                      <span>{methodInfo.label}</span>
                    </span>

                    {/* Tags */}
                    {entry.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-cs-bg-secondary border border-cs-border text-cs-text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Notes Callout */}
                  {entry.notes && (
                    <p className="mt-2 text-xs text-cs-text-secondary bg-cs-bg-secondary/60 border border-cs-border/60 rounded-xl p-2.5 leading-relaxed italic">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Pagination ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-cs-border mt-8">
          <p className="text-xs text-cs-text-secondary">
            Showing Page <span className="text-cs-text font-bold">{page}</span> of{' '}
            <span className="text-cs-text font-bold">{totalPages}</span> ({totalEntries} total watches)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-xl border border-cs-border bg-cs-card hover:bg-cs-bg-secondary text-cs-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl border border-cs-border bg-cs-card hover:bg-cs-bg-secondary text-cs-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {isModalOpen && (
        <LogToDiaryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingEntry(null)
          }}
          movie={editingEntry}
          existingEntry={editingEntry}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

export default Diary
