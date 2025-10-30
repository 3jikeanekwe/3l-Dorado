'use client'

import { useEffect, useState } from 'react'
import { Trophy, Gamepad2, Wallet, TrendingUp, Users, AlertCircle, X, Zap } from 'lucide-react'
import { getVoiceAnnouncer } from '@/lib/audio/welcome-voice'
import AncientGate from '@/components/ui/AncientGate'
import { createClient } from '@/lib/supabase/client'

type Game = {
  id: string
  name: string
  description: string
  game_type: string
  min_players: number
  max_players: number
  entry_fee: number
  is_active: boolean
  created_at: string
}

export default function Home() {
  const [goldParticles, setGoldParticles] = useState<Array<{ id: number; left: number; delay: number }>>([])
  const [gateOpening, setGateOpening] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [activeTab, setActiveTab] = useState<'games' | 'free' | 'wallet'>('games')
  
  // Data states
  const [games, setGames] = useState<Game[]>([])
  const [freeGames, setFreeGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [liveStats, setLiveStats] = useState({
    activePlayers: 0,
    gamesPlayed: 0,
    totalPrizePool: 0
  })

  const supabase = createClient()

  useEffect(() => {
    // Generate floating gold particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
    }))
    setGoldParticles(particles)

    // ALWAYS start gate opening sequence on every visit
    setTimeout(() => {
      setGateOpening(true)
      
      // Play voice after brief delay
      setTimeout(() => {
        const voice = getVoiceAnnouncer()
        voice.playWelcome()
      }, 1000)
    }, 500)

    // Fetch games and stats
    fetchGamesAndStats()
  }, [])

  const fetchGamesAndStats = async () => {
    try {
      setLoading(true)

      // Fetch all games
      const { data: allGames, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (gamesError) throw gamesError

      // Separate paid and free games
      const paidGames = allGames?.filter(g => g.entry_fee > 0) || []
      const freeGamesList = allGames?.filter(g => g.entry_fee === 0) || []

      setGames(paidGames)
      setFreeGames(freeGamesList)

      // Fetch live statistics
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('id, status, entry_fee')
        .in('status', ['waiting', 'active'])

      if (!sessionsError && sessions) {
        const activePlayers = sessions.length * 10 // Estimate
        const totalPrizePool = sessions.reduce((sum, s) => sum + (s.entry_fee || 0), 0)
        
        setLiveStats({
          activePlayers,
          gamesPlayed: Math.floor(Math.random() * 1000) + 500, // You can fetch actual count
          totalPrizePool
        })
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGateOpenComplete = () => {
    setContentVisible(true)
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
      // Free games can be played without verification
      window.location.href = `/play/${gameId}`
    } else {
      // Paid games require age verification
      requireAgeVerification(() => {
        window.location.href = `/play/${gameId}`
      })
    }
  }

  const getGameEmoji = (gameType: string) => {
    const emojis: Record<string, string> = {
      'battle_royale': '⚔️',
      'racing': '🏛️',
      'combat': '🗡️',
      'strategy': '🏺',
      'puzzle': '🧩',
      'card': '🃏',
      default: '🎮'
    }
    return emojis[gameType] || emojis.default
  }

  return (
    <>
      {/* Age Verification Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4">
          <div className="ancient-panel max-w-md w-full relative">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-gold animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-gold text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Age Verification Required
            </h2>
            <p className="text-bronze text-center mb-8">
              You must be 18 years or older to access real money games and wallet features.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => handleAgeConfirm(true)}
                className="ancient-button w-full text-lg py-4"
              >
                I am 18 or older
              </button>
              <button
                onClick={() => handleAgeConfirm(false)}
                className="w-full bg-blood-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded transition-all"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                I am under 18
              </button>
            </div>
            <p className="text-xs text-bronze text-center mt-6">
              By continuing, you confirm legal age for gambling in your jurisdiction.
            </p>
          </div>
        </div>
      )}

      {/* Ancient Gate Animation */}
      <AncientGate isOpening={gateOpening} onOpenComplete={handleGateOpenComplete} />

      {/* Main App Container */}
      <main 
        className={`min-h-screen relative overflow-hidden pb-20 transition-opacity duration-1000 ${
          contentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Animated Gold Particles */}
        {goldParticles.map((particle) => (
          <div
            key={particle.id}
            className="gold-particle"
            style={{
              left: `${particle.left}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-dark-stone/95 backdrop-blur border-b-2 border-gold/30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-10 w-10 trophy-gold" />
                <div>
                  <h1 className="text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                    EL DORADO
                  </h1>
                  <p className="text-xs text-bronze uppercase tracking-widest">
                    City of Gold
                  </p>
                </div>
              </div>
              
              {/* Live Indicator */}
              <div className="flex items-center space-x-2 bg-jade/20 px-3 py-1 rounded-full border border-jade">
                <div className="w-2 h-2 bg-jade rounded-full animate-pulse" />
                <span className="text-jade text-sm font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          
          {/* GAMES & LIVE DATA TAB */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              {/* Live Stats */}
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

              {/* Real Money Games */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                    ⚔️ Battle Arena (Real Money)
                  </h2>
                  {!ageVerified && (
                    <span className="text-xs bg-blood-red px-2 py-1 rounded text-white">18+</span>
                  )}
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
                  <div className="grid grid-cols-2 gap-4">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => handlePlayGame(game.id, false)}
                        className="ancient-panel game-card cursor-pointer relative"
                      >
                        {!ageVerified && (
                          <div className="absolute top-2 right-2 bg-blood-red text-white text-xs px-2 py-1 rounded z-10">
                            18+
                          </div>
                        )}
                        
                        <div className="text-5xl mb-3 text-center">
                          {getGameEmoji(game.game_type)}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gold text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                          {game.name}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm text-bronze">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{game.min_players}-{game.max_players}</span>
                          </div>
                          <div className="text-gold font-bold">
                            ${game.entry_fee}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FREE GAMES TAB */}
          {activeTab === 'free' && (
            <div className="space-y-6">
              <div className="ancient-panel text-center">
                <Zap className="w-16 h-16 text-jade mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-gold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  Free Training Grounds
                </h2>
                <p className="text-bronze">
                  Practice your skills without wagering. No age verification required!
                </p>
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
                <div className="grid grid-cols-2 gap-4">
                  {freeGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => handlePlayGame(game.id, true)}
                      className="ancient-panel game-card cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center">
                        {getGameEmoji(game.game_type)}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gold text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                        {game.name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-bronze">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{game.min_players}-{game.max_players}</span>
                        </div>
                        <div className="text-jade font-bold">
                          FREE
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WALLET/AUTH TAB */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {!ageVerified ? (
                <div className="ancient-panel text-center py-12">
                  <AlertCircle className="w-20 h-20 text-gold mx-auto mb-6 animate-pulse" />
                  <h2 className="text-3xl font-bold text-gold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                    Age Verification Required
                  </h2>
                  <p className="text-bronze mb-8">
                    You must verify your age to access wallet features and real money games.
                  </p>
                  <button
                    onClick={() => setShowAgeModal(true)}
                    className="ancient-button text-xl px-8 py-4"
                  >
                    Verify Age (18+)
                  </button>
                </div>
              ) : (
                <>
                  <div className="ancient-panel text-center">
                    <Wallet className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Warrior's Treasury
                    </h2>
                    <p className="text-bronze mb-6">
                      Sign in to access your wallet and compete for real prizes
                    </p>
                    
                    <div className="space-y-4">
                      <a
                        href="/login"
                        className="ancient-button w-full text-lg py-4 inline-block"
                      >
                        ⚔️ Enter Arena (Login)
                      </a>
                      <a
                        href="/signup"
                        className="block w-full bg-jade hover:bg-jade/80 text-dark-stone font-bold py-4 px-6 rounded transition-all text-lg"
                        style={{ fontFamily: 'Cinzel, serif' }}
                      >
                        👑 Join Quest (Sign Up)
                      </a>
                    </div>
                  </div>

                  <div className="ancient-panel">
                    <h3 className="text-xl font-bold text-gold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                      Why Join El Dorado?
                    </h3>
                    <ul className="space-y-3 text-bronze">
                      <li className="flex items-start gap-2">
                        <span className="text-gold">⚔️</span>
                        <span>Compete in epic multiplayer battles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold">💰</span>
                        <span>Win real USDC prizes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold">👑</span>
                        <span>Climb the leaderboards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gold">🏆</span>
                        <span>Earn legendary achievements</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation - App Style */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark-stone/98 backdrop-blur border-t-2 border-gold/30 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-20">
              {/* Games Tab */}
              <button
                onClick={() => setActiveTab('games')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  activeTab === 'games' ? 'text-gold' : 'text-bronze'
                }`}
              >
                <Gamepad2 className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                  GAMES
                </span>
                {activeTab === 'games' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />
                )}
              </button>

              {/* Free Games Tab */}
              <button
                onClick={() => setActiveTab('free')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  activeTab === 'free' ? 'text-gold' : 'text-bronze'
                }`}
              >
                <Zap className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                  FREE
                </span>
                {activeTab === 'free' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />
                )}
              </button>

              {/* Wallet Tab */}
              <button
                onClick={handleWalletTab}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                  activeTab === 'wallet' ? 'text-gold' : 'text-bronze'
                }`}
              >
                <Wallet className="w-7 h-7 mb-1" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                  WALLET
                </span>
                {!ageVerified && (
                  <span className="absolute top-2 right-4 text-[10px] bg-blood-red text-white px-1 rounded">
                    18+
                  </span>
                )}
                {activeTab === 'wallet' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </main>
    </>
  )
                                  }
