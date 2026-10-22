// TMDB Image base URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const getPosterUrl = (path, size = 'w342') => {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const getProfileUrl = (path, size = 'w185') => {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const getOriginalUrl = (path) => {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/original${path}`
}

// Format release date
export const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatYear = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).getFullYear()
}

// Format runtime (minutes → hours and minutes)
export const formatRuntime = (minutes) => {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// Format rating
export const formatRating = (rating) => {
  if (!rating && rating !== 0) return 'N/A'
  return Math.round(rating * 10) / 10
}

// Get rating color
export const getRatingColor = (rating) => {
  if (!rating) return 'text-cs-text-secondary'
  if (rating >= 8) return 'text-cs-success'
  if (rating >= 6) return 'text-cs-accent'
  return 'text-cs-error'
}

// Truncate text
export const truncate = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// Get media type label
export const getMediaTypeLabel = (mediaType) => {
  switch (mediaType) {
    case 'movie': return 'Movie'
    case 'tv': return 'TV Show'
    case 'person': return 'Person'
    default: return mediaType || 'Unknown'
  }
}

// Get YouTube trailer URL
export const getTrailerUrl = (videos) => {
  if (!videos?.results?.length) return null
  const trailer = videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  ) || videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  ) || videos.results.find(
    (v) => v.site === 'YouTube'
  )
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null
}

// Format number with commas
export const formatNumber = (num) => {
  if (!num && num !== 0) return 'N/A'
  return num.toLocaleString()
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Get time ago string
export const timeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (weeks > 0) return `${weeks}w ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}
