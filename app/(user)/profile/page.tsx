'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Trophy, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) return

        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Get recent transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        setProfile(profileData)
        setTransactions(transactionsData || [])
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your account and view your stats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile?.username || 'Player'}
              </h2>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
              <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-yellow-600 rounded-full">
                <Trophy className="h-4 w-4 text-white" />
                <span className="text-white font-semibold">Level {profile?.level || 1}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400">Total Wins</span>
                <span className="text-white font-semibold">{profile?.total_wins || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400">Total Losses</span>
                <span className="text-white font-semibold">{profile?.total_losses || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-green-400 font-semibold">
                  {profile?.total_wins + profile?.total_losses > 0
                    ? ((profile.total_wins / (profile.total_wins + profile.total_losses)) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400">XP</span>
                <span className="text-purple-400 font-semibold">{profile?.xp || 0}</span>
              </div>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 border border-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-2">Current Balance</p>
                <h3 className="text-4xl font-bold text-white">
                  ${profile?.balance?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button className="flex-1 py-2 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition">
                Deposit USDC
              </button>
              <button className="flex-1 py-2 bg-green-800 text-white rounded-lg font-semibold hover:bg-green-900 transition">
                Withdraw
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="h-6 w-6" />
              <span>Recent Transactions</span>
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'prize' || transaction.type === 'deposit'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {transaction.type === 'prize' || transaction.type === 'deposit' ? '+' : '-'}$
                        {Number(transaction.amount).toFixed(2)}
                      </p>
                      <p className={`text-xs ${
                        transaction.status === 'completed' ? 'text-green-400' : 
                        transaction.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Profile (Placeholder) */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <button className="w-full py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
