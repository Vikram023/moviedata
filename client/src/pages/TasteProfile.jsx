import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Star,
  Film,
  Tv,
  Bookmark,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  BarChart2,
  Clock,
  Compass,
  Award,
  Calendar,
  Activity,
  Layers,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import toast from 'react-hot-toast'
import {
  getTasteProfile,
  getMovieDetails,
  getTVDetails,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import { formatRating, timeAgo, getPosterUrl, formatYear } from '../utils/helpers'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Custom tooltip component for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-cs-card border border-cs-border rounded-xl p-3 shadow-cs-lg text-xs">
        <p className="font-bold text-cs-text flex items-center gap-1.5 mb-1">
          <Star className="w-3.5 h-3.5 fill-cs-accent text-cs-accent" />
          <span>{label} Stars</span>
        </p>
        <p className="text-cs-text-secondary">
          Count:{' '}
          <span className="font-semibold text-cs-accent">
            {data.count} {data.count === 1 ? 'title' : 'titles'}
          </span>
        </p>
      </div>
    )
  }
  return null
}

const TasteProfile = () => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [recentItemsWithDetails, setRecentItemsWithDetails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await getTasteProfile()
        const data = res.data || res

        if (!isMounted) return
        setProfileData(data)

        // If there's recent activity, hydrate the titles & posters
        if (data.recentActivity && data.recentActivity.length > 0) {
          const hydrated = await Promise.all(
            data.recentActivity.map(async (act) => {
              try {
                const itemRes =
                  act.mediaType === 'tv'
                    ? await getTVDetails(act.tmdbId)
                    : await getMovieDetails(act.tmdbId)
                const details = itemRes.data?.movie || itemRes.data?.tv || itemRes.data || itemRes
                return {
                  ...act,
                  title: details.title || details.name || `Title #${act.tmdbId}`,
                  posterPath: details.poster_path,
                  releaseDate: details.release_date || details.first_air_date,
                }
              } catch {
                return {
                  ...act,
                  title: `${act.mediaType === 'tv' ? 'Series' : 'Movie'} #${act.tmdbId}`,
                  posterPath: null,
                }
              }
            })
          )
          if (isMounted) setRecentItemsWithDetails(hydrated)
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load taste profile')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProfile()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-cs-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const isEmpty =
    !profileData ||
    profileData.empty ||
    (profileData.totalRatings === 0 && profileData.totalWatchlist === 0)

  // Format rating distribution array for Recharts
  const chartData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
    const count = profileData?.ratingDistribution?.[rating] || 0
    return {
      score: `${rating}★`,
      rawScore: rating,
      count,
    }
  })

  // Color bar based on rating: red (<6), yellow (6-7), green (8-10)
  const getBarColor = (score) => {
    if (score >= 8) return '#22C55E' // emerald / green
    if (score >= 6) return '#F5C518' // cinescope yellow
    return '#EF4444' // red
  }

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cs-card via-cs-bg-secondary to-cs-card border border-cs-border p-6 sm:p-8 mb-8 shadow-cs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cs-accent/15 border border-cs-accent/30 text-cs-accent text-xs font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cinematic Fingerprint</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cs-text">
                Your Taste Profile
              </h1>
              <p className="text-sm sm:text-base text-cs-text-secondary mt-1">
                A quantitative overview of your ratings, watching milestones, and distribution habits.
              </p>
            </div>

            {user?.name && (
              <div className="flex items-center gap-3 bg-cs-bg/60 border border-cs-border px-4 py-2.5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-cs-accent text-cs-bg flex items-center justify-center font-black text-sm uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs text-cs-text-secondary block">Member</span>
                  <span className="text-sm font-bold text-cs-text">{user.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {isEmpty ? (
          <EmptyState
            icon={BarChart2}
            title="No Taste Data Recorded Yet"
            description="Start rating movies and TV shows you've watched! Your taste profile, rating curves, and statistical breakdowns will automatically generate here."
            actionText="Discover Movies to Rate"
            actionLink="/discover"
            actionIcon={Compass}
            className="my-12"
          />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Card 1: Average Rating */}
              <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs relative overflow-hidden">
                <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Avg Rating
                  </span>
                  <Star className="w-4 h-4 text-cs-accent fill-cs-accent" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-cs-text">
                    {profileData.averageRating || '—'}
                  </span>
                  <span className="text-xs text-cs-text-secondary">/ 10</span>
                </div>
                <p className="text-[11px] text-cs-text-secondary mt-1.5">
                  Across all submitted ratings
                </p>
              </div>

              {/* Card 2: Total Ratings */}
              <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Ratings
                  </span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-cs-text">
                  {profileData.totalRatings || 0}
                </span>
                <p className="text-[11px] text-cs-text-secondary mt-1.5">
                  Rated movies & series
                </p>
              </div>

              {/* Card 3: Total Reviews */}
              <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Reviews Written
                  </span>
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-cs-text">
                  {profileData.totalReviews || 0}
                </span>
                <p className="text-[11px] text-cs-text-secondary mt-1.5">
                  Detailed written opinions
                </p>
              </div>

              {/* Card 4: Watched Count */}
              <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Watched Count
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-cs-success" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-cs-success">
                  {profileData.watchedCount || 0}
                </span>
                <p className="text-[11px] text-cs-text-secondary mt-1.5">
                  Completed watchlist items
                </p>
              </div>

              {/* Card 5: Watchlist Size */}
              <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Watchlist Size
                  </span>
                  <Bookmark className="w-4 h-4 text-cs-accent" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-cs-accent">
                  {profileData.totalWatchlist || 0}
                </span>
                <p className="text-[11px] text-cs-text-secondary mt-1.5">
                  {profileData.plannedCount || 0} currently planned
                </p>
              </div>
            </div>

            {/* Rating Distribution Bar Chart */}
            <div className="bg-cs-card border border-cs-border rounded-2xl p-6 sm:p-8 shadow-cs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-cs-border">
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-5 h-5 text-cs-accent" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-cs-text">
                      Rating Distribution Curve
                    </h2>
                    <p className="text-xs text-cs-text-secondary">
                      Distribution frequency of scores from 1 to 10
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-cs-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cs-success" />
                    <span>8 - 10 (Masterpieces)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cs-accent" />
                    <span>6 - 7 (Good)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cs-error" />
                    <span>1 - 5 (Mediocre/Poor)</span>
                  </span>
                </div>
              </div>

              {/* Recharts Container */}
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="score"
                      stroke="#A1A8B5"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#292F3B' }}
                    />
                    <YAxis
                      stroke="#A1A8B5"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#292F3B' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getBarColor(entry.rawScore)}
                          className="transition-all duration-300 hover:brightness-125"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-cs-card border border-cs-border rounded-2xl p-6 sm:p-8 shadow-cs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-cs-border">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-cs-accent" />
                  <h2 className="text-lg sm:text-xl font-bold text-cs-text">
                    Recent Rating Activity
                  </h2>
                </div>
                <span className="text-xs text-cs-text-secondary">
                  Last {recentItemsWithDetails.length} ratings
                </span>
              </div>

              {recentItemsWithDetails.length > 0 ? (
                <div className="divide-y divide-cs-border/60">
                  {recentItemsWithDetails.map((item) => {
                    const isTv = item.mediaType === 'tv'
                    const detailUrl = isTv ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`
                    const posterUrl = getPosterUrl(item.posterPath, 'w92')

                    return (
                      <div
                        key={item._id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-cs-bg-secondary/40 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Link
                            to={detailUrl}
                            className="w-10 h-14 rounded-lg bg-cs-bg-secondary shrink-0 overflow-hidden border border-cs-border/60 hover:border-cs-accent transition-colors block"
                          >
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-cs-text-secondary text-xs">
                                {isTv ? <Tv size={16} /> : <Film size={16} />}
                              </div>
                            )}
                          </Link>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cs-accent">
                                {isTv ? 'TV' : 'Movie'}
                              </span>
                              <span className="text-xs text-cs-text-secondary">
                                • {timeAgo(item.createdAt)}
                              </span>
                            </div>
                            <Link
                              to={detailUrl}
                              className="text-sm font-bold text-cs-text hover:text-cs-accent transition-colors block truncate mt-0.5"
                            >
                              {item.title}
                            </Link>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="shrink-0 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cs-bg-secondary border border-cs-border font-extrabold text-sm text-cs-text">
                            <Star className="w-4 h-4 fill-cs-accent text-cs-accent" />
                            <span>{item.rating}</span>
                            <span className="text-xs text-cs-text-secondary font-normal">/10</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-cs-text-secondary">
                  No recent rating activity found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TasteProfile
