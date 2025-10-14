'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Users, Clock, DollarSign, TrendingUp, Search } from 'lucide-react'

export default function LobbyPage() {
  const supabase = createClient()
  const [games, setGames] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch published games
        const { data: gamesData } = await supabase
          .from('games')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        // Fetch waiting and active sessions
        const { data: sessionsData } = await supabase
          .from('game_sessions')
          .select('*, games(*)')
          .in('status', ['waiting', 'active'])
          .order('created_at', { ascending: false })

        setGames(gamesData || [])
        setSessions(sessionsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to session changes
    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const betTiers = [
    { value: 'all', label: 'All Tiers' },
    { value: 'free', label: 'Free Play' },
    { value: '0.25', label: '$0.25' },
    { value: '0.5', label: '$0.50' },
    { value: '1', label: '$1.00' },
    { value: '3', label: '$3.00' },
    { value: '5', label: '$5.00' },
  ]

  const filteredSessions = sessions.filter((session) => {
    const matchesTier = selectedTier === 'all' || session.bet_tier === selectedTier
    const matchesSearch = session.games?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTier && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading lobby...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
        <p className="text-gray-400">Join a session and start competing</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Bet Tier Filter */}
        <div className="flex flex-wrap gap-2">
          {betTiers.map((tier) => (
            <button
              key={tier.value}
              onClick={() => setSelectedTier(tier.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedTier === tier.value
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Players</p>
              <p className="text-2xl font-bold text-white">
                {sessions.reduce((sum, s) => sum + s.current_players, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Live Sessions</p>
              <p className="text-2xl font-bold text-white">
                {sessions.filter((s) => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Prize Pool</p>
              <p className="text-2xl font-bold text-white">
                ${sessions.reduce((sum, s) => sum + Number(s.prize_pool), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-lg mb-4">No sessions available</p>
          <p className="text-gray-500">Check back soon or try different filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-400/50 transition"
            >
              {/* Game Name */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {session.games?.name || 'Unknown Game'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {session.games?.description || 'No description'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.status === 'waiting'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {session.status === 'waiting' ? 'Waiting' : 'Live'}
                </span>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">
                    {session.current_players}/{session.max_slots} players
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">
                    {session.bet_tier === 'free' ? 'Free' : `$${session.bet_tier}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">
                    {session.status === 'waiting' ? 'Starting soon' : 'In progress'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <span className="text-green-400 font-semibold">
                    ${Number(session.prize_pool).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(session.current_players / session.max_slots) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Join Button */}
              <button
                disabled={session.current_players >= session.max_slots}
                className="w-full py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {session.current_players >= session.max_slots ? 'Session Full' : 'Join Session'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available Games Section */}
      {games.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Available Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-yellow-400/50 transition cursor-pointer"
              >
                <div className="aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">🎮</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{game.name}</h3>
                <p className="text-xs text-gray-400">{game.min_players}-{game.max_players} players</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
      }
