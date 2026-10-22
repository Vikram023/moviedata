import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Info, Sparkles, Film, ArrowRight, ShieldCheck, Heart, Star, Compass } from 'lucide-react'
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularTV,
  getGenres,
  getMovieVideos,
  getRecommendations,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import {
  getBackdropUrl,
  formatYear,
  truncate,
  getTrailerUrl,
} from '../utils/helpers'

import HorizontalMediaCarousel from '../components/movies/HorizontalMediaCarousel'
import GenreCard from '../components/movies/GenreCard'
import RatingBadge from '../components/movies/RatingBadge'
import WatchlistButton from '../components/movies/WatchlistButton'
import TrailerModal from '../components/movies/TrailerModal'
import ErrorState from '../components/common/ErrorState'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  // State for all data sections
  const [trendingMovies, setTrendingMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [topRatedMovies, setTopRatedMovies] = useState([])
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [popularTV, setPopularTV] = useState([])
  const [genres, setGenres] = useState([])
  const [genreMap, setGenreMap] = useState({})
  const [recommendedMovies, setRecommendedMovies] = useState([])

  // Hero state
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroVideoUrl, setHeroVideoUrl] = useState(null)
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [loadingTrailer, setLoadingTrailer] = useState(false)

  // Loading & error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all primary content
  const loadHomeData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Parallel requests with fault tolerance (Promise.allSettled)
      const results = await Promise.allSettled([
        getTrending('movie', 'day'),
        getPopularMovies(1),
        getTopRatedMovies(1),
        getUpcomingMovies(1),
        getPopularTV(1),
        getGenres('movie'),
      ])

      const [
        trendingRes,
        popularRes,
        topRatedRes,
        upcomingRes,
        tvRes,
        genresRes,
      ] = results.map((r) => (r.status === 'fulfilled' ? r.value : null))

      const trendingList = trendingRes?.data?.results || trendingRes?.results || []
      const popularList = popularRes?.data?.results || popularRes?.results || []
      const topRatedList = topRatedRes?.data?.results || topRatedRes?.results || []
      const upcomingList = upcomingRes?.data?.results || upcomingRes?.results || []
      const tvList = tvRes?.data?.results || tvRes?.results || []
      const genreList = genresRes?.data?.genres || genresRes?.genres || []

      // If every primary section failed, show error state
      if (!trendingList.length && !popularList.length && !topRatedList.length) {
        const firstError = results.find((r) => r.status === 'rejected')?.reason
        throw new Error(firstError?.message || 'Failed to load movie catalog. Please try again.')
      }

      setTrendingMovies(trendingList)
      setPopularMovies(popularList)
      setTopRatedMovies(topRatedList)
      setUpcomingMovies(upcomingList)
      setPopularTV(tvList)
      setGenres(genreList)

      // Map genre id to name for quick badge lookup
      const gMap = {}
      genreList.forEach((g) => {
        gMap[g.id] = g.name
      })
      setGenreMap(gMap)

      // Fetch personalized recommendations if logged in
      if (isAuthenticated) {
        try {
          const recRes = await getRecommendations(1)
          const recData = recRes?.data || {}
          const combinedRecs = [
            ...(recData.personalized || []),
            ...(recData.genreBased || []),
            ...(recData.hiddenGems || []),
          ]
          // Filter unique items
          const seen = new Set()
          const uniqueRecs = combinedRecs.filter((m) => {
            const id = m.id || m.tmdbId
            if (!id || seen.has(id)) return false
            seen.add(id)
            return true
          })
          setRecommendedMovies(uniqueRecs)
        } catch {
          // Silent fallback for recommendations
        }
      }
    } catch (err) {
      console.error('Failed to load CineScope home data:', err)
      setError(err?.message || 'Could not load movies. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadHomeData()
  }, [loadHomeData])

  // Current hero movie
  const heroMovie = trendingMovies[heroIndex] || trendingMovies[0]

  // Handle trailer click
  const handleWatchTrailer = async () => {
    if (!heroMovie) return
    setLoadingTrailer(true)
    try {
      const vidRes = await getMovieVideos(heroMovie.id)
      const url = getTrailerUrl(vidRes?.data || vidRes)
      setHeroVideoUrl(url)
      setIsTrailerOpen(true)
    } catch (err) {
      console.error('Failed to retrieve trailer:', err)
      setHeroVideoUrl(null)
      setIsTrailerOpen(true)
    } finally {
      setLoadingTrailer(false)
    }
  }

  // Handle clicking a genre card
  const handleGenreClick = (genre) => {
    navigate(`/movies?genre=${genre.id}`)
  }

  if (error && trendingMovies.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <ErrorState
          title="Could not load CineScope"
          message={error}
          onRetry={loadHomeData}
          retryLabel="Reload Home"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-cs-bg text-cs-text overflow-x-hidden pb-16">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. CINEMATIC HERO SECTION                                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] bg-cs-bg-secondary skeleton flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 space-y-4">
            <div className="h-6 w-36 bg-cs-card rounded skeleton" />
            <div className="h-12 w-2/3 max-w-xl bg-cs-card rounded skeleton" />
            <div className="h-4 w-96 bg-cs-card rounded skeleton" />
            <div className="h-16 w-full max-w-lg bg-cs-card rounded skeleton" />
            <div className="flex gap-4 pt-2">
              <div className="h-12 w-36 bg-cs-card rounded-lg skeleton" />
              <div className="h-12 w-36 bg-cs-card rounded-lg skeleton" />
            </div>
          </div>
        </div>
      ) : heroMovie ? (
        <section className="relative w-full h-[75vh] sm:h-[82vh] md:h-[88vh] select-none flex items-end overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={getBackdropUrl(heroMovie.backdrop_path, 'original') || getBackdropUrl(heroMovie.backdrop_path, 'w1280')}
              alt={heroMovie.title || 'Featured Movie'}
              className="w-full h-full object-cover object-center scale-105 animate-fade-in filter brightness-[0.85]"
            />
            {/* Multi-layered cinematic vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-cs-bg via-cs-bg/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-cs-bg via-cs-bg/85 md:via-cs-bg/60 to-transparent w-full md:w-3/4" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cs-bg via-cs-bg/90 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 sm:pb-16 md:pb-20">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              {/* Badge row: Spotlight + Rating + Year */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cs-accent text-cs-bg uppercase tracking-wider text-[11px] font-bold shadow-cs-accent">
                  <Sparkles size={12} className="stroke-[2.5]" />
                  <span>Trending #{heroIndex + 1}</span>
                </span>

                {heroMovie.vote_average > 0 && (
                  <RatingBadge rating={heroMovie.vote_average} size="sm" showOutOf />
                )}

                <span className="text-cs-text-secondary font-medium">
                  {formatYear(heroMovie.release_date)}
                </span>

                {/* Genre badges */}
                {heroMovie.genre_ids?.slice(0, 3).map((gId) => (
                  <span
                    key={gId}
                    className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-cs-text text-xs border border-white/10"
                  >
                    {genreMap[gId] || 'Cinema'}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.1]">
                {heroMovie.title}
              </h1>

              {/* Overview */}
              <p className="text-sm sm:text-base text-cs-text-secondary line-clamp-3 sm:line-clamp-3 leading-relaxed drop-shadow-sm max-w-xl">
                {heroMovie.overview || 'Explore the complete cast, community reviews, and high-resolution media for this featured title on CineScope.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Watch Trailer */}
                <button
                  type="button"
                  onClick={handleWatchTrailer}
                  disabled={loadingTrailer}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-cs-accent text-cs-bg font-bold text-sm sm:text-base hover:bg-yellow-400 active:scale-95 transition-all shadow-lg hover:shadow-cs-accent/40"
                  aria-label="Watch Trailer"
                >
                  <Play size={18} className="fill-cs-bg stroke-none" />
                  <span>{loadingTrailer ? 'Loading...' : 'Watch Trailer'}</span>
                </button>

                {/* View Details */}
                <Link
                  to={`/movie/${heroMovie.id}`}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-cs-card/80 backdrop-blur-md border border-cs-border hover:border-cs-accent/60 text-cs-text hover:text-white font-semibold text-sm sm:text-base hover:bg-cs-card active:scale-95 transition-all shadow-md"
                  aria-label="View Details"
                >
                  <Info size={18} />
                  <span>Details</span>
                </Link>

                {/* Watchlist Toggle */}
                <WatchlistButton
                  tmdbId={heroMovie.id}
                  mediaType="movie"
                  movieData={heroMovie}
                  variant="button"
                  size="md"
                />
              </div>

              {/* Hero Slide Selector Dots (Top 5 trending) */}
              {trendingMovies.length > 1 && (
                <div className="flex items-center gap-2 pt-3">
                  {trendingMovies.slice(0, 5).map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === heroIndex
                          ? 'w-8 bg-cs-accent shadow-cs-accent'
                          : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT CONTAINERS                                                 */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* 2. TRENDING NOW SECTION */}
        <HorizontalMediaCarousel
          title="Trending Now"
          subtitle="Top movies capturing audiences worldwide this week"
          items={trendingMovies}
          mediaType="movie"
          loading={loading}
          viewAllLink="/movies?sort=popularity.desc"
        />

        {/* 3. PERSONALIZED SECTION FOR AUTHENTICATED USERS */}
        {isAuthenticated && (
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-cs-card via-cs-bg-secondary to-cs-card border border-cs-accent/20 shadow-cs-glow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-cs-accent" />
                <h3 className="text-lg font-bold text-cs-text">
                  Picked for {user?.name || user?.username || 'You'}
                </h3>
              </div>
              <Link
                to="/recommendations"
                className="text-xs font-semibold text-cs-accent hover:underline flex items-center gap-1"
              >
                <span>Full Taste Profile</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <HorizontalMediaCarousel
              title="Recommended For You"
              subtitle="Curated from your ratings, reviews, and favorite genres"
              items={recommendedMovies.length > 0 ? recommendedMovies : popularMovies.slice(5, 15)}
              mediaType="movie"
              loading={loading}
              viewAllLink="/recommendations"
            />
          </div>
        )}

        {/* 4. POPULAR MOVIES SECTION */}
        <HorizontalMediaCarousel
          title="Popular Movies"
          subtitle="Blockbusters and fan favorites currently in high demand"
          items={popularMovies}
          mediaType="movie"
          loading={loading}
          viewAllLink="/movies?sort=popularity.desc"
        />

        {/* 5. TOP RATED MOVIES SECTION */}
        <HorizontalMediaCarousel
          title="Top Rated Movies"
          subtitle="Critically acclaimed cinema rated highest by global fans"
          items={topRatedMovies}
          mediaType="movie"
          loading={loading}
          viewAllLink="/movies?sort=vote_average.desc"
        />

        {/* 6. UPCOMING MOVIES SECTION */}
        <HorizontalMediaCarousel
          title="Upcoming In Theaters"
          subtitle="Exciting new titles slated for theatrical release"
          items={upcomingMovies}
          mediaType="movie"
          loading={loading}
          viewAllLink="/movies?sort=release_date.desc"
        />

        {/* 7. POPULAR TV SHOWS SECTION */}
        <HorizontalMediaCarousel
          title="Popular TV Shows"
          subtitle="Binge-worthy series, gripping dramas, and trending seasons"
          items={popularTV}
          mediaType="tv"
          loading={loading}
          viewAllLink="/tv?sort=popularity.desc"
        />

        {/* 8. BROWSE BY GENRE SECTION */}
        <section className="my-12">
          <div className="flex items-end justify-between mb-6 px-1">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 sm:h-7 bg-cs-accent rounded-full shrink-0 shadow-cs-accent" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-cs-text">
                  Browse by Genre
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-cs-text-secondary mt-1 ml-4.5">
                Explore tailored categories from adrenaline-pumping Action to heartwarming Animation
              </p>
            </div>

            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cs-accent hover:text-yellow-400 transition-colors group/link pb-0.5"
            >
              <span>Advanced Filter</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover/link:translate-x-0.5 stroke-[2.5]"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {genres.slice(0, 12).map((genre) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                onClick={handleGenreClick}
                size="md"
              />
            ))}
          </div>
        </section>

        {/* 9. REGISTRATION CTA BANNER FOR GUESTS */}
        {!isAuthenticated && (
          <section className="my-16">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cs-card via-cs-bg-secondary to-[#151a24] border border-cs-border hover:border-cs-accent/30 p-8 sm:p-12 md:p-14 shadow-cs-lg transition-all">
              {/* Background accent glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cs-accent/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cs-accent/15 border border-cs-accent/30 text-cs-accent text-xs font-bold uppercase tracking-wider">
                  <Film size={14} />
                  <span>The CineScope Experience</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  Track, Rate, and Discover Cinema Like Never Before
                </h2>

                <p className="text-sm sm:text-base text-cs-text-secondary leading-relaxed max-w-2xl">
                  Build your personal watchlist, leave spoiler-free reviews, compare box office hits, and receive tailored movie recommendations crafted to your unique taste.
                </p>

                {/* Highlights grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cs-bg flex items-center justify-center text-cs-accent border border-cs-border">
                      <Star size={18} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-cs-text">
                      Community Ratings
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cs-bg flex items-center justify-center text-cs-accent border border-cs-border">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-cs-text">
                      Spoiler Protection
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cs-bg flex items-center justify-center text-cs-accent border border-cs-border">
                      <Compass size={18} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-cs-text">
                      Smart Discovery
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cs-accent text-cs-bg font-bold text-sm sm:text-base hover:bg-yellow-400 active:scale-95 transition-all shadow-cs-accent shadow-md"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight size={16} className="stroke-[2.5]" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cs-bg-secondary hover:bg-cs-card border border-cs-border hover:border-cs-accent/40 text-cs-text font-semibold text-sm sm:text-base active:scale-95 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={heroVideoUrl}
        title={heroMovie ? `${heroMovie.title} Trailer` : 'Official Trailer'}
      />
    </div>
  )
}

export default Home
