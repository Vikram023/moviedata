import { useState, useEffect, useCallback } from 'react'
import { checkWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistEntry } from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const useWatchlist = (tmdbId, mediaType) => {
  const { isAuthenticated } = useAuth()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  const checkStatus = useCallback(async () => {
    if (!isAuthenticated || !tmdbId || !mediaType) return
    setChecking(true)
    try {
      const res = await checkWatchlist(mediaType, tmdbId)
      setInWatchlist(res.data.inWatchlist)
      setEntry(res.data.entry)
    } catch {
      // Silent fail
    } finally {
      setChecking(false)
    }
  }, [isAuthenticated, tmdbId, mediaType])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const add = async (movieData = {}) => {
    if (!isAuthenticated) {
      toast.error('Sign in to add to your watchlist')
      return
    }
    setLoading(true)
    try {
      const res = await addToWatchlist({ tmdbId, mediaType, ...movieData })
      setInWatchlist(true)
      setEntry(res.data.item)
      toast.success('Added to watchlist!')
    } catch (err) {
      toast.error(err.message || 'Failed to add to watchlist')
    } finally {
      setLoading(false)
    }
  }

  const remove = async () => {
    if (!entry) return
    setLoading(true)
    try {
      await removeFromWatchlist(entry._id)
      setInWatchlist(false)
      setEntry(null)
      toast.success('Removed from watchlist')
    } catch (err) {
      toast.error(err.message || 'Failed to remove from watchlist')
    } finally {
      setLoading(false)
    }
  }

  const markWatched = async () => {
    if (!entry) return
    setLoading(true)
    try {
      const res = await updateWatchlistEntry(entry._id, { status: 'watched' })
      setEntry(res.data.item)
      toast.success('Marked as watched!')
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const toggle = (movieData) => {
    if (inWatchlist) return remove()
    return add(movieData)
  }

  return { inWatchlist, entry, loading, checking, add, remove, toggle, markWatched }
}
