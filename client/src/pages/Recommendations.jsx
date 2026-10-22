import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Gem,
  Heart,
  TrendingUp,
  Compass,
  Sliders,
  Star,
  RefreshCw,
  Film,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getRecommendations, getHiddenGems } from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import HorizontalMediaCarousel from '../components/movies/HorizontalMediaCarousel'
import EmptyState from '../components/common/EmptyState'

const Recommendations = () => {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendationsData, setRecommendationsData] = useState({
    genreBased: [],
    hiddenGems: [],
    personalized: [],
    popular: [],
  })

  const fetchAllRecommendations = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      const [recRes, gemRes] = await Promise.allSettled([
        getRecommendations(),
        getHiddenGems(),
      ])

      let genreBased = []
      let hiddenGems = []
      let personalized = []
      let popular = []

      if (recRes.status === 'fulfilled' && recRes.value?.data) {
        genreBased = recRes.value.data.genreBased || []
        hiddenGems = recRes.value.data.hiddenGems || []
        personalized = recRes.value.data.personalized || []
        popular = recRes.value.data.popular || []
      }

      if (gemRes.status === 'fulfilled' && gemRes.value?.data?.results) {
        // If hidden gems from gemRes has more items, merge or prefer it
        if (gemRes.value.data.results.length > 0) {
          hiddenGems = gemRes.value.data.results
        }
      }

      setRecommendationsData({
        genreBased,
        hiddenGems,
        personalized,
        popular,
      })
    } catch (err) {
      toast.error('Failed to load some recommendations. Showing available titles.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAllRecommendations()
  }, [])

  const hasFavoriteGenres = Boolean(user?.favoriteGenres && user.favoriteGenres.length > 0)
  const favoriteGenreNames = hasFavoriteGenres
    ? user.favoriteGenres.map((g) => g.name || g).join(', ')
    : ''

  const hasAnyRecommendations =
    recommendationsData.genreBased.length > 0 ||
    recommendationsData.personalized.length > 0 ||
    recommendationsData.hiddenGems.length > 0

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero / Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cs-card via-cs-bg-secondary to-cs-card border border-cs-border p-6 sm:p-8 mb-8 shadow-cs">
          {/* Subtle ambient accent glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cs-accent/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cs-accent/15 border border-cs-accent/30 text-cs-accent text-xs font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI & Taste Powered Discovery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-cs-text">
                For You
              </h1>
              <p className="text-sm sm:text-base text-cs-text-secondary mt-2 leading-relaxed">
                Personalized cinematic selections calibrated to your unique tastes, viewing habits, and
                unexplored genres.
              </p>

              {/* User preference highlights pill */}
              {hasFavoriteGenres && (
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-cs-text-secondary">
                  <span className="font-semibold text-cs-text">Your Favorite Genres:</span>
                  <span className="text-cs-accent font-medium bg-cs-accent/10 px-2 py-0.5 rounded-md border border-cs-accent/20">
                    {favoriteGenreNames}
                  </span>
                </div>
              )}
            </div>

            {/* Quick action controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => fetchAllRecommendations(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cs-card hover:bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/50 text-cs-text text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cs-accent' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
              </button>

              <Link
                to="/taste-profile"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cs-accent text-cs-bg hover:bg-yellow-400 font-bold text-sm shadow-cs-accent transition-all active:scale-95"
              >
                <Sliders className="w-4 h-4 stroke-[2.5]" />
                <span>Taste Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Empty State when user has zero recommendations and no history */}
        {!loading && !hasAnyRecommendations ? (
          <EmptyState
            icon={Sparkles}
            title="Calibrate Your Recommendations"
            description="We haven't discovered your movie taste yet. Rate movies you've watched or add your favorite genres to unlock your personalized stream."
            actionText="Tune Taste Profile"
            actionLink="/taste-profile"
            actionIcon={Sliders}
            className="my-12"
          >
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cs-card border border-cs-border hover:border-cs-accent/50 text-xs font-semibold text-cs-text transition-colors"
              >
                <Compass className="w-4 h-4 text-cs-accent" />
                <span>Explore Trending Titles</span>
              </Link>
            </div>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {/* Section 1: Recommended for You (Genre/Taste based) */}
            <HorizontalMediaCarousel
              title="Recommended for You"
              subtitle={
                hasFavoriteGenres
                  ? `Curated based on your love for ${favoriteGenreNames}`
                  : 'Tailored to your viewing preferences and top-rated categories'
              }
              items={recommendationsData.genreBased}
              mediaType="mixed"
              loading={loading}
              cardSize="md"
            />

            {/* Section 2: Similar to Titles You Loved (Personalized) */}
            <HorizontalMediaCarousel
              title="Because You Loved Great Cinema"
              subtitle="Titles sharing DNA, directors, and narrative themes with your highest-rated reviews"
              items={recommendationsData.personalized}
              mediaType="mixed"
              loading={loading}
              cardSize="md"
            />

            {/* Section 3: Hidden Gems */}
            <HorizontalMediaCarousel
              title="Hidden Gems & Undiscovered Masterpieces"
              subtitle="Critically acclaimed films with 7.0+ ratings that flew under the mainstream radar"
              items={recommendationsData.hiddenGems}
              mediaType="movie"
              loading={loading}
              cardSize="md"
            />

            {/* Section 4: What's Popular Right Now */}
            {recommendationsData.popular.length > 0 && (
              <HorizontalMediaCarousel
                title="Trending Across CineScope"
                subtitle="The most-watched and highest-rated titles captivating the community this week"
                items={recommendationsData.popular}
                mediaType="movie"
                loading={loading}
                cardSize="md"
                viewAllLink="/discover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recommendations
