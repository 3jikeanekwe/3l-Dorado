'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function GamesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  useEffect(() => {
    fetchGames()
  }, [supabase])

  const fetchGames = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      let query = supabase
        .from('games')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setGames(data || [])
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (error) throw error
      
      // Refresh list
      fetchGames()
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Failed to delete game')
    }
  }

  const handleStatusChange = async (gameId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ status: newStatus })
        .eq('id', gameId)

      if (error) throw error
      
      // Refresh list
      fetchGames()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const filteredGames = games.filter((game) => {
    if (filter === 'all') return true
    return game.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-600'
      case 'published':
        return 'bg-green-600'
      case 'archived':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading games...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Games</h1>
          <p className="text-gray-400">Create and manage your games</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/games/create')}
          className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold"
        >
          <Plus className="h-5 w-5" />
          <span>Create Game</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {['all', 'draft', 'published', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
              filter === status
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Games</p>
          <p className="text-2xl font-bold text-white">{games.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Published</p>
          <p className="text-2xl font-bold text-green-400">
            {games.filter((g) => g.status === 'published').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Drafts</p>
          <p className="text-2xl font-bold text-yellow-400">
            {games.filter((g) => g.status === 'draft').length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Archived</p>
          <p className="text-2xl font-bold text-gray-400">
            {games.filter((g) => g.status === 'archived').length}
          </p>
        </div>
      </div>

      {/* Games List */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-lg mb-4">
            {filter === 'all' ? 'No games created yet' : `No ${filter} games`}
          </p>
          <button
            onClick={() => router.push('/dashboard/games/create')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold"
          >
            Create Your First Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-400/50 transition"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                {game.thumbnail_url ? (
                  <img
  src={game.thumbnail_url}
  alt={`${game.name} thumbnail`}
  className="w-full h-full object-cover"
/>
                ) : (
                  <span className="text-6xl">🎮</span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 ${getStatusColor(
                      game.status
                    )} text-white text-xs font-semibold rounded-full capitalize`}
                  >
                    {game.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(game.created_at), 'MMM dd, yyyy')}</span>
                  </span>
                </div>

                {/* Game Info */}
                <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {game.description || 'No description'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                  <span>{game.min_players}-{game.max_players} players</span>
                  <span>•</span>
                  <span>By {game.profiles?.username || 'Unknown'}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/games/edit/${game.id}`)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>

                  {game.status === 'published' ? (
                    <button
                      onClick={() => handleStatusChange(game.id, 'draft')}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                      title="Unpublish"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(game.id, 'published')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      title="Publish"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(game.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
      }
