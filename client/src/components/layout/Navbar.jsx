import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  Search,
  X,
  Menu,
  LogOut,
  User,
  Bookmark,
  Star,
  LayoutGrid,
  Film,
  Tv,
  Compass,
  Sparkles,
  ChevronDown,
  BookOpen,
} from 'lucide-react'
import useAuthDefault, { useAuth as useAuthNamed } from '../../context/AuthContext'
import api from '../../services/api'
import { getPosterUrl } from '../../utils/helpers'

// Safe resolution for useAuth regardless of import flavor
const useAuth = typeof useAuthDefault === 'function' ? useAuthDefault : useAuthNamed

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Navigation Links
  const navLinks = [
    { label: 'Home', path: '/', icon: Film },
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'TV Shows', path: '/tv', icon: Tv },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark, authOnly: false },
    { label: 'Diary', path: '/diary', icon: BookOpen, authOnly: false },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles, authOnly: false },
  ]

  // Header scroll state for glassmorphism
  const [isScrolled, setIsScrolled] = useState(false)

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Avatar dropdown state
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)

  // Search and Suggestions state
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false)

  // Refs for click outside
  const searchContainerRef = useRef(null)
  const avatarDropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Monitor scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus and dropdowns on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsAvatarOpen(false)
    setIsSuggestionsOpen(false)
    setIsMobileSearchExpanded(false)
  }, [location.pathname])

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSuggestionsOpen(false)
      }

      if (
        avatarDropdownRef.current &&
        !avatarDropdownRef.current.contains(event.target)
      ) {
        setIsAvatarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut listener (Escape to close search/avatar, '/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSuggestionsOpen(false)
        setIsAvatarOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search suggestion fetch
  const fetchSuggestions = useCallback(async (query) => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([])
      setIsSuggestionsOpen(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await api.get(`/tmdb/search?query=${encodeURIComponent(trimmed)}&page=1`)
      const rawResults = res?.data?.results || res?.results || []

      // Filter and limit to top 6 relevant results (movies & tv shows prioritized)
      const validResults = rawResults
        .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 6)

      setSuggestions(validResults)
      setIsSuggestionsOpen(validResults.length > 0)
    } catch {
      setSuggestions([])
      setIsSuggestionsOpen(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle Search Input Change with 300ms debounce
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!value.trim()) {
      setSuggestions([])
      setIsSuggestionsOpen(false)
      return
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    setIsSuggestionsOpen(false)
    setIsMobileMenuOpen(false)
    setIsMobileSearchExpanded(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  // Handle Suggestion Click
  const handleSelectSuggestion = (item) => {
    setIsSuggestionsOpen(false)
    setSearchQuery('')
    const targetRoute = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`
    navigate(targetRoute)
  }

  // Handle Logout
  const handleLogout = async () => {
    setIsAvatarOpen(false)
    setIsMobileMenuOpen(false)
    try {
      await logout()
      navigate('/')
    } catch {
      // Ignore error and navigate home
      navigate('/')
    }
  }

  // Helper to determine if link is active
  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Get user display avatar
  const renderUserAvatar = (size = 'w-9 h-9 text-sm') => {
    if (user?.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={user?.name || 'User'}
          className={`${size} rounded-full object-cover border border-cs-border hover:border-cs-accent transition-colors`}
        />
      )
    }
    const initial = (user?.name?.charAt(0) || 'U').toUpperCase()
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-tr from-cs-accent/30 to-cs-accent/80 border border-cs-accent/40 flex items-center justify-center font-bold text-cs-bg select-none shadow-sm`}
      >
        {initial}
      </div>
    )
  }

  const userId = user?._id || user?.id

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0D12]/90 backdrop-blur-md border-b border-cs-border shadow-cs'
          : 'bg-[#0B0D12]/60 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            {/* CineScope Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0 focus:outline-none"
              aria-label="CineScope Home"
            >
              <div className="w-9 h-9 rounded-xl bg-cs-card border border-cs-border flex items-center justify-center text-cs-accent shadow-cs group-hover:border-cs-accent/70 group-hover:shadow-cs-accent/20 group-hover:scale-105 transition-all duration-300">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-wider text-cs-text select-none">
                CINE<span className="text-cs-accent">SCOPE</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path)
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? 'text-cs-accent bg-cs-card/90 font-semibold shadow-sm border border-cs-border'
                        : 'text-cs-text-secondary hover:text-cs-text hover:bg-cs-card/40'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Center / Right: Search Bar & Actions */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end max-w-xl">
            {/* Desktop Search Bar with Suggestions Dropdown */}
            <div ref={searchContainerRef} className="relative w-full max-w-xs md:max-w-sm hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (suggestions.length > 0) setIsSuggestionsOpen(true)
                    }}
                    placeholder="Search movies, TV shows..."
                    className="w-full h-10 pl-10 pr-9 rounded-xl bg-cs-card/80 border border-cs-border text-sm text-cs-text placeholder-cs-text-secondary/70 focus:outline-none focus:border-cs-accent/60 focus:bg-cs-card focus:ring-1 focus:ring-cs-accent/30 transition-all duration-200"
                  />
                  {/* Left Search Icon */}
                  <Search className="w-4 h-4 text-cs-text-secondary absolute left-3.5 pointer-events-none" />

                  {/* Right: Clear Button or Loading Indicator */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setSuggestions([])
                        setIsSuggestionsOpen(false)
                      }}
                      className="absolute right-3 p-0.5 rounded-md text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {isSuggestionsOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-cs-card/95 border border-cs-border rounded-xl shadow-cs-lg overflow-hidden backdrop-blur-md z-50 animate-slide-down">
                  {/* Dropdown Header */}
                  <div className="px-3.5 py-2 text-xs font-semibold text-cs-text-secondary uppercase tracking-wider border-b border-cs-border/60 bg-cs-bg-secondary/40 flex items-center justify-between">
                    <span>Quick Suggestions</span>
                    {isSearching && (
                      <span className="text-cs-accent text-[11px] animate-pulse">Searching...</span>
                    )}
                  </div>

                  {/* Suggestions List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-cs-border/40">
                    {suggestions.map((item) => {
                      const title = item.title || item.name
                      const releaseDate = item.release_date || item.first_air_date
                      const year = releaseDate ? new Date(releaseDate).getFullYear() : null
                      const posterUrl = getPosterUrl(item.poster_path, 'w92')
                      const isTV = item.media_type === 'tv'

                      return (
                        <button
                          key={`${item.media_type}-${item.id}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-cs-bg-secondary/80 transition-colors group focus:bg-cs-bg-secondary/80 focus:outline-none"
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-14 bg-cs-bg rounded shrink-0 overflow-hidden border border-cs-border flex items-center justify-center">
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <Film className="w-5 h-5 text-cs-text-secondary/50" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-cs-text group-hover:text-cs-accent truncate transition-colors">
                              {title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-cs-text-secondary">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isTV
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-cs-accent/20 text-cs-accent border border-cs-accent/30'
                                }`}
                              >
                                {isTV ? 'TV Series' : 'Movie'}
                              </span>
                              {year && <span>{year}</span>}
                              {item.vote_average > 0 && (
                                <span className="flex items-center gap-1 text-cs-text">
                                  <Star className="w-3 h-3 text-cs-accent fill-cs-accent" />
                                  {item.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* View All Results Button */}
                  <div className="p-2 bg-cs-bg-secondary/60 border-t border-cs-border/60">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-cs-accent hover:text-cs-bg hover:bg-cs-accent transition-all text-center"
                    >
                      View all results for &ldquo;{searchQuery}&rdquo; →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Button (toggles mobile search bar) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchExpanded((prev) => !prev)}
              className="sm:hidden p-2 rounded-xl bg-cs-card border border-cs-border text-cs-text-secondary hover:text-cs-accent transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Authenticated / Guest Section */}
            {isAuthenticated ? (
              /* User Avatar Dropdown */
              <div ref={avatarDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAvatarOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-cs-card/80 border border-cs-border hover:border-cs-accent/50 transition-all duration-200 group focus:outline-none"
                  aria-expanded={isAvatarOpen}
                  aria-label="User menu"
                >
                  {renderUserAvatar()}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-cs-text-secondary group-hover:text-cs-accent transition-transform duration-200 ${
                      isAvatarOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isAvatarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-cs-card/95 border border-cs-border rounded-2xl shadow-cs-lg overflow-hidden backdrop-blur-md z-50 animate-scale-in">
                    {/* User Profile Header */}
                    <div className="p-4 bg-cs-bg-secondary/60 border-b border-cs-border/80">
                      <div className="flex items-center gap-3">
                        {renderUserAvatar('w-10 h-10 text-base')}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-cs-text truncate">
                            {user?.name || 'Cinephile'}
                          </p>
                          <p className="text-xs text-cs-text-secondary truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="mt-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cs-accent/20 border border-cs-accent/40 text-cs-accent uppercase tracking-wider">
                            Administrator
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-0.5 text-sm">
                      <Link
                        to={userId ? `/profile/${userId}` : '/'}
                        onClick={() => setIsAvatarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-cs-text hover:text-cs-accent hover:bg-cs-bg-secondary/80 transition-colors"
                      >
                        <User className="w-4 h-4 text-cs-accent" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/my-lists"
                        onClick={() => setIsAvatarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-cs-text hover:text-cs-accent hover:bg-cs-bg-secondary/80 transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4 text-cs-accent" />
                        <span>My Lists</span>
                      </Link>

                      <Link
                        to="/watchlist"
                        onClick={() => setIsAvatarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-cs-text hover:text-cs-accent hover:bg-cs-bg-secondary/80 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-cs-accent" />
                        <span>Watchlist</span>
                      </Link>

                      <Link
                        to="/diary"
                        onClick={() => setIsAvatarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-cs-text hover:text-cs-accent hover:bg-cs-bg-secondary/80 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-cs-accent" />
                        <span>Movie Diary</span>
                      </Link>

                      <Link
                        to="/taste-profile"
                        onClick={() => setIsAvatarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-cs-text hover:text-cs-accent hover:bg-cs-bg-secondary/80 transition-colors"
                      >
                        <Star className="w-4 h-4 text-cs-accent" />
                        <span>Taste Profile</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAvatarOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-cs-accent hover:bg-cs-bg-secondary/80 transition-colors font-medium"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-cs-border/80" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-cs-error hover:bg-cs-error/10 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-cs-text hover:text-cs-accent transition-colors rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-cs-bg bg-cs-accent hover:bg-yellow-400 rounded-xl transition-all shadow-md shadow-cs-accent/20 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl bg-cs-card border border-cs-border text-cs-text-secondary hover:text-cs-accent transition-colors focus:outline-none"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-cs-accent" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row (toggled via search icon on mobile) */}
        {isMobileSearchExpanded && (
          <div className="sm:hidden pb-3 pt-1 animate-slide-down">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search movies, TV shows..."
                autoFocus
                className="w-full h-10 pl-10 pr-9 rounded-xl bg-cs-card border border-cs-border text-sm text-cs-text placeholder-cs-text-secondary/70 focus:outline-none focus:border-cs-accent/60"
              />
              <Search className="w-4 h-4 text-cs-text-secondary absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-cs-text-secondary hover:text-cs-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer / Hamburger Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden bg-[#0B0D12]/98 border-b border-cs-border backdrop-blur-xl animate-slide-down"
        >
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Mobile Search inside Menu */}
            {!isMobileSearchExpanded && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search movies, TV shows..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-cs-card border border-cs-border text-sm text-cs-text placeholder-cs-text-secondary focus:outline-none focus:border-cs-accent"
                />
                <Search className="w-4 h-4 text-cs-text-secondary absolute left-3.5 top-3.5" />
              </form>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-cs-text-secondary/60 px-3 mb-2">
                Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isLinkActive(link.path)

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      active
                        ? 'bg-cs-card text-cs-accent font-semibold border border-cs-border'
                        : 'text-cs-text-secondary hover:text-cs-text hover:bg-cs-card/40'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-cs-accent" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Section in Mobile Menu */}
            {isAuthenticated ? (
              <div className="pt-4 border-t border-cs-border space-y-3">
                <div className="flex items-center gap-3 px-3">
                  {renderUserAvatar('w-10 h-10 text-base')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-cs-text truncate">
                      {user?.name || 'Cinephile'}
                    </p>
                    <p className="text-xs text-cs-text-secondary truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <Link
                    to={userId ? `/profile/${userId}` : '/'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-cs-text hover:text-cs-accent hover:bg-cs-card/60 transition-colors"
                  >
                    <User className="w-4 h-4 text-cs-accent" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/my-lists"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-cs-text hover:text-cs-accent hover:bg-cs-card/60 transition-colors"
                  >
                    <LayoutGrid className="w-4 h-4 text-cs-accent" />
                    <span>My Lists</span>
                  </Link>

                  <Link
                    to="/taste-profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-cs-text hover:text-cs-accent hover:bg-cs-card/60 transition-colors"
                  >
                    <Star className="w-4 h-4 text-cs-accent" />
                    <span>Taste Profile</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-cs-accent hover:bg-cs-card/60 transition-colors font-medium"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-cs-error hover:bg-cs-error/10 transition-colors font-medium mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-cs-border flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-cs-text bg-cs-card border border-cs-border hover:border-cs-accent rounded-xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-cs-bg bg-cs-accent hover:bg-yellow-400 rounded-xl transition-all shadow-md shadow-cs-accent/20"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
