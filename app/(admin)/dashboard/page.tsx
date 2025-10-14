'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Gamepad2, DollarSign, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    activeSessions: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Get total games
        const { count: gamesCount } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true })

        // Get active sessions
        const { count: sessionsCount } = await supabase
          .from('game_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // Get total revenue (sum of all completed transactions)
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'bet')
          .eq('status', 'completed')

        const revenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

        setStats({
          totalUsers: usersCount || 0,
          totalGames: gamesCount || 0,
          activeSessions: sessionsCount || 0,
          totalRevenue: revenue * 0.1, // 10% platform fee
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      name: 'Total Games',
      value: stats.totalGames,
      icon: Gamepad2,
      color: 'bg-purple-500',
      change: '+3',
    },
    {
      name: 'Active Sessions',
      value: stats.activeSessions,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Live',
    },
    {
      name: 'Revenue (10%)',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+8%',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to El Dorado Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.color} rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.name}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition">
            Create New Game
          </button>
          <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition">
            Invite Admin
          </button>
          <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition">
            View Sessions
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">New user registered</p>
              <p className="text-sm text-gray-400">2 minutes ago</p>
            </div>
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">New</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Game session completed</p>
              <p className="text-sm text-gray-400">5 minutes ago</p>
            </div>
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Completed</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">USDC deposit received</p>
              <p className="text-sm text-gray-400">10 minutes ago</p>
            </div>
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Transaction</span>
          </div>
        </div>
      </div>
    </div>
  )
}
