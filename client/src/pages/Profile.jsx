import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  User,
  Calendar,
  Star,
  MessageSquare,
  Bookmark,
  ListPlus,
  Edit3,
  ThumbsUp,
  ExternalLink,
  Shield,
  Heart,
  Film,
  Tv,
  Check,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Lock,
  Globe,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  getUserProfile,
  updateProfile,
  getUserReviews,
  getUserLists,
  getTasteProfile,
} from '../services/movieService'
import { formatDate, timeAgo, formatNumber } from '../utils/helpers'
import SpoilerReview from '../components/reviews/SpoilerReview'

const AVAILABLE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated, updateUser } = useAuth()

  // Target User ID: parameter or authenticated user's ID
  const targetUserId = userId || currentUser?._id
  const isOwner = Boolean(
    isAuthenticated && currentUser?._id && String(currentUser._id) === String(targetUserId)
  )

  // State
  const [profileUser, setProfileUser] = useState(null)
  const [tasteProfile, setTasteProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1)
  const [lists, setLists] = useState([])
  const [activeTab, setActiveTab] = useState('reviews')

  const [loading, setLoading] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [error, setError] = useState(null)

  // Edit Profile Modal / Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editGenres, setEditGenres] = useState([])
  const [savingProfile, setSavingProfile] = useState(false)

  // Load Main Profile Data
  const loadProfile = useCallback(async () => {
    if (!targetUserId) {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch user profile info
      const profileRes = await getUserProfile(targetUserId)
      const userData = profileRes.data?.user
      setProfileUser(userData)

      // Initialize edit fields
      setEditName(userData?.name || '')
      setEditBio(userData?.bio || '')
      setEditGenres(userData?.favoriteGenres || [])

      // Fetch user reviews
      try {
        const reviewsRes = await getUserReviews(targetUserId, 1)
        setReviews(reviewsRes.data?.reviews || [])
        setReviewsTotal(reviewsRes.data?.total || 0)
        setReviewsTotalPages(reviewsRes.data?.totalPages || 1)
        setReviewsPage(1)
      } catch {
        setReviews([])
      }

      // Fetch user custom lists
      try {
        const listsRes = await getUserLists(targetUserId)
        setLists(listsRes.data?.lists || [])
      } catch {
        setLists([])
      }

      // If owner, fetch rich taste profile stats
      if (isOwner) {
        try {
          const tasteRes = await getTasteProfile()
          setTasteProfile(tasteRes.data)
        } catch {
          setTasteProfile(null)
        }
      }
    } catch (err) {
      setError(err.message || 'User profile not found.')
    } finally {
      setLoading(false)
    }
  }, [targetUserId, isAuthenticated, isOwner, navigate])

  useEffect(() => {
    loadProfile()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [loadProfile])

  // Load more reviews pagination
  const handleLoadMoreReviews = async () => {
    if (reviewsPage >= reviewsTotalPages || loadingReviews) return

    try {
      setLoadingReviews(true)
      const nextPage = reviewsPage + 1
      const res = await getUserReviews(targetUserId, nextPage)
      setReviews((prev) => [...prev, ...(res.data?.reviews || [])])
      setReviewsPage(nextPage)
    } catch (err) {
      toast.error(err.message || 'Failed to load more reviews')
    } finally {
      setLoadingReviews(false)
    }
  }

  // Genre toggle handler for profile edit
  const toggleGenre = (genre) => {
    setEditGenres((prev) => {
      const exists = prev.some((g) => g.id === genre.id)
      if (exists) {
        return prev.filter((g) => g.id !== genre.id)
      } else {
        return [...prev, { id: genre.id, name: genre.name }]
      }
    })
  }

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    try {
      setSavingProfile(true)
      const payload = {
        name: editName.trim(),
        bio: editBio.trim(),
        favoriteGenres: editGenres,
      }

      const res = await updateProfile(payload)
      const updated = res.data?.user

      setProfileUser(updated)
      updateUser(updated)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // Initials for avatar fallback
  const initials = profileUser?.name
    ? profileUser.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'U'

  // ─── Loading Skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-cs-card border border-cs-border rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-cs-bg-secondary" />
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="h-8 bg-cs-bg-secondary rounded w-48 mx-auto sm:mx-0" />
                <div className="h-4 bg-cs-bg-secondary rounded w-64 mx-auto sm:mx-0" />
                <div className="flex gap-2 justify-center sm:justify-start pt-2">
                  <div className="h-6 w-20 rounded-full bg-cs-bg-secondary" />
                  <div className="h-6 w-20 rounded-full bg-cs-bg-secondary" />
                </div>
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-cs-border">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-cs-bg-secondary rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Error State ─────────────────────────────────────────────────────────────
  if (error || !profileUser) {
    return (
      <div className="min-h-[80vh] bg-cs-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-cs-card border border-cs-border rounded-3xl p-8 sm:p-10 shadow-cs-lg">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-cs-error flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-cs-text mb-2">User Not Found</h2>
          <p className="text-sm text-cs-text-secondary mb-6 leading-relaxed">
            {error || 'This user profile does not exist or may have been deleted.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cs-accent hover:bg-yellow-400 text-black font-semibold text-sm shadow-cs-accent/20 shadow-md transition-all active:scale-95"
          >
            <span>Back to CineScope Home</span>
          </Link>
        </div>
      </div>
    )
  }

  // ─── Stats Counts ────────────────────────────────────────────────────────────
  const totalRatings = tasteProfile?.totalRatings ?? 0
  const totalReviewsCount = tasteProfile?.totalReviews ?? reviewsTotal
  const totalListsCount = lists.length
  const totalWatchlist = tasteProfile?.totalWatchlist ?? 0
  const averageScore = tasteProfile?.averageRating ?? null

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-24 pt-6 sm:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ─── Profile Hero Card ──────────────────────────────────────────────── */}
        <div className="relative bg-cs-card border border-cs-border rounded-3xl p-6 sm:p-8 shadow-cs-lg overflow-hidden">
          {/* Subtle ambient gold accent behind avatar */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cs-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
            {/* Avatar & Basic Bio */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Avatar circle */}
              <div className="relative group">
                {profileUser.profileImage ? (
                  <img
                    src={profileUser.profileImage}
                    alt={profileUser.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-cs-accent/60 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#252c3d] via-[#181d29] to-[#0b0d12] border-2 border-cs-accent/50 flex items-center justify-center shadow-lg text-cs-accent text-3xl font-black">
                    {initials}
                  </div>
                )}
                {profileUser.role === 'admin' && (
                  <div
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cs-accent text-black shadow-md"
                    title="CineScope Administrator"
                  >
                    <Shield size={14} className="fill-black" />
                  </div>
                )}
              </div>

              {/* Name, Join date, Bio */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-cs-text">
                    {profileUser.name}
                  </h1>
                  {profileUser.role === 'admin' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cs-accent/15 border border-cs-accent/30 text-cs-accent">
                      Admin
                    </span>
                  )}
                  {isOwner && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-cs-text-secondary">
                  <Calendar size={13} className="text-cs-accent" />
                  <span>Member since {formatDate(profileUser.createdAt)}</span>
                </div>

                {profileUser.bio ? (
                  <p className="text-xs sm:text-sm text-cs-text-secondary leading-relaxed pt-1 whitespace-pre-line">
                    {profileUser.bio}
                  </p>
                ) : (
                  <p className="text-xs text-cs-text-secondary/60 italic pt-1">
                    {isOwner
                      ? 'Add a bio to let others know about your movie taste and favorite directors.'
                      : 'No bio provided yet.'}
                  </p>
                )}

                {/* Favorite Genres Pills */}
                {profileUser.favoriteGenres?.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
                    {profileUser.favoriteGenres.map((g) => (
                      <span
                        key={g.id}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-cs-accent/30 text-cs-accent"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Button (for owner) */}
            {isOwner && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cs-bg-secondary hover:bg-cs-border/40 border border-cs-border text-cs-text hover:text-cs-accent font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
                >
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>

          {/* ─── Profile Stats Bar ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-cs-border/80">
            {/* Reviews Count */}
            <div className="bg-cs-bg-secondary/70 border border-cs-border/60 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-cs-text-secondary mb-1">
                <MessageSquare size={14} className="text-cs-accent" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Reviews</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-cs-text">
                {formatNumber(totalReviewsCount)}
              </div>
            </div>

            {/* Ratings Count */}
            <div className="bg-cs-bg-secondary/70 border border-cs-border/60 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-cs-text-secondary mb-1">
                <Star size={14} className="text-cs-accent fill-cs-accent" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Ratings</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-cs-text">
                {isOwner && totalRatings > 0 ? formatNumber(totalRatings) : '—'}
              </div>
            </div>

            {/* Lists Count */}
            <div className="bg-cs-bg-secondary/70 border border-cs-border/60 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-cs-text-secondary mb-1">
                <ListPlus size={14} className="text-cs-accent" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Lists</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-cs-text">
                {formatNumber(totalListsCount)}
              </div>
            </div>

            {/* Watchlist or Avg Rating */}
            <div className="bg-cs-bg-secondary/70 border border-cs-border/60 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-cs-text-secondary mb-1">
                <Bookmark size={14} className="text-cs-accent" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {isOwner ? 'Watchlist' : 'Favorites'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-cs-text">
                {isOwner ? formatNumber(totalWatchlist) : profileUser.favoriteGenres?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Profile Navigation Tabs ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-cs-border pb-px overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 ${
              activeTab === 'reviews'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <MessageSquare size={16} />
            <span>Reviews ({reviewsTotal})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lists')}
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 ${
              activeTab === 'lists'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <ListPlus size={16} />
            <span>Custom Lists ({lists.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 ${
              activeTab === 'about'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <User size={16} />
            <span>About & Taste</span>
          </button>
        </div>

        {/* ─── TAB 1: User Reviews ───────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-fade-in">
            {reviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="bg-cs-card border border-cs-border rounded-2xl p-5 sm:p-6 shadow-cs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cs-border/60">
                        {/* Title link & Media badge */}
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cs-bg-secondary border border-cs-border text-cs-accent">
                            {rev.mediaType === 'tv' ? 'TV Series' : 'Movie'}
                          </span>
                          <Link
                            to={`/${rev.mediaType || 'movie'}/${rev.tmdbId}`}
                            className="text-sm sm:text-base font-bold text-cs-text hover:text-cs-accent transition-colors flex items-center gap-1.5"
                          >
                            <span>View Title</span>
                            <ExternalLink size={13} />
                          </Link>
                        </div>

                        {/* Rating score & date */}
                        <div className="flex items-center gap-3">
                          {rev.rating > 0 && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-cs-accent/30 text-cs-accent text-xs font-bold">
                              <Star size={13} className="fill-cs-accent text-cs-accent" />
                              <span>{rev.rating}</span>
                              <span className="text-[10px] font-normal text-cs-text-secondary">/10</span>
                            </div>
                          )}
                          <span className="text-xs text-cs-text-secondary">
                            {timeAgo(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Review text snippet with spoiler protection */}
                      <SpoilerReview hasSpoiler={Boolean(rev.containsSpoilers)}>
                        <p className="text-xs sm:text-sm text-cs-text leading-relaxed whitespace-pre-line font-normal">
                          {rev.reviewText}
                        </p>
                      </SpoilerReview>

                      {/* Helpful votes */}
                      <div className="flex items-center gap-1.5 text-xs text-cs-text-secondary pt-2">
                        <ThumbsUp size={13} className="text-cs-accent" />
                        <span>{rev.helpfulCount || 0} users found this helpful</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination button */}
                {reviewsPage < reviewsTotalPages && (
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={handleLoadMoreReviews}
                      disabled={loadingReviews}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cs-card hover:bg-cs-bg-secondary border border-cs-border hover:border-cs-accent/50 text-cs-text font-semibold text-xs sm:text-sm transition-all"
                    >
                      {loadingReviews ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-cs-accent" />
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <span>Load More Reviews</span>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-cs-card border border-cs-border rounded-2xl p-10 text-center flex flex-col items-center">
                <MessageSquare size={36} className="text-cs-accent/60 mb-3" />
                <h3 className="text-base font-bold text-cs-text">No reviews published yet</h3>
                <p className="text-xs sm:text-sm text-cs-text-secondary max-w-sm mt-1">
                  {isOwner
                    ? 'Explore movies or TV shows and share your thoughts to help the CineScope community.'
                    : `${profileUser.name} hasn't written any reviews yet.`}
                </p>
                {isOwner && (
                  <Link
                    to="/movies"
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cs-accent hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    <Film size={15} />
                    <span>Browse Movies to Review</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: Custom Lists ──────────────────────────────────────────── */}
        {activeTab === 'lists' && (
          <div className="space-y-4 animate-fade-in">
            {lists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lists.map((lst) => (
                  <Link
                    key={lst._id}
                    to={`/lists/${lst._id}`}
                    className="group bg-cs-card border border-cs-border hover:border-cs-accent/50 rounded-2xl p-5 shadow-cs transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="text-base font-bold text-cs-text group-hover:text-cs-accent transition-colors truncate">
                          {lst.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lst.visibility === 'public'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {lst.visibility === 'public' ? (
                            <>
                              <Globe size={11} />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <Lock size={11} />
                              <span>Private</span>
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-cs-text-secondary line-clamp-2 leading-relaxed">
                        {lst.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-cs-border/60 text-xs text-cs-text-secondary">
                      <span>Created {formatDate(lst.createdAt)}</span>
                      <span className="font-semibold text-cs-accent group-hover:underline flex items-center gap-1">
                        View List →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-cs-card border border-cs-border rounded-2xl p-10 text-center flex flex-col items-center">
                <ListPlus size={36} className="text-cs-accent/60 mb-3" />
                <h3 className="text-base font-bold text-cs-text">No custom lists found</h3>
                <p className="text-xs sm:text-sm text-cs-text-secondary max-w-sm mt-1">
                  {isOwner
                    ? 'Curate your favorite cinematic themes, director marathons, or weekend watchlists.'
                    : `${profileUser.name} has no public lists available.`}
                </p>
                {isOwner && (
                  <Link
                    to="/lists"
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cs-accent hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Create a New List</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: About & Taste Profile ─────────────────────────────────── */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-fade-in">
            {/* Bio Card */}
            <div className="bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs space-y-3">
              <h3 className="text-base font-bold text-cs-text flex items-center gap-2">
                <User size={18} className="text-cs-accent" />
                <span>Biography</span>
              </h3>
              <p className="text-xs sm:text-sm text-cs-text-secondary leading-relaxed whitespace-pre-line">
                {profileUser.bio || 'This user has not written a biography yet.'}
              </p>
            </div>

            {/* Favorite Genres Card */}
            <div className="bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs space-y-3">
              <h3 className="text-base font-bold text-cs-text flex items-center gap-2">
                <Heart size={18} className="text-cs-accent" />
                <span>Favorite Genres</span>
              </h3>
              {profileUser.favoriteGenres?.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profileUser.favoriteGenres.map((g) => (
                    <span
                      key={g.id}
                      className="px-3.5 py-1.5 rounded-xl bg-cs-bg-secondary border border-cs-border text-cs-text text-xs font-semibold flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cs-accent" />
                      <span>{g.name}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-cs-text-secondary">
                  No favorite genres selected yet.
                </p>
              )}
            </div>

            {/* Account Details Card */}
            <div className="bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs space-y-4">
              <h3 className="text-base font-bold text-cs-text flex items-center gap-2">
                <Calendar size={18} className="text-cs-accent" />
                <span>Account Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-cs-bg-secondary/70 p-3.5 rounded-xl border border-cs-border/60">
                  <span className="text-cs-text-secondary font-medium block">Account Type</span>
                  <span className="text-cs-text font-bold uppercase mt-0.5 block">
                    {profileUser.role || 'Member'}
                  </span>
                </div>

                <div className="bg-cs-bg-secondary/70 p-3.5 rounded-xl border border-cs-border/60">
                  <span className="text-cs-text-secondary font-medium block">Joined CineScope</span>
                  <span className="text-cs-text font-bold mt-0.5 block">
                    {formatDate(profileUser.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Edit Profile Modal ─────────────────────────────────────────────── */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <div className="bg-cs-card border border-cs-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-cs-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cs-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cs-accent/15 border border-cs-accent/30 flex items-center justify-center text-cs-accent">
                  <Edit3 size={18} />
                </div>
                <h3 id="edit-profile-title" className="text-lg font-bold text-cs-text">
                  Edit Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors"
                aria-label="Close edit modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-5">
              {/* Name input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text mb-1.5">
                  Display Name <span className="text-cs-accent">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full bg-cs-bg-secondary border border-cs-border focus:border-cs-accent rounded-xl px-4 py-2.5 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Bio textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text">
                    Biography
                  </label>
                  <span className="text-xs text-cs-text-secondary tabular-nums">
                    {editBio.length} / 300
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={300}
                  placeholder="Share a short bio or movie philosophy..."
                  className="w-full bg-cs-bg-secondary border border-cs-border focus:border-cs-accent rounded-xl p-3 text-sm text-cs-text placeholder:text-cs-text-secondary/50 focus:outline-none resize-none transition-colors"
                />
              </div>

              {/* Favorite Genres Interactive Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cs-text mb-2">
                  Favorite Genres <span className="text-cs-text-secondary font-normal lowercase">(click to toggle)</span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = editGenres.some((g) => g.id === genre.id)
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-cs-accent text-black border-cs-accent shadow-sm'
                            : 'bg-cs-bg-secondary text-cs-text-secondary hover:text-cs-text border-cs-border hover:border-cs-border/80'
                        }`}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                        <span>{genre.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cs-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={savingProfile}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-cs-text-secondary hover:text-cs-text bg-cs-bg-secondary hover:bg-cs-border/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || !editName.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cs-accent hover:bg-yellow-400 text-black shadow-cs-accent/20 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
