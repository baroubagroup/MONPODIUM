'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { Plan, PLAN_LIMITS } from '@/types'
import {
  AdminArtistUser,
  INITIAL_ADMIN_USERS,
  INITIAL_MODERATION_REPORTS,
} from '@/lib/adminData'
import { ModerationReport } from '@/types'
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Sparkles,
  Filter,
  Check,
  X,
  Ban,
  UserCheck,
  Eye,
  Crown,
  Radio,
  Music,
  Calendar,
  AlertCircle,
  FileText,
  Mail,
  ArrowUpRight,
  Globe,
  TrendingUp,
  BarChart3,
  Headphones,
} from 'lucide-react'
import { GLOBAL_PLATFORM_TRAFFIC } from '@/lib/analyticsData'
import { computeArtistAnalytics, TIME_RANGE_LABELS } from '@/lib/analyticsEngine'
import { AnalyticsTimeRange } from '@/types/analytics'
import { PlatformIcon } from '@/components/artist/PlatformIcons'

export default function AdminDashboardPage() {
  const { isLight } = useDashboardTheme()

  const [users, setUsers] = useState<AdminArtistUser[]>([])
  const [reports, setReports] = useState<ModerationReport[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'analytics'>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<
    'all' | 'verified' | 'unverified' | 'suspended' | 'flagged' | 'paid'
  >('all')

  // Modals
  const [userToDelete, setUserToDelete] = useState<AdminArtistUser | null>(null)
  const [userToInspect, setUserToInspect] = useState<AdminArtistUser | null>(null)
  const [inspectTimeRange, setInspectTimeRange] = useState<AnalyticsTimeRange>('30d')

  // Initialize and synchronize with localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('monpodium_admin_users')
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers))
      } catch {
        setUsers(INITIAL_ADMIN_USERS)
      }
    } else {
      setUsers(INITIAL_ADMIN_USERS)
      localStorage.setItem('monpodium_admin_users', JSON.stringify(INITIAL_ADMIN_USERS))
    }

    const savedReports = localStorage.getItem('monpodium_moderation_reports')
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports))
      } catch {
        setReports(INITIAL_MODERATION_REPORTS)
      }
    } else {
      setReports(INITIAL_MODERATION_REPORTS)
      localStorage.setItem('monpodium_moderation_reports', JSON.stringify(INITIAL_MODERATION_REPORTS))
    }
  }, [])

  // Helper to persist users
  const saveUsersList = (updated: AdminArtistUser[]) => {
    setUsers(updated)
    localStorage.setItem('monpodium_admin_users', JSON.stringify(updated))
  }

  // Helper to persist reports
  const saveReportsList = (updated: ModerationReport[]) => {
    setReports(updated)
    localStorage.setItem('monpodium_moderation_reports', JSON.stringify(updated))
  }

  // 1. Toggle Official Verified Badge
  const handleToggleVerification = (targetUser: AdminArtistUser) => {
    const nextVerified = !targetUser.verified
    const updated = users.map((u) =>
      u.id === targetUser.id ? { ...u, verified: nextVerified } : u
    )
    saveUsersList(updated)

    // Sync with demo user if currently editing them
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.username === targetUser.username) {
          parsed.verified = nextVerified
          localStorage.setItem('monpodium_demo_user', JSON.stringify(parsed))
        }
      } catch {}
    }

    if (nextVerified) {
      toast.success(`Badge vérifié attribué à ${targetUser.artist_name} !`, {
        description: `Le bouclier bleu de certification officielle est désormais visible sur sa vitrine.`,
      })
    } else {
      toast.info(`Badge vérifié révoqué pour ${targetUser.artist_name}.`, {
        description: `Le profil n'est plus certifié officiel.`,
      })
    }
  }

  // 2. Toggle Account Suspension (Active / Suspended)
  const handleToggleAccountStatus = (targetUser: AdminArtistUser) => {
    const isCurrentlySuspended = targetUser.account_status === 'suspended'
    const nextStatus: 'active' | 'suspended' = isCurrentlySuspended ? 'active' : 'suspended'

    const updated = users.map((u) =>
      u.id === targetUser.id ? { ...u, account_status: nextStatus } : u
    )
    saveUsersList(updated)

    // Sync with demo user
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.username === targetUser.username) {
          parsed.account_status = nextStatus
          localStorage.setItem('monpodium_demo_user', JSON.stringify(parsed))
        }
      } catch {}
    }

    if (nextStatus === 'suspended') {
      toast.error(`Compte suspendu : ${targetUser.artist_name}`, {
        description: `La vitrine est bloquée et affiche un avertissement de sécurité MonPodium.`,
      })
    } else {
      toast.success(`Compte réactivé avec succès : ${targetUser.artist_name}`, {
        description: `L'accès et la vitrine publique sont de nouveau opérationnels.`,
      })
    }
  }

  // 3. Change Plan
  const handleChangePlan = (userId: string, newPlan: Plan) => {
    const updated = users.map((u) =>
      u.id === userId ? { ...u, plan: newPlan } : u
    )
    saveUsersList(updated)

    const targetUser = users.find((u) => u.id === userId)
    if (targetUser) {
      // Sync with demo user
      const localUser = localStorage.getItem('monpodium_demo_user')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          if (parsed.username === targetUser.username) {
            parsed.plan = newPlan
            localStorage.setItem('monpodium_demo_user', JSON.stringify(parsed))
          }
        } catch {}
      }

      toast.success(`Plan mis à jour : ${targetUser.artist_name}`, {
        description: `Passé sur le plan ${newPlan.toUpperCase()} (quota max : ${PLAN_LIMITS[newPlan]} musiques).`,
      })
    }
  }

  // 4. Delete Fake Account
  const handleConfirmDelete = () => {
    if (!userToDelete) return

    const updated = users.filter((u) => u.id !== userToDelete.id)
    saveUsersList(updated)

    toast.success(`Compte définitivement supprimé : ${userToDelete.artist_name}`, {
      description: `Le profil, ses sous-domaines et ses données ont été purgés de la plateforme.`,
    })

    setUserToDelete(null)
  }

  // 5. Moderation: Ban Fake Impostor directly from a Report
  const handleBanReportedUser = (report: ModerationReport) => {
    const target = users.find((u) => u.id === report.reported_user_id || u.username === report.reported_username)
    if (target) {
      handleToggleAccountStatus(target)
    }

    const updatedReports = reports.map((r) =>
      r.id === report.id ? { ...r, status: 'resolved' as const } : r
    )
    saveReportsList(updatedReports)

    toast.success(`Signalement traité & Faux compte suspendu !`, {
      description: `L'usurpateur "${report.reported_artist_name}" a été neutralisé.`,
    })
  }

  // Dismiss a report
  const handleDismissReport = (reportId: string) => {
    const updated = reports.map((r) =>
      r.id === reportId ? { ...r, status: 'dismissed' as const } : r
    )
    saveReportsList(updated)
    toast.info('Signalement classé sans suite.')
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesQuery =
      u.artist_name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.full_name && u.full_name.toLowerCase().includes(query))

    if (!matchesQuery) return false

    if (filterMode === 'verified') return u.verified === true
    if (filterMode === 'unverified') return !u.verified
    if (filterMode === 'suspended') return u.account_status === 'suspended'
    if (filterMode === 'flagged') return u.is_flagged_impostor || (u.moderation_report_count || 0) > 0
    if (filterMode === 'paid') return u.plan === 'starter' || u.plan === 'pro'

    return true
  })

  // Real-time KPI Stats
  const totalUsers = users.length
  const verifiedCount = users.filter((u) => u.verified).length
  const suspendedCount = users.filter((u) => u.account_status === 'suspended').length
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length
  const paidAccountsCount = users.filter((u) => u.plan === 'starter' || u.plan === 'pro').length
  const estimatedRevenue = users.reduce((acc, u) => {
    if (u.plan === 'starter') return acc + 10000
    if (u.plan === 'pro') return acc + 15000
    return acc
  }, 0)

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Inscrits */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Artistes Inscrits
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black">{totalUsers}</span>
            <span className="text-[11px] font-bold text-emerald-600">+100% actif</span>
          </div>
        </div>

        {/* Comptes Vérifiés */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Certifiés Officiels
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-500">{verifiedCount}</span>
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              avec badge
            </span>
          </div>
        </div>

        {/* Faux Comptes & Suspendus */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Suspendus / Faux
            </span>
            <Ban className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-500">{suspendedCount}</span>
            <span className="text-[11px] font-bold text-red-600">bloqués</span>
          </div>
        </div>

        {/* Signalements Urgents */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Signalements
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">{pendingReportsCount}</span>
            <span className="text-[11px] font-bold text-amber-600">en attente</span>
          </div>
        </div>

        {/* Abonnements & Revenus */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs col-span-2 lg:col-span-1 transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Revenus Mensuels
            </span>
            <Crown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-purple-600">
              {estimatedRevenue.toLocaleString()} <span className="text-xs font-bold">FCFA</span>
            </span>
            <span className={`text-[10px] block font-bold mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {paidAccountsCount} abonné{paidAccountsCount > 1 ? 's' : ''} payant{paidAccountsCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Control Panel: Navigation Tabs */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer press-scale ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion des Artistes Inscrits ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer press-scale relative ${
              activeTab === 'reports'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Centre Anti-Usurpation ({pendingReportsCount})</span>
            {pendingReportsCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse absolute -top-1 -right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer press-scale ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Visites par Pays & Trafic Global ({GLOBAL_PLATFORM_TRAFFIC.totalCountriesCount} pays)</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-zinc-500">
          Modération active • Changements instantanés
        </div>
      </div>

      {/* TAB 1: GESTION DES ARTISTES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className={`relative flex-1 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-300' : 'bg-zinc-900/90 border-zinc-800'
            }`}>
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom d'artiste, @pseudo, nom réel ou email..."
                className={`w-full bg-transparent pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none rounded-2xl font-medium ${
                  isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-zinc-500'
                }`}
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer press-scale ${
                  filterMode === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Tous ({users.length})
              </button>
              <button
                onClick={() => setFilterMode('verified')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer press-scale ${
                  filterMode === 'verified'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Vérifiés ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterMode('unverified')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer press-scale ${
                  filterMode === 'unverified'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Non vérifiés ({users.length - verifiedCount})
              </button>
              <button
                onClick={() => setFilterMode('suspended')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer press-scale ${
                  filterMode === 'suspended'
                    ? 'bg-red-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Suspendus ({suspendedCount})
              </button>
              <button
                onClick={() => setFilterMode('paid')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer press-scale ${
                  filterMode === 'paid'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Payants ({paidAccountsCount})
              </button>
            </div>
          </div>

          {/* Artists List Table */}
          <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/90 border-zinc-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>
                    <th className="py-3.5 px-4 font-bold">Artiste & Identité</th>
                    <th className="py-3.5 px-4 font-bold">Sous-Domaine / URL</th>
                    <th className="py-3.5 px-4 font-bold">Plan & Quota</th>
                    <th className="py-3.5 px-4 font-bold">Badge Officiel</th>
                    <th className="py-3.5 px-4 font-bold">Statut Compte</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions de Modération</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-zinc-800'}`}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        Aucun artiste ne correspond à ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSuspended = user.account_status === 'suspended'
                      const isVerified = user.verified === true

                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors ${
                            isSuspended
                              ? isLight
                                ? 'bg-red-50/50 hover:bg-red-50'
                                : 'bg-red-950/20 hover:bg-red-950/30'
                              : isLight
                              ? 'hover:bg-slate-50'
                              : 'hover:bg-zinc-800/40'
                          }`}
                        >
                          {/* Artiste & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 shadow-sm border border-slate-200 dark:border-zinc-700">
                                {user.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={user.avatar_url}
                                    alt={user.artist_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-black text-sm">
                                    {user.artist_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-black text-sm truncate ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}>
                                    {user.artist_name}
                                  </span>
                                  {isVerified && (
                                    <span title="Officiel certifié">
                                      <ShieldCheck className="w-4 h-4 text-blue-500 inline flex-shrink-0" />
                                    </span>
                                  )}
                                  {user.is_flagged_impostor && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-black uppercase">
                                      Faux profil
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                                  {user.full_name || 'Nom non précisé'} • {user.email}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono">
                                  Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sous-domaine */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="font-mono text-xs font-semibold text-purple-600">
                                {user.username}.monpodium.com
                              </div>
                              <Link
                                href={`/${user.username}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-purple-600 transition-colors"
                              >
                                <span>Inspecter la vitrine</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </td>

                          {/* Plan actuel */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <select
                                value={user.plan}
                                onChange={(e) => handleChangePlan(user.id, e.target.value as Plan)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                                  user.plan === 'pro'
                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                    : user.plan === 'starter'
                                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400'
                                    : isLight
                                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                                }`}
                              >
                                <option value="free">Gratuit (1 sortie)</option>
                                <option value="starter">Starter (5 sorties)</option>
                                <option value="pro">Pro (Illimité - 20)</option>
                              </select>
                              <div className="text-[10px] text-zinc-500 font-medium">
                                {user.releases_count || 0} morceau{(user.releases_count || 0) > 1 ? 'x' : ''} en ligne
                              </div>
                            </div>
                          </td>

                          {/* Badge de certification */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleVerification(user)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all press-scale cursor-pointer border ${
                                isVerified
                                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25'
                                  : isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
                              }`}
                              title={isVerified ? 'Cliquer pour retirer la certification' : 'Cliquer pour certifier cet artiste'}
                            >
                              <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? 'text-blue-500' : 'text-zinc-500'}`} />
                              <span>{isVerified ? 'Certifié Officiel' : 'Non vérifié'}</span>
                            </button>
                          </td>

                          {/* Statut du compte */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isSuspended
                                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                              <span>{isSuspended ? 'Compte Suspendu' : 'Actif'}</span>
                            </span>
                          </td>

                          {/* Actions de modération */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Suspendre / Réactiver */}
                              <button
                                onClick={() => handleToggleAccountStatus(user)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all press-scale cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-amber-600/15 hover:bg-amber-600/25 border border-amber-600/30 text-amber-600 dark:text-amber-400'
                                }`}
                                title={isSuspended ? 'Réactiver le compte' : 'Suspendre le compte (bloque la page)'}
                              >
                                {isSuspended ? 'Réactiver' : 'Suspendre'}
                              </button>

                              {/* Inspecter les Statistiques de l'artiste */}
                              <button
                                onClick={() => {
                                  setUserToInspect(user)
                                  setInspectTimeRange('30d')
                                }}
                                className="p-1.5 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                                title="Inspecter l'audience et les statistiques de cet artiste"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>

                              {/* Supprimer définitivement */}
                              <button
                                onClick={() => setUserToDelete(user)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Supprimer définitivement ce compte"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRE ANTI-USURPATION & SIGNALEMENTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center justify-between gap-3 ${
            isLight
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span>
                <strong>Protection de l'identité des artistes :</strong> Traitez ici les signalements d&apos;usurpation de nom d&apos;artiste, de faux numéros de booking ou de tentatives d&apos;escroquerie.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {reports.map((report) => {
              const isResolved = report.status === 'resolved'
              const isDismissed = report.status === 'dismissed'

              return (
                <div
                  key={report.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isResolved
                      ? isLight ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-zinc-950/60 border-zinc-800 opacity-50'
                      : isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-zinc-900/90 border-zinc-800 shadow-xl'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                          {report.reason === 'impostor' ? 'Usurpation d’Identité' : report.reason === 'scam_booking' ? 'Arnaque au Booking' : 'Signalement Faux Compte'}
                        </span>
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Compte visé : <strong className="text-red-500">{report.reported_artist_name}</strong> (@{report.reported_username})
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          • {new Date(report.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed max-w-2xl p-3 rounded-2xl border ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                      }`}>
                        &ldquo;{report.description}&rdquo;
                      </p>

                      <div className="text-[11px] text-zinc-500">
                        Signalé par : <span className="font-semibold">{report.reporter_email}</span>
                      </div>
                    </div>

                    {/* Actions de modération immédiate */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isResolved && !isDismissed ? (
                        <>
                          <button
                            onClick={() => handleBanReportedUser(report)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all press-scale cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Bannir le faux profil</span>
                          </button>
                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            Classer sans suite
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isResolved ? 'Résolu & Sanctionné' : 'Classé sans suite'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIENCE & VISITES PAR PAYS (TRAFIC MONDIAL) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isLight
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200 text-slate-900'
              : 'bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border-emerald-500/30 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight">
                    Audience Mondiale & Répartition par Pays
                  </h2>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Consultez d&apos;où proviennent les fans et les écoutes sur l&apos;ensemble de la plateforme MonPodium en temps réel.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Données CDN Cloudflare & Fastly en direct</span>
              </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-zinc-800'
              }`}>
                <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Visites Globales (Plateforme)
                </span>
                <span className="text-xl sm:text-2xl font-black mt-0.5 block">
                  {GLOBAL_PLATFORM_TRAFFIC.totalVisits.toLocaleString('fr-FR')}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-zinc-800'
              }`}>
                <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Auditeurs Uniques
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {GLOBAL_PLATFORM_TRAFFIC.totalUniqueVisitors.toLocaleString('fr-FR')}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-zinc-800'
              }`}>
                <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Clics vers Streaming
                </span>
                <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {GLOBAL_PLATFORM_TRAFFIC.totalStreamingClicks.toLocaleString('fr-FR')}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-zinc-800'
              }`}>
                <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Territoires Connectés
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {GLOBAL_PLATFORM_TRAFFIC.totalCountriesCount} pays
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Country Table */}
          <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/90 border-zinc-800'
          }`}>
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">Classement détaillé des Pays d'Audience</h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Volume de visites et conversion vers les plateformes de streaming par territoire.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">
                Top 8 Territoires Actifs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>
                    <th className="py-3 px-4 font-bold">Rang & Pays</th>
                    <th className="py-3 px-4 font-bold">Visites Enregistrées</th>
                    <th className="py-3 px-4 font-bold">Part du Trafic Total</th>
                    <th className="py-3 px-4 font-bold">Clics Streaming</th>
                    <th className="py-3 px-4 font-bold">Croissance</th>
                    <th className="py-3 px-4 font-bold">Artistes Phares</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-zinc-800'}`}>
                  {GLOBAL_PLATFORM_TRAFFIC.countries.map((country, index) => (
                    <tr
                      key={country.code}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 text-center font-bold ${
                            index < 3 ? 'text-amber-500 font-black' : isLight ? 'text-slate-400' : 'text-zinc-500'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="text-xl leading-none flex-shrink-0">{country.flag}</span>
                          <span className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {country.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {country.visits.toLocaleString('fr-FR')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 w-44">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span>{country.percentage}%</span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${
                            isLight ? 'bg-slate-200' : 'bg-zinc-800'
                          }`}>
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-purple-600 dark:text-purple-400">
                        {country.streamingClicks.toLocaleString('fr-FR')}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <TrendingUp className="w-3 h-3" />
                          <span>{country.growthRate}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {country.topArtists?.map((artist) => (
                            <span
                              key={artist}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                              }`}
                            >
                              {artist}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Supprimer définitivement ?</h3>
                <p className="text-xs text-zinc-500">Action irréversible de modération</p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Es-tu certain de vouloir supprimer le profil de <strong>{userToDelete.artist_name}</strong> (@{userToDelete.username}) ? Toutes ses données et sa page publique seront effacées.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all press-scale cursor-pointer"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT ARTIST ANALYTICS MODAL */}
      {userToInspect && (() => {
        const stats = computeArtistAnalytics(userToInspect.username, userToInspect.artist_name, inspectTimeRange)

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 my-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userToInspect.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                      alt={userToInspect.artist_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-xl">{userToInspect.artist_name}</h3>
                      {userToInspect.verified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {userToInspect.plan.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-zinc-400">@{userToInspect.username}</span>
                      <span className="text-zinc-500">•</span>
                      <Link
                        href={`/${userToInspect.username}`}
                        target="_blank"
                        className="text-xs font-semibold text-purple-500 hover:underline flex items-center gap-1"
                      >
                        <span>Voir page publique</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUserToInspect(null)}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Période d&apos;analyse :
                </span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/40 border border-zinc-800">
                  {(['today', 'yesterday', '7d', '30d', 'all'] as AnalyticsTimeRange[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInspectTimeRange(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inspectTimeRange === r
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {TIME_RANGE_LABELS[r].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Pages Vues</span>
                  <span className="text-xl font-black font-mono mt-1 block">{stats.total_page_views.toLocaleString('fr-FR')}</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Visiteurs Uniques</span>
                  <span className="text-xl font-black font-mono mt-1 block">{stats.unique_visitors.toLocaleString('fr-FR')}</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
                  <span className="text-[10px] font-bold uppercase text-emerald-500 block">Clics Streaming</span>
                  <span className="text-xl font-black font-mono text-emerald-500 mt-1 block">{stats.total_streaming_clicks.toLocaleString('fr-FR')}</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
                  <span className="text-[10px] font-bold uppercase text-purple-500 block">Conversion Globale</span>
                  <span className="text-xl font-black font-mono text-purple-500 mt-1 block">{stats.global_conversion_rate}</span>
                </div>
              </div>

              {/* Performance by track */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Performance par Morceau ({stats.tracks_performance.length} morceaux)
                </h4>
                <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}>
                  <table className="w-full text-left text-xs">
                    <thead className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-950 text-zinc-400'}>
                      <tr>
                        <th className="py-2.5 px-3">Titre</th>
                        <th className="py-2.5 px-3">URL</th>
                        <th className="py-2.5 px-3">Visites</th>
                        <th className="py-2.5 px-3">15s</th>
                        <th className="py-2.5 px-3">Clics</th>
                        <th className="py-2.5 px-3 text-right">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-zinc-800'}`}>
                      {stats.tracks_performance.map((track) => (
                        <tr key={track.track_slug}>
                          <td className="py-2.5 px-3 font-bold">{track.track_title}</td>
                          <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">/{userToInspect.username}/{track.track_slug}</td>
                          <td className="py-2.5 px-3 font-mono">{track.page_views.toLocaleString('fr-FR')}</td>
                          <td className="py-2.5 px-3 font-mono text-amber-500">{track.audio_previews.toLocaleString('fr-FR')}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-500 font-bold">{track.streaming_clicks.toLocaleString('fr-FR')}</td>
                          <td className="py-2.5 px-3 font-mono text-right font-black">{track.conversion_rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Geographic Breakdown & Platforms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Streaming breakdown */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
                  <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3">Plateformes de Streaming</h4>
                  <div className="space-y-2">
                    {stats.streaming_breakdown.map((item) => (
                      <div key={item.platform} className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{item.name}</span>
                        <span className="font-mono font-bold">{item.clicks.toLocaleString('fr-FR')} ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Country breakdown */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
                  <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3">Top Pays Visiteurs</h4>
                  <div className="space-y-2">
                    {stats.country_breakdown.slice(0, 5).map((c) => (
                      <div key={c.code} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span>{c.flag}</span>
                          <span className="font-semibold">{c.name}</span>
                        </span>
                        <span className="font-mono font-bold">{c.visits.toLocaleString('fr-FR')} ({c.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setUserToInspect(null)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Fermer l&apos;inspection
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
