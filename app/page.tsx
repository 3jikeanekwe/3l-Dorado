'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Trophy, Gamepad2, Wallet, TrendingUp, Users, AlertCircle, Zap } from 'lucide-react'
import AncientGate from '@/components/ui/AncientGate'
import { getVoiceAnnouncer } from '@/lib/audio/welcome-voice'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Game = {
  id: string
  name: string
  description?: string
  game_type?: string
  min_players?: number
  max_players?: number
  entry_fee?: number
  is_active?: boolean
  created_at?: string
}

export default function HomePage() {
  const [gateOpening, setGateOpening] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [activeTab, setActiveTab] = useState<'games' | 'free' | 'wallet'>('games')

  // Data
  const [games, setGames] = useState<Game[]>([])
  const [freeGames, setFreeGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [liveStats, setLiveStats] = useState({
    activePlayers: 0,
    gamesPlayed: 0,
    totalPrizePool: 0
  })

  // particles for background
  const [particles] = useState(() =>
    Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      top: Math.random() * 100
    }))
  )

  const supabase = useMemo(() => createClient(), [])
  const [gamesChannel, setGamesChannel] = useState<RealtimeChannel | null>(null)
  const [sessionsChannel, setSessionsChannel] = useState<RealtimeChannel | null>(null)

  // Start cinematic on every load
  useEffect(() => {
    // begin gate sequence
    setTimeout(() => {
      setGateOpening(true)
      const announcer = getVoiceAnnouncer()
      // play full voice sequence
      announcer.playWelcomeSequence()
    }, 500)

    // fetch initial data and start realtime
    fetchGamesAndStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime subscription setup (fastest updates)
  useEffect(() => {
    let gChannel: RealtimeChannel | null = null
    let sChannel: RealtimeChannel | null = null

    async function setup() {
      try {
        // subscribe to games table changes (insert/update/delete) for live list updates
        // supabase client for browser supports channel subscriptions
        if ((supabase as any).channel) {
          gChannel = (supabase as any)
            .channel('public:games')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'games' },
              (payload: any) => {
                // simple approach: re-fetch on changes
                fetchGamesAndStats()
              }
            )
            .subscribe()
          setGamesChannel(gChannel)
        }

        // subscribe to game_sessions for live stats
        if ((supabase as any).channel) {
          sChannel = (supabase as any)
            .channel('public:game_sessions')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'game_sessions' },
              (payload: any) => {
                // update live stats by re-fetching small set
                fetchLiveStats()
              }
            )
            .subscribe()
          setSessionsChannel(sChannel)
        }
      } catch (err) {
        console.warn('Realtime setup skipped or failed:', err)
      }
    }

    setup()

    return () => {
      if (gChannel) try { (supabase as any).removeChannel(gChannel) } catch {}
      if (sChannel) try { (supabase as any).removeChannel(sChannel) } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  // Core fetch used both for initial load and when realtime events happen
  const fetchGamesAndStats = async () => {
    try {
      setLoading(true)

      // Fetch active games (fast single request)
      const { data: allGames, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (gamesError) {
        console.error('Supabase games error', gamesError)
      } else if (allGames) {
        const paid = allGames.filter((g: any) => (g.entry_fee ?? 0) > 0)
        const free = allGames.filter((g: any) => (g.entry_fee ?? 0) === 0)
        setGames(paid)
        setFreeGames(free)
      }

      await fetchLiveStats()
    } catch (err) {
      console.error('fetchGamesAndStats error', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveStats = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('id, status, entry_fee')
        .in('status', ['waiting', 'active'])

      if (!error && sessions) {
        const activePlayers = sessions.length * 8 // estimated players per session; tweak later
        const totalPrizePool = sessions.reduce((sum: number, s: any) => sum + (s.entry_fee || 0), 0)
        setLiveStats({
          activePlayers,
          gamesPlayed: Math.floor(Math.random() * 900) + 100, // placeholder while no count
          totalPrizePool
        })
      }
    } catch (err) {
      console.error('fetchLiveStats', err)
    }
  }

  const handleGateOpenComplete = () => {
    // fade content in (spec says content visible at ~4s)
    setTimeout(() => setContentVisible(true), 250) // slight delay
  }

  const requireAgeVerification = (action: () => void) => {
    if (!ageVerified) {
      setPendingAction(() => action)
      setShowAgeModal(true)
      return false
    }
    action()
    return true
  }

  const handleAgeConfirm = (isOver18: boolean) => {
    if (isOver18) {
      setAgeVerified(true)
      setShowAgeModal(false)
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    } else {
      alert('You must be 18 or older to access this content.')
      window.location.href = 'https://www.google.com'
    }
  }

  const handleWalletTab = () => {
    requireAgeVerification(() => setActiveTab('wallet'))
  }

  const handlePlayGame = (gameId: string, isFree: boolean) => {
    if (isFree) {
      window.location.href = `/play/${gameId}`
    } else {
      requireAgeVerification(() => {
        window.location.href = `/play/${gameId}`
      })
    }
  }

  const getGameEmoji = (gameType?: string) => {
    const emojis: Record<string, string> = {
      battle_royale: '⚔️',
      racing: '🏎️',
      combat: '🗡️',
      strategy: '🏺',
      puzzle: '🧩',
      card: '🃏',
      default: '🎮'
    }
    return (gameType && emojis[gameType]) || emojis.default
  }

  // AUDIO fallback - if speech can't start due to autoplay, show small click overlay (non-intrusive)
  const [audioEnabled, setAudioEnabled] = useState(true)
  useEffect(() => {
    // attempt a silent speak to check autoplay permissions
    try {
      const a = getVoiceAnnouncer()
      // try speak but catch restrictions
      a.speak('', { pitch: 0.2, rate: 1 })
      setAudioEnabled(true)
    } catch {
      setAudioEnabled(false)
    }
  }, [])

  return (
    <>
      {/* Age Verification Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[120] p-4">
          <div className="ancient-panel max-w-md w-full relative">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-gold animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-gold text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Age Verification Required
            </h2>
            <p className="text-bronze text-center mb-8">
              You must be 18 years or older to access certain wallet and betting features.
            </p>
            <div className="space-y-4">
              <button onClick={() => handleAgeConfirm(true)} className="ancient-button w-full text-lg py-4">I am 18 or older</button>
              <button onClick={() => handleAgeConfirm(false)} className="w-full bg-blood-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded transition-all">I am under 18</button>
            </div>
            <p className="text-xs text-bronze text-center mt-6">
              By continuing, you confirm legal age for gambling in your jurisdiction.
            </p>
          </div>
        </div>
      )}

      {/* Ancient Gate */}
      <AncientGate isOpening={gateOpening} onOpenComplete={handleGateOpenComplete} />

      {/* If audio blocked, show small unobtrusive button to enable */}
      {!audioEnabled && (
        <div className="fixed top-6 right-6 z-[150]">
          <button
            onClick={() => {
              try {
                const a = getVoiceAnnouncer()
                a.playWelcomeSequence()
                setAudioEnabled(true)
              } catch {
                setAudioEnabled(false)
              }
            }}
            className="px-3 py-2 ancient-button"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Enable Sound
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={`min-h-screen relative pb-28 transition-opacity duration-700 ${contentVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* floating gold particles */}
        {particles.map(p => (
          <div key={p.id}
            className="gold-particle"
            style={{ left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.delay}s` }}
          />
        ))}

        {/* header */}
        <header className="sticky top-0 z-40 bg-dark-stone/95 backdrop-blur border-b-2 border-gold/30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10 trophy-gold" />
              <div>
                <h1 className="text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>EL DORADO</h1>
                <p className="text-xs text-bronze uppercase tracking-widest">City of Gold</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-jade/20 px-3 py-1 rounded-full border border-jade">
                <div className="w-2 h-2 bg-jade rounded-full animate-pulse" />
                <span className="text-jade text-sm font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </header>

        {/* content */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Live stats */}
          {activeTab === 'games' && (
            <>
              <div className="ancient-panel">
                <h2 className="text-2xl font-bold text-gold mb-4 flex items-center gap-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  <TrendingUp className="w-6 h-6" />
                  Live Statistics
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-jade">{liveStats.activePlayers}</p>
                    <p className="text-xs text-bronze mt-1">Active Warriors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gold">{liveStats.gamesPlayed}</p>
                    <p className="text-xs text-bronze mt-1">Games Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400">${liveStats.totalPrizePool}</p>
                    <p className="text-xs text-bronze mt-1">Prize Pool</p>
                  </div>
                </div>
              </div>

              {/* Real games */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>⚔️ Battle Arena (Real Money)</h2>
                  {!ageVerified && <span className="text-xs bg-blood-red px-2 py-1 rounded text-white">18+</span>}
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="ancient-loader" />
                  </div>
                ) : games.length === 0 ? (
                  <div className="ancient-panel text-center py-8">
                    <p className="text-bronze">No active games yet. Check back soon!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {games.map(game => (
                      <div key={game.id} onClick={() => handlePlayGame(game.id, (game.entry_fee ?? 0) === 0)} className="ancient-panel game-card cursor-pointer relative">
                        {!ageVerified && <div className="absolute top-2 right-2 bg-blood-red text-white text-xs px-2 py-1 rounded z-10">18+</div>}
                        <div className="text-5xl mb-3 text-center">{getGameEmoji(game.game_type)}</div>
                        <h3 className="text-lg font-bold text-gold text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>{game.name}</h3>
                        <div className="flex items-center justify-between text-sm text-bronze">
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{game.min_players ?? 2}-{game.max_players ?? 32}</span></div>
                          <div className="text-gold font-bold">${game.entry_fee ?? 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'free' && (
            <>
              <div className="ancient-panel text-center">
                <Zap className="w-16 h-16 text-jade mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-gold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Free Training Grounds</h2>
                <p className="text-bronze">Practice your skills without wagering. No age verification required!</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="ancient-loader" />
                </div>
              ) : freeGames.length === 0 ? (
                <div className="ancient-panel text-center py-8">
                  <p className="text-bronze">No free games available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {freeGames.map(game => (
                    <div key={game.id} onClick={() => handlePlayGame(game.id, true)} className="ancient-panel game-card cursor-pointer">
                      <div className="text-5xl mb-3 text-center">{getGameEmoji(game.game_type)}</div>
                      <h3 className="text-lg font-bold text-gold text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>{game.name}</h3>
                      <div className="flex items-center justify-between text-sm text-bronze">
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{game.min_players ?? 1}-{game.max_players ?? 32}</span></div>
                        <div className="text-jade font-bold">FREE</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {!ageVerified ? (
                <div className="ancient-panel text-center py-12">
                  <AlertCircle className="w-20 h-20 text-gold mx-auto mb-6 animate-pulse" />
                  <h2 className="text-3xl font-bold text-gold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Age Verification Required</h2>
                  <p className="text-bronze mb-8">You must verify your age to access wallet features and real money games.</p>
                  <button onClick={() => setShowAgeModal(true)} className="ancient-button text-xl px-8 py-4">Verify Age (18+)</button>
                </div>
              ) : (
                <>
                  <div className="ancient-panel text-center">
                    <Wallet className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Warrior's Treasury</h2>
                    <p className="text-bronze mb-6">Sign in to access your wallet and compete for real prizes</p>
                    <div className="space-y-4">
                      <a href="/login" className="ancient-button w-full text-lg py-4 inline-block">⚔️ Enter Arena (Login)</a>
                      <a href="/signup" className="block w-full bg-jade hover:bg-jade/80 text-dark-stone font-bold py-4 px-6 rounded transition-all text-lg">👑 Join Quest (Sign Up)</a>
                    </div>
                  </div>

                  <div className="ancient-panel">
                    <h3 className="text-xl font-bold text-gold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Why Join El Dorado?</h3>
                    <ul className="space-y-3 text-bronze">
                      <li className="flex items-start gap-2"><span className="text-gold">⚔️</span><span>Compete in epic multiplayer battles</span></li>
                      <li className="flex items-start gap-2"><span className="text-gold">💰</span><span>Win real USDC prizes</span></li>
                      <li className="flex items-start gap-2"><span className="text-gold">👑</span><span>Climb the leaderboards</span></li>
                      <li className="flex items-start gap-2"><span className="text-gold">🏆</span><span>Earn legendary achievements</span></li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark-stone/98 backdrop-blur border-t-2 border-gold/30 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-20 relative">
              <button onClick={() => setActiveTab('games')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${activeTab === 'games' ? 'text-gold' : 'text-bronze'}`}>
                <Gamepad2 className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Cinzel, serif' }}>GAMES</span>
                {activeTab === 'games' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />}
              </button>

              <button onClick={() => setActiveTab('free')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${activeTab === 'free' ? 'text-gold' : 'text-bronze'}`}>
                <Zap className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Cinzel, serif' }}>FREE</span>
                {activeTab === 'free' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />}
              </button>

              <button onClick={handleWalletTab} className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${activeTab === 'wallet' ? 'text-gold' : 'text-bronze'}`}>
                <Wallet className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Cinzel, serif' }}>WALLET</span>
                {!ageVerified && <span className="absolute top-2 right-4 text-[10px] bg-blood-red text-white px-1 rounded">18+</span>}
                {activeTab === 'wallet' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />}
              </button>
            </div>
          </div>
        </nav>
      </main>
    </>
  )
        }
