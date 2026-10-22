import React, { useState, useRef } from 'react'
import {
  Sparkles,
  SlidersHorizontal,
  Clock,
  Star,
  Calendar,
  Film,
  Search,
  RotateCcw,
  AlertCircle,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getMoodRecommendations } from '../services/movieService'
import MovieCard from '../components/movies/MovieCard'
import SkeletonCard from '../components/movies/SkeletonCard'
import EmptyState from '../components/common/EmptyState'

// 8 Defined Mood Cards with Emojis, Colors, & Tags
const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😄',
    description: 'Uplifting comedies, animation & heartwarming feel-goods',
    accentColor: '#F5C518',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    borderActive: 'border-yellow-400 bg-yellow-950/20 text-yellow-300',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    description: 'Poignant dramas, tearjerkers & emotional journeys',
    accentColor: '#60A5FA',
    gradient: 'from-blue-600/20 via-sky-500/10 to-transparent',
    borderActive: 'border-blue-400 bg-blue-950/20 text-blue-300',
  },
  {
    id: 'motivated',
    label: 'Motivated',
    emoji: '🔥',
    description: 'Inspiring triumphs, intense action & true grit',
    accentColor: '#F97316',
    gradient: 'from-orange-600/20 via-amber-500/10 to-transparent',
    borderActive: 'border-orange-400 bg-orange-950/20 text-orange-300',
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    emoji: '🌿',
    description: 'Comfort cinema, peaceful documentaries & gentle pacing',
    accentColor: '#34D399',
    gradient: 'from-emerald-600/20 via-teal-500/10 to-transparent',
    borderActive: 'border-emerald-400 bg-emerald-950/20 text-emerald-300',
  },
  {
    id: 'suspenseful',
    label: 'Suspenseful',
    emoji: '😱',
    description: 'Edge-of-your-seat thrillers, mysteries & nail-biters',
    accentColor: '#A855F7',
    gradient: 'from-purple-600/20 via-violet-500/10 to-transparent',
    borderActive: 'border-purple-400 bg-purple-950/20 text-purple-300',
  },
  {
    id: 'romantic',
    label: 'Romantic',
    emoji: '💖',
    description: 'Passionate chemistry, love stories & rom-com charm',
    accentColor: '#FB7185',
    gradient: 'from-rose-600/20 via-pink-500/10 to-transparent',
    borderActive: 'border-rose-400 bg-rose-950/20 text-rose-300',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    emoji: '🧭',
    description: 'Epic quests, sci-fi wonders & globe-trotting escapades',
    accentColor: '#38BDF8',
    gradient: 'from-cyan-600/20 via-sky-500/10 to-transparent',
    borderActive: 'border-cyan-400 bg-cyan-950/20 text-cyan-300',
  },
  {
    id: 'thought-provoking',
    label: 'Thought-provoking',
    emoji: '🧠',
    description: 'Mind-benders, philosophical deep-dives & complex puzzles',
    accentColor: '#818CF8',
    gradient: 'from-indigo-600/20 via-purple-500/10 to-transparent',
    borderActive: 'border-indigo-400 bg-indigo-950/20 text-indigo-300',
  },
]

const RELEASE_PERIODS = [
  { id: 'all', label: 'All Time', start: null, end: null },
  { id: '2020s', label: '2020 - Present', start: 2020, end: 2030 },
  { id: '2010s', label: '2010 - 2019', start: 2010, end: 2019 },
  { id: '2000s', label: '2000 - 2009', start: 2000, end: 2009 },
  { id: 'classics', label: 'Classics (1970 - 1999)', start: 1970, end: 1999 },
]

const RUNTIME_OPTIONS = [
  { id: 'all', label: 'Any Runtime', minutes: null },
  { id: '90', label: 'Under 90 min', minutes: 90 },
  { id: '120', label: 'Under 2 hours', minutes: 120 },
  { id: '150', label: 'Under 2.5 hours', minutes: 150 },
]

