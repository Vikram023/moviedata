import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Play,
  Star,
  Users,
  Tv,
  Calendar,
  Globe,
  AlertCircle,
  ArrowLeft,
  Share2,
  Check,
  Layers,
  BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Services & Context
import {
  getTVDetails,
  getCommunityRating,
  getMyRating,
  checkDiaryStatus,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'

// Helpers
import {
  getBackdropUrl,
  getPosterUrl,
  formatDate,
  formatYear,
  formatRating,
  getRatingColor,
  getTrailerUrl,
} from '../utils/helpers'

// Components
import TrailerModal from '../components/movies/TrailerModal'
import CastCarousel from '../components/movies/CastCarousel'
import WatchlistButton from '../components/movies/WatchlistButton'
import RatingInput from '../components/movies/RatingInput'
import RatingDistribution from '../components/movies/RatingDistribution'
import ReviewSection from '../components/movies/ReviewSection'
import HorizontalMediaCarousel from '../components/movies/HorizontalMediaCarousel'
import LogToDiaryModal from '../components/diary/LogToDiaryModal'
import SkeletonCard from '../components/movies/SkeletonCard'

const TVDetails = () => {
  const { tmdbId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Main State
  const [show, setShow] = useState(null)
  const [communityRating, setCommunityRating] = useState(null)
  const [userRating, setUserRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Trailer Modal State
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [diaryModalOpen, setDiaryModalOpen] = useState(false)
  const [diaryLoggedCount, setDiaryLoggedCount] = useState(0)

  // Fetch TV Show Data & Ratings
  const fetchData = useCallback(async () => {
    if (!tmdbId) return
    setLoading(true)
    setError(null)

    try {
      // Fetch TMDB TV Details
      const tvRes = await getTVDetails(tmdbId)
      const tvData = tvRes.data
      setShow(tvData)

      // Fetch Community Rating Stats
      try {
        const commRes = await getCommunityRating('tv', tmdbId)
        setCommunityRating(commRes.data)
      } catch {
        setCommunityRating(null)
      }

      // Fetch User's Own Rating if authenticated
      if (isAuthenticated) {
        try {
          const myRatingRes = await getMyRating('tv', tmdbId)
          setUserRating(myRatingRes.data?.rating || null)
        } catch {
          setUserRating(null)
        }
        // Fetch Diary Log status
        try {
          const diaryRes = await checkDiaryStatus('tv', tmdbId)
          setDiaryLoggedCount(diaryRes.data?.count || 0)
        } catch {
          setDiaryLoggedCount(0)
        }
      } else {
        setUserRating(null)
        setDiaryLoggedCount(0)
      }
    } catch (err) {
      setError(err.message || 'TV show not found or failed to load.')
    } finally {
      setLoading(false)
    }
  }, [tmdbId, isAuthenticated])

  useEffect(() => {
    fetchData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchData])

  // Extract TV Content Rating (TV-MA, TV-14, etc.)
  const getContentRating = (contentRatings) => {
    if (!contentRatings?.results?.length) return null
    // Prefer US rating
    const usRating = contentRatings.results.find((r) => r.iso_3166_1 === 'US')
    if (usRating?.rating?.trim()) return usRating.rating.trim()
    for (const item of contentRatings.results) {
      if (item.rating?.trim()) return item.rating.trim()
    }
    return null
  }

  // Handle Share link
  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  // Callback when user rates or updates rating
  const handleRated = (newRatingObj, updatedCommunityStats) => {
    setUserRating(newRatingObj)
    if (updatedCommunityStats) {
      setCommunityRating(updatedCommunityStats)
    } else {
      getCommunityRating('tv', tmdbId)
        .then((res) => setCommunityRating(res.data))
        .catch(() => {})
    }
  }

  // ─── Loading Skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cs-bg text-cs-text pb-16">
        {/* Hero Backdrop Skeleton */}
        <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] bg-cs-bg-secondary skeleton">
          <div className="absolute inset-0 bg-gradient-to-t from-cs-bg via-cs-bg/70 to-transparent" />
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-64 sm:-mt-80 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Poster Skeleton */}
            <div className="lg:col-span-4 max-w-[320px] mx-auto lg:mx-0 w-full">
              <div className="aspect-[2/3] rounded-2xl bg-cs-card skeleton border border-cs-border" />
              <div className="h-11 rounded-xl bg-cs-card skeleton mt-4" />
            </div>

            {/* Main Info Skeleton */}
            <div className="lg:col-span-8 space-y-4 pt-4 lg:pt-16">
              <div className="h-10 bg-cs-card skeleton rounded-xl w-3/4" />
              <div className="h-4 bg-cs-card skeleton rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-7 w-20 rounded-full bg-cs-card skeleton" />
                <div className="h-7 w-20 rounded-full bg-cs-card skeleton" />
              </div>
              <div className="h-28 bg-cs-card skeleton rounded-2xl mt-6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="h-20 bg-cs-card skeleton rounded-xl" />
                <div className="h-20 bg-cs-card skeleton rounded-xl" />
                <div className="h-20 bg-cs-card skeleton rounded-xl" />
                <div className="h-20 bg-cs-card skeleton rounded-xl" />
              </div>
            </div>
          </div>

          {/* Cast skeleton */}
          <div className="mt-16 space-y-4">
            <div className="h-7 w-40 bg-cs-card skeleton rounded" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Error / 404 State ───────────────────────────────────────────────────────
  if (error || !show) {
    return (
      <div className="min-h-[80vh] bg-cs-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-cs-card border border-cs-border rounded-2xl p-8 sm:p-10 shadow-cs-lg">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-cs-error flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-cs-text mb-2">TV Series Not Found</h2>
          <p className="text-sm text-cs-text-secondary mb-6 leading-relaxed">
            {error || 'The TV show you are looking for does not exist or TMDB is unreachable.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cs-bg-secondary hover:bg-cs-border/40 text-cs-text border border-cs-border font-semibold text-xs sm:text-sm transition-all"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
            <Link
              to="/tv"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cs-accent hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm shadow-cs-accent/20 shadow-md transition-all active:scale-95"
            >
              <Tv size={16} />
              <span>Browse TV Shows</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Derived TV Data ─────────────────────────────────────────────────────────
  const title = show.name || show.original_name || 'Untitled Series'
  const firstAirYear = formatYear(show.first_air_date)
  const firstAirDateFormatted = formatDate(show.first_air_date)
  const contentRating = getContentRating(show.content_ratings)
  const spokenLang =
    show.spoken_languages?.[0]?.english_name ||
    show.spoken_languages?.[0]?.name ||
    show.original_language?.toUpperCase() ||
    'English'

  const seasonsCount = show.number_of_seasons || 0
  const episodesCount = show.number_of_episodes || 0

  const backdropUrl = getBackdropUrl(show.backdrop_path, 'original') || getBackdropUrl(show.backdrop_path, 'w1280')
  const posterUrl = getPosterUrl(show.poster_path, 'w500')
  const trailerUrl = getTrailerUrl(show.videos)

  // Creators
  const creators = show.created_by || []

  // Top 15 cast members
  const topCast = show.credits?.cast?.slice(0, 15) || []

  // Similar & recommended TV shows
  const similarShows = show.similar?.results?.length
    ? show.similar.results
    : show.recommendations?.results || []

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-24 select-text">
      {/* ─── Hero Section with Full-Width Backdrop ───────────────────────────── */}
      <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[720px] overflow-hidden">
        {/* Backdrop Image */}
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-top scale-105 filter brightness-[0.7] contrast-105 transform transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#181D29] via-[#121620] to-[#0B0D12]" />
        )}

        {/* Cinematic Multi-layered Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cs-bg via-cs-bg/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cs-bg/95 via-cs-bg/50 to-transparent sm:w-3/4" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cs-bg via-cs-bg to-transparent" />
      </div>

      {/* ─── Main Content Container ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-80 sm:-mt-96 lg:-mt-[460px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Poster & Quick Primary Actions */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start max-w-[320px] sm:max-w-[360px] mx-auto lg:mx-0 w-full">
            {/* Poster Card */}
            <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-cs-card border-2 border-cs-border shadow-cs-lg group">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-cs-bg-secondary text-cs-text-secondary">
                  <Tv size={48} className="text-cs-accent mb-3" />
                  <p className="font-semibold text-sm">{title}</p>
                </div>
              )}

              {/* Top badges: TV Tag & Content Rating */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-blue-950/85 border border-blue-500/40 text-blue-400 font-bold uppercase text-[10px] tracking-wider backdrop-blur-md">
                  TV Series
                </span>
                {contentRating && (
                  <span className="px-2 py-0.5 rounded border border-white/20 bg-black/75 font-black text-white uppercase text-[10px] tracking-wider backdrop-blur-md">
                    {contentRating}
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action Buttons (Under Poster) */}
            <div className="w-full space-y-3 mt-5">
              {/* Watch Trailer Button (if video available) */}
              {trailerUrl && (
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/30 shadow-lg hover:shadow-cs-accent/50 transition-all duration-200 active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={13} className="fill-black text-black ml-0.5" />
                  </div>
                  <span>Watch Official Trailer</span>
                </button>
              )}

              {/* Watchlist Button */}
              <WatchlistButton
                tmdbId={show.id}
                mediaType="tv"
                movieData={{ ...show, media_type: 'tv' }}
                variant="button"
                className="w-full py-3.5"
              />

              {/* Log to Diary Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in to log shows to your diary')
                    return
                  }
                  setDiaryModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs bg-cs-card hover:bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/50 text-cs-text hover:text-cs-accent transition-all duration-200 group shadow-sm active:scale-95"
              >
                <BookOpen size={15} className="text-cs-accent group-hover:scale-110 transition-transform" />
                <span>{diaryLoggedCount > 0 ? `Logged in Diary (${diaryLoggedCount}x)` : 'Log to Diary'}</span>
              </button>

              {/* Share & Quick links */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cs-card hover:bg-cs-bg-secondary border border-cs-border text-cs-text-secondary hover:text-cs-text text-xs font-semibold transition-all"
                  title="Copy series link"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-cs-success" />
                      <span className="text-cs-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Series</span>
                    </>
                  )}
                </button>

                {show.homepage && (
                  <a
                    href={show.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-cs-card hover:bg-cs-bg-secondary border border-cs-border text-cs-text-secondary hover:text-cs-accent text-xs font-semibold transition-all"
                    title="Official Website"
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Hero Details, Ratings, Overview, Creators */}
          <div className="lg:col-span-8 flex flex-col justify-start pt-2 lg:pt-8 space-y-6">
            {/* Title & First Air Year Header */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-cs-text drop-shadow-md">
                  {title}
                </h1>
                {firstAirYear && (
                  <span className="text-xl sm:text-3xl lg:text-4xl font-normal text-cs-text-secondary">
                    ({firstAirYear})
                  </span>
                )}
              </div>

              {/* Tagline */}
              {show.tagline && (
                <p className="text-sm sm:text-base italic text-cs-accent/90 font-medium mt-2 leading-relaxed">
                  "{show.tagline}"
                </p>
              )}
            </div>

            {/* Metadata Pills Row (Seasons count, First Air Date, Language, Status) */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-cs-text-secondary">
              {contentRating && (
                <span className="px-2 py-0.5 rounded border border-white/20 bg-cs-card font-bold text-white uppercase text-[11px]">
                  {contentRating}
                </span>
              )}

              {/* Seasons Count Badge */}
              {seasonsCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cs-card border border-cs-border font-semibold text-cs-text">
                  <Layers size={13} className="text-cs-accent" />
                  <span>
                    {seasonsCount} Season{seasonsCount > 1 ? 's' : ''}
                    {episodesCount > 0 && ` (${episodesCount} eps)`}
                  </span>
                </div>
              )}

              {/* First Air Date */}
              {firstAirDateFormatted && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cs-card border border-cs-border">
                  <Calendar size={13} className="text-cs-accent" />
                  <span>Premiered {firstAirDateFormatted}</span>
                </div>
              )}

              {/* Language */}
              {spokenLang && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cs-card border border-cs-border">
                  <Globe size={13} className="text-cs-accent" />
                  <span>{spokenLang}</span>
                </div>
              )}

              {/* Status */}
              {show.status && (
                <span className="px-2.5 py-1 rounded-full bg-cs-bg-secondary text-[11px] font-medium border border-cs-border/60">
                  {show.status}
                </span>
              )}
            </div>

            {/* Genres Tag Badges */}
            {show.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {show.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/discover?type=tv&genre=${genre.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cs-card hover:bg-cs-accent/15 border border-cs-border hover:border-cs-accent/40 text-cs-text hover:text-cs-accent transition-all duration-150"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            {/* ─── Two Rating Displays Side-by-Side (Clearly Labeled) ───────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* TMDB Rating Box */}
              <div className="bg-cs-card/90 border border-cs-border rounded-2xl p-4.5 flex items-center gap-4 shadow-cs hover:border-cs-border/80 transition-colors">
                <div className="w-13 h-13 rounded-2xl bg-yellow-500/10 border border-cs-accent/30 flex items-center justify-center shrink-0">
                  <Star size={26} className="fill-cs-accent text-cs-accent" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-cs-text-secondary">
                    TMDB Rating
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span
                      className={`text-2xl sm:text-3xl font-black tracking-tight ${getRatingColor(
                        show.vote_average
                      )}`}
                    >
                      {formatRating(show.vote_average)}
                    </span>
                    <span className="text-xs font-semibold text-cs-text-secondary">/ 10</span>
                  </div>
                  <div className="text-[11px] text-cs-text-secondary mt-0.5">
                    {show.vote_count ? `${show.vote_count.toLocaleString()} votes` : 'No votes yet'}
                  </div>
                </div>
              </div>

              {/* CineScope Community Rating Box */}
              <div className="bg-cs-card/90 border border-cs-border rounded-2xl p-4.5 flex items-center gap-4 shadow-cs hover:border-cs-border/80 transition-colors">
                <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Users size={26} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-cyan-400">
                    CineScope Community
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-cs-text tracking-tight">
                      {communityRating?.average ? formatRating(communityRating.average) : '—'}
                    </span>
                    <span className="text-xs font-semibold text-cs-text-secondary">/ 10</span>
                  </div>
                  <div className="text-[11px] text-cs-text-secondary mt-0.5">
                    {communityRating?.count
                      ? `${communityRating.count.toLocaleString()} member reviews`
                      : 'Be the first to rate'}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Overview / Synopsis ────────────────────────────────────────── */}
            <div className="bg-cs-card/60 border border-cs-border/80 rounded-2xl p-5 sm:p-6 shadow-cs space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-cs-text tracking-tight flex items-center gap-2">
                <span>Overview & Synopsis</span>
              </h2>
              <p className="text-sm sm:text-base text-cs-text-secondary leading-relaxed font-normal whitespace-pre-line">
                {show.overview || 'No synopsis has been provided for this series yet.'}
              </p>
            </div>

            {/* ─── Creators / Showrunners Section ─────────────────────────────── */}
            {creators.length > 0 && (
              <div className="p-5 rounded-2xl bg-cs-card/60 border border-cs-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-cs-text-secondary">
                  Created By / Showrunners
                </span>
                <p className="text-sm font-semibold text-cs-text mt-1">
                  {creators.map((c) => c.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Cast Carousel Section ──────────────────────────────────────────── */}
        {topCast.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <CastCarousel
              cast={topCast}
              crew={show.credits?.crew}
              title="Top Billed Cast"
              maxItems={15}
            />
          </div>
        )}

        {/* ─── Interactive Rating & Distribution Grid ─────────────────────────── */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Rating Input Component (left column) */}
          <div className="lg:col-span-5 space-y-6">
            <RatingInput
              tmdbId={show.id}
              mediaType="tv"
              initialRating={userRating}
              onRated={handleRated}
            />
          </div>

          {/* Rating Distribution Component (right column) */}
          <div className="lg:col-span-7">
            <RatingDistribution
              distribution={communityRating?.distribution || {}}
              average={communityRating?.average}
              count={communityRating?.count || 0}
            />
          </div>
        </div>

        {/* ─── Reviews Section ────────────────────────────────────────────────── */}
        <div className="mt-12 lg:mt-16">
          <ReviewSection
            tmdbId={show.id}
            mediaType="tv"
            movieTitle={title}
          />
        </div>

        {/* ─── Similar TV Shows Carousel ──────────────────────────────────────── */}
        {similarShows.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <HorizontalMediaCarousel
              title="More Shows Like This"
              subtitle="TV series sharing similar genres, tone, and audience appeal"
              items={similarShows}
              mediaType="tv"
              cardSize="md"
            />
          </div>
        )}
      </div>

      {/* ─── Trailer Modal ──────────────────────────────────────────────────── */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={trailerUrl}
        title={`${title} - Official Trailer`}
      />

      {/* ─── Log to Diary Modal ──────────────────────────────────────────────── */}
      <LogToDiaryModal
        isOpen={diaryModalOpen}
        onClose={() => setDiaryModalOpen(false)}
        movie={{ ...show, mediaType: 'tv' }}
        onSuccess={() => {
          setDiaryLoggedCount((prev) => prev + 1)
          fetchData()
        }}
      />
    </div>
  )
}

export default TVDetails
