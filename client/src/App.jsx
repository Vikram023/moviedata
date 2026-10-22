import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Movies = lazy(() => import('./pages/Movies'))
const TVShows = lazy(() => import('./pages/TVShows'))
const Discover = lazy(() => import('./pages/Discover'))
const MovieDetails = lazy(() => import('./pages/MovieDetails'))
const TVDetails = lazy(() => import('./pages/TVDetails'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const MoodDiscovery = lazy(() => import('./pages/MoodDiscovery'))
const CompareMovies = lazy(() => import('./pages/CompareMovies'))
const TasteProfile = lazy(() => import('./pages/TasteProfile'))
const MyReviews = lazy(() => import('./pages/MyReviews'))
const CustomLists = lazy(() => import('./pages/CustomLists'))
const ListDetail = lazy(() => import('./pages/ListDetail'))
const Diary = lazy(() => import('./pages/Diary'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Guest-only route (redirect if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

const PageLoader = () => (
  <div className="min-h-screen bg-cs-bg flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/movie/:tmdbId" element={<MovieDetails />} />
          <Route path="/tv/:tmdbId" element={<TVDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/mood" element={<MoodDiscovery />} />
          <Route path="/compare" element={<CompareMovies />} />
          <Route path="/lists/:listId" element={<ListDetail />} />

          {/* Guest-only routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/taste-profile" element={<ProtectedRoute><TasteProfile /></ProtectedRoute>} />
          <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
          <Route path="/my-lists" element={<ProtectedRoute><CustomLists /></ProtectedRoute>} />
          <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
