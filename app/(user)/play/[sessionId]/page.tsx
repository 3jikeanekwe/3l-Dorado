'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GameEngine from '@/lib/game-engine/GameEngine'
import { Users, Clock, Trophy, X } from 'lucide-react'

export default function PlayGamePage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)

  const [session, setSession] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
  fetchSessionData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
    
  

  useEffect(() => {
    if (canvasRef.current && game && !engineRef.current) {
      initializeGame()
    }

    useEffect(() => {
  if (canvasRef.current && game && !engineRef.current) {
    initializeGame()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [game])
      
        
      
    
  

  const fetchSessionData = async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) {
        router.push('/login')
        return
      }

      // Fetch game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, games(*)')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      setSession(sessionData)
      setGame(sessionData.games)

      // Check if user is already in session
      const { data: participation } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', authSession.user.id)
        .single()

      if (!participation) {
        // Join session
        await joinSession(authSession.user.id)
      }

      setLoading(false)
    } catch (error: any) {
      console.error('Error fetching session:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  const joinSession = async (userId: string) => {
    try {
      // Add user to session
      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          bet_amount: 0, // Will be set based on bet tier
        })

      if (error) throw error

      // Update session player count
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          current_players: session.current_players + 1,
        })
        .eq('id', sessionId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error joining session:', error)
    }
  }

  const initializeGame = async () => {
    if (!canvasRef.current || !game) return

    try {
      // Initialize game engine
      const engine = new GameEngine(canvasRef.current, game.game_config || {})
      engineRef.current = engine

      // Get current user
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authSession.user.id)
        .single()

      // Add current player
      engine.addPlayer(authSession.user.id, profile?.username || 'Player')

      // Setup keyboard controls
      const handleKeyDown = (e: KeyboardEvent) => {
        engine.handleKeyDown(e.key, authSession.user.id)
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        engine.handleKeyUp(e.key, authSession.user.id)
      }

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)

      // Update leaderboard every second
      const leaderboardInterval = setInterval(() => {
        const leaders = engine.getLeaderboard()
        setLeaderboard(leaders)

        const gameState = engine.getGameState()
        setTimeRemaining(gameState.timeRemaining)

        if (gameState.gameStatus === 'completed') {
          handleGameEnd()
          clearInterval(leaderboardInterval)
        }
      }, 1000)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
        clearInterval(leaderboardInterval)
      }
    } catch (error) {
      console.error('Error initializing game:', error)
      setError('Failed to initialize game')
    }
  }

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.start()
      setGameStarted(true)

      // Update session status
      supabase
        .from('game_sessions')
        .update({ status: 'active', start_time: new Date().toISOString() })
        .eq('id', sessionId)
        .then()
    }
  }

  const handleGameEnd = async () => {
    if (!engineRef.current) return

    const winner = engineRef.current.getWinner()
    const leaderboard = engineRef.current.getLeaderboard()

    // Update session status
    await supabase
      .from('game_sessions')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Update participant positions and prizes
    const prizeDistribution = [0.5, 0.25, 0.07, 0.05, 0.03] // 50%, 25%, 7%, 5%, 3%
    const totalPool = session.prize_pool

    for (let i = 0; i < leaderboard.length && i < 5; i++) {
      const player = leaderboard[i]
      const prize = totalPool * prizeDistribution[i]

      await supabase
        .from('session_participants')
        .update({
          final_position: i + 1,
          prize_amount: prize,
        })
        .eq('session_id', sessionId)
        .eq('user_id', player.id)

      // Update user balance
      if (prize > 0) {
        await supabase.rpc('increment_balance', {
          user_id: player.id,
          amount: prize,
        })

        // Create transaction record
        await supabase.from('transactions').insert({
          user_id: player.id,
          session_id: sessionId,
          amount: prize,
          type: 'prize',
          status: 'completed',
        })
      }
    }

    // Show results
    setTimeout(() => {
      router.push(`/results/${sessionId}`)
    }, 3000)
  }

  const handleLeaveGame = () => {
    if (confirm('Are you sure you want to leave the game?')) {
      router.push('/lobby')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push('/lobby')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{game?.name}</h1>
            <p className="text-sm text-gray-400">{session?.bet_tier === 'free' ? 'Free Play' : `$${session?.bet_tier} Entry`}</p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white">
              <Clock className="h-5 w-5" />
              <span className="font-mono font-bold">
                {Math.floor(timeRemaining / 60)}:{String(Math.floor(timeRemaining % 60)).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-white">
              <Users className="h-5 w-5" />
              <span>{session?.current_players}/{session?.max_slots}</span>
            </div>

            <button
              onClick={handleLeaveGame}
              className="p-2 text-red-400 hover:text-red-300 transition"
              title="Leave Game"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <canvas
                ref={canvasRef}
                className="w-full border-2 border-gray-600 rounded-lg"
                style={{ maxWidth: '800px', aspectRatio: '4/3' }}
              />

              {!gameStarted && (
                <div className="mt-6 text-center">
                  <p className="text-gray-400 mb-4">
                    Use WASD or Arrow Keys to move. Space to action.
                  </p>
                  <button
                    onClick={handleStartGame}
                    className="px-8 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold text-lg"
                  >
                    Start Game
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              </div>

              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-600'
                        : index === 1
                        ? 'bg-gray-600'
                        : index === 2
                        ? 'bg-orange-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-white font-semibold">
                            {player.username}
                          </p>
                          <p className="text-sm text-gray-300">
                            HP: {player.health}%
                          </p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-white">
                        {player.score}
                      </span>
                    </div>
                  </div>
                ))}

                {leaderboard.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    Waiting for players...
                  </p>
                )}
              </div>

              {/* Prize Pool */}
              {session?.bet_tier !== 'free' && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Prize Pool</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${session?.prize_pool?.toFixed(2)}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>1st Place:</span>
                      <span className="text-white">50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2nd Place:</span>
                      <span className="text-white">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3rd Place:</span>
                      <span className="text-white">7%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </div>
    )
  }
    
  
  
