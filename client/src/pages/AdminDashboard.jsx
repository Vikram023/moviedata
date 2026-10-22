import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldAlert,
  Users,
  Star,
  MessageSquare,
  Layers,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  BarChart2,
  Eye,
  Check,
  X,
  UserCheck,
  UserX,
  FileText,
  TrendingUp,
  RefreshCw,
  Loader2,
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
  getAdminDashboard,
  getAdminUsers,
  updateUserStatus,
  getAdminReports,
  updateReport,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatNumber, timeAgo } from '../utils/helpers'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth()

  // Tab navigation: 'overview' | 'users' | 'reports'
  const [activeTab, setActiveTab] = useState('overview')

  // Overview Data
  const [dashboardData, setDashboardData] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  // Users Data
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userStatusToUpdate, setUserStatusToUpdate] = useState(null)
  const [userStatusUpdating, setUserStatusUpdating] = useState(false)

  // Reports Data
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportStatusFilter, setReportStatusFilter] = useState('pending')
  const [selectedReportToResolve, setSelectedReportToResolve] = useState(null)
  const [resolveForm, setResolveForm] = useState({
    status: 'reviewed',
    adminNote: '',
    removeContent: true,
  })
  const [resolveLoading, setResolveLoading] = useState(false)

  // Fetch Dashboard Overview
  const fetchOverview = useCallback(async () => {
    try {
      setOverviewLoading(true)
      const res = await getAdminDashboard()
      setDashboardData(res.data || res)
    } catch (err) {
      toast.error(err.message || 'Failed to load admin dashboard overview')
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  // Fetch Users
  const fetchUsers = useCallback(async (searchQuery = '') => {
    try {
      setUsersLoading(true)
      const res = await getAdminUsers({ search: searchQuery, limit: 50 })
      const data = res.data?.users || res.users || []
      setUsers(data)
    } catch (err) {
      toast.error(err.message || 'Failed to load users list')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  // Fetch Reports
  const fetchReports = useCallback(async (status = 'pending') => {
    try {
      setReportsLoading(true)
      const res = await getAdminReports({ status, limit: 50 })
      const data = res.data?.reports || res.reports || []
      setReports(data)
    } catch (err) {
      toast.error(err.message || 'Failed to load moderation reports')
    } finally {
      setReportsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  // Lazy tab data loading
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers()
    } else if (activeTab === 'reports') {
      fetchReports(reportStatusFilter)
    }
  }, [activeTab, reportStatusFilter, fetchUsers, fetchReports, users.length])

  // Handle User Status toggle (active <-> disabled)
  const handleToggleUserStatus = async () => {
    if (!userStatusToUpdate) return
    const { user, targetStatus } = userStatusToUpdate

    try {
      setUserStatusUpdating(true)
      await updateUserStatus(user._id, targetStatus)
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, accountStatus: targetStatus } : u
        )
      )
      toast.success(`User "${user.name}" status updated to ${targetStatus}`)
      setUserStatusToUpdate(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update user status')
    } finally {
      setUserStatusUpdating(false)
    }
  }

  // Handle Report Resolution
  const handleSaveReportResolution = async (e) => {
    e.preventDefault()
    if (!selectedReportToResolve) return

    try {
      setResolveLoading(true)
      await updateReport(selectedReportToResolve._id, {
        status: resolveForm.status,
        adminNote: resolveForm.adminNote,
        removeContent: resolveForm.removeContent,
      })

      setReports((prev) =>
        prev.map((r) =>
          r._id === selectedReportToResolve._id
            ? {
                ...r,
                status: resolveForm.status,
                adminNote: resolveForm.adminNote,
                reviewedBy: { name: currentAdmin?.name || 'Admin' },
              }
            : r
        )
      )

      toast.success(`Report marked as ${resolveForm.status}`)
      setSelectedReportToResolve(null)
      // Refresh dashboard counts
      fetchOverview()
    } catch (err) {
      toast.error(err.message || 'Failed to update report')
    } finally {
      setResolveLoading(false)
    }
  }

  // Chart data for Overview
  const stats = dashboardData?.stats || {
    totalUsers: 0,
    totalRatings: 0,
    totalReviews: 0,
    totalLists: 0,
    pendingReports: 0,
  }

  const overviewBarData = [
    { name: 'Users', count: stats.totalUsers, color: '#38BDF8' },
    { name: 'Ratings', count: stats.totalRatings, color: '#F5C518' },
    { name: 'Reviews', count: stats.totalReviews, color: '#A855F7' },
    { name: 'Lists', count: stats.totalLists, color: '#34D399' },
    { name: 'Reports', count: stats.pendingReports, color: '#EF4444' },
  ]

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-24 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cs-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide uppercase mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CineScope Administration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cs-text">
              Admin Cockpit
            </h1>
            <p className="text-sm text-cs-text-secondary mt-1">
              Platform telemetry, user access enforcement, and moderation queue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                fetchOverview()
                if (activeTab === 'users') fetchUsers(userSearch)
                if (activeTab === 'reports') fetchReports(reportStatusFilter)
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cs-card border border-cs-border hover:border-cs-accent/50 text-cs-text text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cs-accent" />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mt-6 border-b border-cs-border">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Overview & Stats</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts</span>
            {stats.totalUsers > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cs-card text-cs-text-secondary">
                {stats.totalUsers}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-cs-accent text-cs-accent'
                : 'border-transparent text-cs-text-secondary hover:text-cs-text'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Moderation Reports</span>
            {stats.pendingReports > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cs-error/20 border border-cs-error/40 text-cs-error font-bold">
                {stats.pendingReports}
              </span>
            )}
          </button>
        </div>

        {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-8 animate-fade-in">
            {overviewLoading ? (
              <div className="p-12 text-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* 5 Key Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Users */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                    <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Users</span>
                      <Users className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-3xl font-black text-cs-text">
                      {formatNumber(stats.totalUsers)}
                    </span>
                    <p className="text-[11px] text-cs-text-secondary mt-1">Total registered</p>
                  </div>

                  {/* Ratings */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                    <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Ratings</span>
                      <Star className="w-4 h-4 text-cs-accent fill-cs-accent" />
                    </div>
                    <span className="text-3xl font-black text-cs-accent">
                      {formatNumber(stats.totalRatings)}
                    </span>
                    <p className="text-[11px] text-cs-text-secondary mt-1">Community scores</p>
                  </div>

                  {/* Reviews */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                    <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Reviews</span>
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-3xl font-black text-cs-text">
                      {formatNumber(stats.totalReviews)}
                    </span>
                    <p className="text-[11px] text-cs-text-secondary mt-1">Published critiques</p>
                  </div>

                  {/* Custom Lists */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs">
                    <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Lists</span>
                      <Layers className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-3xl font-black text-cs-text">
                      {formatNumber(stats.totalLists)}
                    </span>
                    <p className="text-[11px] text-cs-text-secondary mt-1">Custom curations</p>
                  </div>

                  {/* Pending Reports */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-5 shadow-cs col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between text-cs-text-secondary mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Reports</span>
                      <AlertTriangle className="w-4 h-4 text-cs-error" />
                    </div>
                    <span className="text-3xl font-black text-cs-error">
                      {stats.pendingReports}
                    </span>
                    <p className="text-[11px] text-cs-text-secondary mt-1">Pending review</p>
                  </div>
                </div>

                {/* Recharts System Metrics Overview */}
                <div className="bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-cs-border">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-cs-accent" />
                      <h3 className="text-base font-bold text-cs-text">
                        Platform Volume Breakdown
                      </h3>
                    </div>
                    <span className="text-xs text-cs-text-secondary">
                      Aggregated database entities
                    </span>
                  </div>

                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={overviewBarData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
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
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#181D29',
                            borderColor: '#292F3B',
                            borderRadius: '12px',
                            color: '#F5F5F5',
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                          {overviewBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Split Row: Recent Users Table & Most-Rated Titles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Users Table */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-cs-border">
                      <h3 className="text-base font-bold text-cs-text flex items-center gap-2">
                        <Users className="w-4 h-4 text-cs-accent" />
                        <span>Recently Registered Users</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className="text-xs text-cs-accent hover:underline font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-cs-border/60 text-cs-text-secondary uppercase">
                            <th className="pb-2">User</th>
                            <th className="pb-2">Role</th>
                            <th className="pb-2 text-right">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cs-border/40">
                          {dashboardData?.recentUsers?.map((u) => (
                            <tr key={u._id} className="hover:bg-cs-bg-secondary/40">
                              <td className="py-2.5">
                                <span className="font-bold text-cs-text block">{u.name}</span>
                                <span className="text-[11px] text-cs-text-secondary">{u.email}</span>
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                    u.role === 'admin'
                                      ? 'bg-cs-accent/20 text-cs-accent border border-cs-accent/40'
                                      : 'bg-cs-bg-secondary text-cs-text-secondary border border-cs-border'
                                  }`}
                                >
                                  {u.role || 'user'}
                                </span>
                              </td>
                              <td className="py-2.5 text-right text-cs-text-secondary">
                                {timeAgo(u.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Most Rated Titles */}
                  <div className="bg-cs-card border border-cs-border rounded-2xl p-6 shadow-cs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-cs-border">
                      <h3 className="text-base font-bold text-cs-text flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cs-accent" />
                        <span>Most-Rated Titles</span>
                      </h3>
                      <span className="text-xs text-cs-text-secondary">By vote volume</span>
                    </div>

                    <div className="space-y-3">
                      {dashboardData?.mostRatedTitles?.length > 0 ? (
                        dashboardData.mostRatedTitles.slice(0, 5).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-cs-bg-secondary/50 border border-cs-border/60"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-cs-card border border-cs-border flex items-center justify-center font-bold text-xs text-cs-accent">
                                #{idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-cs-text block">
                                  {item._id?.mediaType === 'tv' ? 'TV Series' : 'Movie'} ID #{item._id?.tmdbId}
                                </span>
                                <span className="text-[10px] text-cs-text-secondary uppercase">
                                  {item._id?.mediaType}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-cs-accent bg-cs-accent/10 px-2.5 py-1 rounded-lg border border-cs-accent/20">
                              {item.count} ratings
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-cs-text-secondary p-4 text-center">
                          No title ratings aggregated yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── TAB 2: USERS MANAGEMENT ───────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-secondary" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    fetchUsers(e.target.value)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-cs-card border border-cs-border rounded-xl text-xs sm:text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent"
                />
              </div>

              <span className="text-xs text-cs-text-secondary self-center sm:self-auto">
                Showing {users.length} accounts
              </span>
            </div>

            {/* Users Table */}
            <div className="bg-cs-card border border-cs-border rounded-2xl overflow-hidden shadow-cs">
              {usersLoading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-cs-bg-secondary/70 border-b border-cs-border text-cs-text-secondary uppercase text-[11px] font-bold">
                        <th className="py-3.5 px-4">User</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Account Status</th>
                        <th className="py-3.5 px-4">Joined</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cs-border/60">
                      {users.map((u) => {
                        const isSelf = u._id === currentAdmin?._id
                        const isDisabled = u.accountStatus === 'disabled'

                        return (
                          <tr key={u._id} className="hover:bg-cs-bg-secondary/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cs-accent/20 border border-cs-accent/30 text-cs-accent flex items-center justify-center font-bold text-xs uppercase">
                                  {u.name?.charAt(0) || 'U'}
                                </div>
                                <span className="font-bold text-cs-text">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-cs-text-secondary">{u.email}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                  u.role === 'admin'
                                    ? 'bg-cs-accent/20 text-cs-accent border border-cs-accent/40'
                                    : 'bg-cs-bg-secondary text-cs-text-secondary border border-cs-border'
                                }`}
                              >
                                {u.role || 'user'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  isDisabled
                                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                                    : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isDisabled ? 'bg-rose-400' : 'bg-emerald-400'
                                  }`}
                                />
                                <span>{isDisabled ? 'Disabled' : 'Active'}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-cs-text-secondary">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isSelf ? (
                                <span className="text-xs text-cs-text-secondary italic">Current Admin</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUserStatusToUpdate({
                                      user: u,
                                      targetStatus: isDisabled ? 'active' : 'disabled',
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    isDisabled
                                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                                      : 'bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/40'
                                  }`}
                                >
                                  {isDisabled ? <UserCheck size={12} /> : <UserX size={12} />}
                                  <span>{isDisabled ? 'Enable' : 'Disable'}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-cs-text-secondary">
                  No users found matching query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: MODERATION REPORTS ──────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="mt-8 space-y-6 animate-fade-in">
            {/* Filter by status buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-cs-card border border-cs-border rounded-xl p-1 text-xs">
                {['pending', 'reviewed', 'dismissed', 'all'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setReportStatusFilter(status)
                      fetchReports(status)
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      reportStatusFilter === status
                        ? 'bg-cs-accent text-cs-bg shadow-sm'
                        : 'text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <span className="text-xs text-cs-text-secondary">
                {reports.length} report{reports.length === 1 ? '' : 's'} in queue
              </span>
            </div>

            {/* Reports List */}
            {reportsLoading ? (
              <div className="p-12 text-center">
                <LoadingSpinner size="md" />
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((rep) => {
                  const isPending = rep.status === 'pending'
                  const isDismissed = rep.status === 'dismissed'

                  return (
                    <div
                      key={rep._id}
                      className="bg-cs-card border border-cs-border rounded-2xl p-5 sm:p-6 shadow-cs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-cs-border/60">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                isPending
                                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                                  : isDismissed
                                  ? 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                              }`}
                            >
                              {rep.status}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-cs-accent">
                              Target: {rep.targetType}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-cs-text">
                            Reason: {rep.reason || 'Flagged inappropriate content'}
                          </h3>
                        </div>

                        {/* Action: Resolve/Review Button */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReportToResolve(rep)
                              setResolveForm({
                                status: 'reviewed',
                                adminNote: rep.adminNote || '',
                                removeContent: true,
                              })
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cs-bg-secondary hover:bg-cs-card border border-cs-border hover:border-cs-accent text-cs-text hover:text-cs-accent font-bold text-xs transition-all"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-cs-accent" />
                            <span>Moderate Report</span>
                          </button>
                        </div>
                      </div>

                      {/* Description & Metadata */}
                      <div className="mt-4 space-y-2 text-xs sm:text-sm">
                        {rep.description && (
                          <div className="p-3 rounded-xl bg-cs-bg-secondary/60 border border-cs-border/60 text-cs-text-secondary leading-relaxed">
                            <span className="font-bold text-cs-text block mb-1">
                              Reporter Notes:
                            </span>
                            {rep.description}
                          </div>
                        )}

                        {rep.adminNote && (
                          <div className="p-3 rounded-xl bg-yellow-950/20 border border-yellow-500/30 text-yellow-300 leading-relaxed">
                            <span className="font-bold block mb-1">Admin Action Note:</span>
                            {rep.adminNote}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-cs-text-secondary pt-2">
                          <span>
                            Reported by:{' '}
                            <strong className="text-cs-text">
                              {rep.reporterId?.name || 'Anonymous user'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>Target ID: <code className="text-cs-accent">{rep.targetId}</code></span>
                          <span>•</span>
                          <span>{formatDate(rep.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No Reports in this Queue"
                description="All flagged reviews and user reports have been cleared or resolved."
              />
            )}
          </div>
        )}
      </div>

      {/* User Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(userStatusToUpdate)}
        title={`${userStatusToUpdate?.targetStatus === 'disabled' ? 'Disable' : 'Enable'} Account`}
        message={`Are you sure you want to ${userStatusToUpdate?.targetStatus} the account for "${userStatusToUpdate?.user?.name}"?`}
        confirmText={userStatusToUpdate?.targetStatus === 'disabled' ? 'Disable User' : 'Enable User'}
        cancelText="Cancel"
        variant={userStatusToUpdate?.targetStatus === 'disabled' ? 'danger' : 'warning'}
        loading={userStatusUpdating}
        onConfirm={handleToggleUserStatus}
        onCancel={() => setUserStatusToUpdate(null)}
      />

      {/* Moderate Report Modal */}
      {selectedReportToResolve && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-cs-card border border-cs-border rounded-2xl p-6 sm:p-8 shadow-cs-lg animate-scale-in">
            <button
              type="button"
              onClick={() => setSelectedReportToResolve(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-cs-text-secondary hover:text-cs-text"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-cs-text mb-1">
              Moderate Report
            </h3>
            <p className="text-xs text-cs-text-secondary mb-6">
              Review flagged content, dismiss or approve removal, and attach administrative notes.
            </p>

            <form onSubmit={handleSaveReportResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text mb-1.5">
                  Resolution Status:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setResolveForm((prev) => ({ ...prev, status: 'reviewed' }))
                    }
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      resolveForm.status === 'reviewed'
                        ? 'bg-cs-accent/20 border-cs-accent text-cs-accent'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    Reviewed & Actioned
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setResolveForm((prev) => ({ ...prev, status: 'dismissed' }))
                    }
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      resolveForm.status === 'dismissed'
                        ? 'bg-cs-accent/20 border-cs-accent text-cs-accent'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    Dismiss Report
                  </button>
                </div>
              </div>

              {/* If target is review, option to take down content */}
              {selectedReportToResolve.targetType === 'review' && (
                <div className="p-3 rounded-xl bg-cs-bg-secondary border border-cs-border flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remove-content-checkbox"
                    checked={resolveForm.removeContent}
                    onChange={(e) =>
                      setResolveForm((prev) => ({
                        ...prev,
                        removeContent: e.target.checked,
                      }))
                    }
                    className="rounded border-cs-border text-cs-accent focus:ring-cs-accent"
                  />
                  <label
                    htmlFor="remove-content-checkbox"
                    className="text-xs text-cs-text cursor-pointer font-medium"
                  >
                    Remove flagged review content from public listing
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text mb-1.5">
                  Admin Resolution Note:
                </label>
                <textarea
                  rows={3}
                  placeholder="State the decision rationale or action taken..."
                  value={resolveForm.adminNote}
                  onChange={(e) =>
                    setResolveForm((prev) => ({
                      ...prev,
                      adminNote: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-cs-bg-secondary border border-cs-border rounded-xl text-xs sm:text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cs-border">
                <button
                  type="button"
                  onClick={() => setSelectedReportToResolve(null)}
                  disabled={resolveLoading}
                  className="px-4 py-2 rounded-xl border border-cs-border text-xs font-semibold text-cs-text-secondary hover:text-cs-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cs-accent text-cs-bg font-bold text-xs shadow-cs-accent hover:bg-yellow-400 active:scale-95 disabled:opacity-50"
                >
                  {resolveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