const RATING_OPTIONS = [
  { id: 'any', label: 'Any Rating', min: 0 },
  { id: '6', label: '6.0+ Good', min: 6.0 },
  { id: '7', label: '7.0+ Great', min: 7.0 },
  { id: '8', label: '8.0+ Masterpiece', min: 8.0 },
]

const MoodDiscovery = () => {
  // Selected moods (multi-select allowed)
  const [selectedMoods, setSelectedMoods] = useState(['happy'])

  // Optional Filters
  const [minRating, setMinRating] = useState('any')
  const [maxRuntime, setMaxRuntime] = useState('all')
  const [releasePeriod, setReleasePeriod] = useState('all')

  // Search Results & States
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const resultsRef = useRef(null)

  // Toggle mood selection
  const handleToggleMood = (moodId) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        // Prevent deselecting if it's the last one
        if (prev.length === 1) {
          toast('Please keep at least one mood selected', { icon: '💡' })
          return prev
        }
        return prev.filter((m) => m !== moodId)
      } else {
        return [...prev, moodId]
      }
    })
  }

  // Handle Find Movies execution
  const handleFindMovies = async () => {
    if (selectedMoods.length === 0) {
      toast.error('Select at least one mood')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setHasSearched(true)

      // Format payload for backend
      const selectedRatingObj = RATING_OPTIONS.find((r) => r.id === minRating)
      const selectedRuntimeObj = RUNTIME_OPTIONS.find((r) => r.id === maxRuntime)
      const selectedPeriodObj = RELEASE_PERIODS.find((p) => p.id === releasePeriod)

      const payload = {
        moods: selectedMoods,
        ...(selectedRatingObj?.min > 0 && { minRating: selectedRatingObj.min }),
        ...(selectedRuntimeObj?.minutes && { maxRuntime: selectedRuntimeObj.minutes }),
        ...(selectedPeriodObj?.start && {
          releasePeriod: {
            start: selectedPeriodObj.start,
            end: selectedPeriodObj.end,
          },
        }),
      }

      const res = await getMoodRecommendations(payload)
      const movieResults = res.data?.results || res.results || []
      setResults(movieResults)

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err.message || 'Failed to fetch mood recommendations. Please try again.')
      toast.error(err.message || 'Failed to find movies')
    } finally {
      setLoading(false)
    }
  }

  // Reset filters
  const handleResetFilters = () => {
    setSelectedMoods(['happy'])
    setMinRating('any')
    setMaxRuntime('all')
    setReleasePeriod('all')
  }

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cs-accent/15 border border-cs-accent/30 text-cs-accent text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Emotional Cinema Discovery</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-cs-text">
            Find by Mood
          </h1>
          <p className="text-base sm:text-lg text-cs-text-secondary mt-3 leading-relaxed">
            How do you want to feel right now? Choose your desired vibe and let CineScope
            match the perfect cinematic resonance for your evening.
          </p>
        </div>

        {/* Mood Selection Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-cs-text flex items-center gap-2">
              <span className="w-1.5 h-5 bg-cs-accent rounded-full" />
              <span>Select One or More Moods</span>
            </h2>
            <span className="text-xs text-cs-text-secondary">
              {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''} active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {MOODS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.id)

              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => handleToggleMood(mood.id)}
                  className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? `${mood.borderActive} shadow-cs-lg scale-[1.02]`
                      : 'bg-cs-card border-cs-border hover:border-cs-accent/40 text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary'
                  }`}
                >
                  {/* Subtle corner gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} pointer-events-none ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    } transition-opacity duration-300`}
                  />

                  {/* Header: Emoji & Active indicator */}
                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <span className="text-3xl sm:text-4xl filter drop-shadow-sm select-none">
                      {mood.emoji}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cs-accent text-cs-bg'
                          : 'border border-cs-border group-hover:border-cs-accent/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Body: Title & Description */}
                  <div className="relative z-10">
                    <h3
                      className={`text-base sm:text-lg font-bold tracking-tight ${
                        isSelected ? 'text-white' : 'text-cs-text group-hover:text-white'
                      }`}
                    >
                      {mood.label}
                    </h3>
                    <p className="text-xs text-cs-text-secondary mt-1 leading-relaxed line-clamp-2">
                      {mood.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Optional Filters Card */}
        <div className="bg-cs-card border border-cs-border rounded-2xl p-5 sm:p-6 mb-10 shadow-cs">
          <div className="flex items-center justify-between pb-4 border-b border-cs-border/80 mb-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cs-accent" />
              <h3 className="text-sm font-bold text-cs-text uppercase tracking-wider">
                Refine Mood Parameters
              </h3>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-cs-text-secondary hover:text-cs-accent transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Min Rating Filter */}
            <div>
              <label className="block text-xs font-semibold text-cs-text mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-cs-accent" />
                <span>Minimum Rating</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMinRating(opt.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      minRating === opt.id
                        ? 'bg-cs-accent text-cs-bg border-cs-accent shadow-sm'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Runtime Filter */}
            <div>
              <label className="block text-xs font-semibold text-cs-text mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cs-accent" />
                <span>Max Runtime</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RUNTIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMaxRuntime(opt.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      maxRuntime === opt.id
                        ? 'bg-cs-accent text-cs-bg border-cs-accent shadow-sm'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text hover:border-cs-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Release Period Filter */}
            <div>
              <label className="block text-xs font-semibold text-cs-text mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cs-accent" />
                <span>Era / Release Period</span>
              </label>
              <select
                value={releasePeriod}
                onChange={(e) => setReleasePeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cs-bg-secondary border border-cs-border rounded-lg text-xs font-medium text-cs-text focus:outline-none focus:border-cs-accent transition-all cursor-pointer"
              >
                {RELEASE_PERIODS.map((period) => (
                  <option key={period.id} value={period.id} className="bg-cs-card text-cs-text">
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Trigger Row */}
          <div className="mt-6 pt-5 border-t border-cs-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cs-text-secondary">
              Matches genre clusters mapped to {selectedMoods.map((m) => `"${m}"`).join(', ')}
            </p>

            <button
              type="button"
              onClick={handleFindMovies}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-cs-accent text-cs-bg font-extrabold text-sm tracking-wide shadow-cs-accent hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cs-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Find Movies for My Mood</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultsRef} className="scroll-mt-6">
          {error && (
            <div className="p-4 rounded-xl bg-cs-error/15 border border-cs-error/30 text-cs-error flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button
                type="button"
                onClick={handleFindMovies}
                className="ml-auto text-xs underline font-bold hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-6 bg-cs-accent rounded-full" />
                <h2 className="text-xl font-bold text-cs-text">
                  Matching titles to your mood...
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <SkeletonCard key={idx} size="full" />
                ))}
              </div>
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-cs-border">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-cs-accent rounded-full" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-cs-text">
                        Mood Matches ({results.length})
                      </h2>
                      <p className="text-xs text-cs-text-secondary">
                        Curated for {selectedMoods.map((m) => MOODS.find((item) => item.id === m)?.label).filter(Boolean).join(' + ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {results.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      size="full"
                      showRating
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Film}
                title="No titles matched your mood combination"
                description="Try loosening your runtime or rating filters, or select an additional mood vibe."
                actionText="Reset Filters"
                onAction={handleResetFilters}
              />
            )
          ) : (
            /* Initial prompt state before first search */
            <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-cs-border/80 bg-cs-card/30">
              <span className="text-4xl mb-3 block">🎬</span>
              <h3 className="text-lg font-bold text-cs-text mb-1">
                Ready to Find Your Next Favorite Movie?
              </h3>
              <p className="text-sm text-cs-text-secondary max-w-md mx-auto mb-4">
                Select your moods above, adjust any preferences, and tap "Find Movies for My Mood".
              </p>
              <button
                type="button"
                onClick={handleFindMovies}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cs-card hover:bg-cs-bg-secondary border border-cs-accent/60 text-cs-accent text-xs font-bold transition-all shadow-cs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search With Current Selection</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MoodDiscovery
