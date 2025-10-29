'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Swords, Coins, Users, Zap, Crown, AlertCircle, X } from 'lucide-react'
import { getVoiceAnnouncer } from '@/lib/audio/welcome-voice'
import AncientGate from '@/components/ui/AncientGate'

export default function Home() {
  const [goldParticles, setGoldParticles] = useState<Array<{ id: number; left: number; delay: number }>>([])
  const [gateOpening, setGateOpening] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

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
  }, [])

  const handleGateOpenComplete = () => {
    setContentVisible(true)
  }

  // Handle age verification requirement
  const handleRestrictedAccess = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    
    if (!ageVerified) {
      setPendingUrl(url)
      setShowAgeModal(true)
    } else {
      window.location.href = url
    }
  }

  const handleAgeConfirm = (isOver18: boolean) => {
    if (isOver18) {
      setAgeVerified(true)
      setShowAgeModal(false)
      
      // Navigate to pending URL if exists
      if (pendingUrl) {
        window.location.href = pendingUrl
        setPendingUrl(null)
      }
    } else {
      alert('You must be 18 or older to access this content.')
      // Redirect away
      window.location.href = 'https://www.google.com'
    }
  }

  const features = [
    {
      icon: Swords,
      title: 'Ancient Combat',
      description: 'Battle in legendary arenas where only the strongest survive',
      color: 'text-red-500',
    },
    {
      icon: Coins,
      title: 'Golden Rewards',
      description: 'Win USDC treasures in competitive tournaments',
      color: 'text-yellow-400',
    },
    {
      icon: Crown,
      title: 'Rise to Glory',
      description: 'Climb the ranks and become a legendary champion',
      color: 'text-purple-400',
    },
    {
      icon: Users,
      title: 'Warrior Guilds',
      description: 'Join forces with allies in epic multiplayer battles',
      color: 'text-blue-400',
    },
  ]

  const games = [
    { name: 'ARENA OF BLOOD', players: '16-100', emoji: '⚔️', color: 'from-red-900 to-red-700' },
    { name: 'CHARIOT RACES', players: '8-32', emoji: '🏛️', color: 'from-amber-900 to-amber-700' },
    { name: 'GLADIATOR DUELS', players: '2-64', emoji: '🗡️', color: 'from-yellow-900 to-yellow-700' },
    { name: 'TEMPLE TRIALS', players: '10-50', emoji: '🏺', color: 'from-orange-900 to-orange-700' },
    { name: 'GOLDEN CONQUEST', players: '8-32', emoji: '👑', color: 'from-yellow-800 to-yellow-600' },
    { name: 'ANCIENT MAZE', players: '64', emoji: '🏛️', color: 'from-stone-900 to-stone-700' },
  ]

  return (
    <>
      {/* Age Verification Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-yellow-500 relative">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Age Verification Required
            </h2>
            <p className="text-gray-300 text-center mb-8">
              You must be 18 years or older to access this content and participate in real money games.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => handleAgeConfirm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                I am 18 or older
              </button>
              <button
                onClick={() => handleAgeConfirm(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                I am under 18
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-6">
              By continuing, you confirm that you meet the legal age requirement for gambling in your jurisdiction.
            </p>
          </div>
        </div>
      )}

      {/* Ancient Gate Animation - PLAYS EVERY VISIT */}
      <AncientGate isOpening={gateOpening} onOpenComplete={handleGateOpenComplete} />

      {/* Main Content - Fades in after gate opens */}
      <main 
        className={`min-h-screen relative overflow-hidden transition-opacity duration-1000 ${
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

        {/* Navigation - Ancient Temple Bar */}
        <nav className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <Trophy className="h-12 w-12 trophy-gold" />
                <div>
                  <h1 className="text-3xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                    EL DORADO
                  </h1>
                  <p className="text-xs text-bronze uppercase tracking-widest">
                    City of Gold
                  </p>
                </div>
              </div>

              {/* Nav Links - Age Verification Required */}
              <div className="hidden md:flex space-x-6">
                <a
                  href="/login"
                  onClick={(e) => handleRestrictedAccess(e, '/login')}
                  className="text-gold hover:text-white transition uppercase tracking-wide flex items-center gap-2"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  Enter
                  {!ageVerified && <span className="text-xs bg-red-500 px-2 py-0.5 rounded">18+</span>}
                </a>
                <a
                  href="/signup"
                  onClick={(e) => handleRestrictedAccess(e, '/signup')}
                  className="ancient-button flex items-center gap-2"
                >
                  Join Quest
                  {!ageVerified && <span className="text-xs bg-red-500 px-2 py-0.5 rounded">18+</span>}
                </a>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <a 
                  href="/signup" 
                  onClick={(e) => handleRestrictedAccess(e, '/signup')}
                  className="ancient-button text-sm"
                >
                  Join
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Ancient Temple */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            {/* Main Title */}
            <div className="mb-8">
              <div className="inline-block">
                <h2 
                  className="text-6xl md:text-8xl font-black mb-4 relative"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-shimmer">
                    EL DORADO
                  </span>
                </h2>
                <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-2xl md:text-4xl text-bronze mb-4 uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
              The Ancient Arena Awaits
            </p>
            
            <p className="text-lg md:text-xl text-gold/80 max-w-3xl mx-auto mb-12">
              Enter the legendary city where warriors compete for glory and golden treasures. 
              Only the brave shall claim victory in the sacred games of El Dorado.
            </p>

            {/* CTA Buttons - Age Verification Required */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <a
                href="/signup"
                onClick={(e) => handleRestrictedAccess(e, '/signup')}
                className="ancient-button text-lg px-8 py-4 inline-block"
              >
                ⚔️ Begin Your Journey {!ageVerified && <span className="text-xs">(18+)</span>}
              </a>
              <Link
                href="/lobby"
                className="ancient-button text-lg px-8 py-4 inline-block"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.8), rgba(139, 0, 0, 0.6))',
                  borderColor: 'var(--blood-red)',
                }}
              >
                👁️ Spectate Arena (Free)
              </Link>
            </div>

            {/* Ancient Divider */}
            <div className="ancient-divider my-12" />
          </div>

          {/* Features - Temple Pillars - FREE TO VIEW */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="ancient-panel game-card text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-full border-2 border-gold/30">
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-bronze text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Game Modes - Sacred Scrolls - FREE TO VIEW */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Sacred Games of Combat
            </h2>
            <p className="text-center text-bronze mb-4 text-lg">
              Choose Your Arena of Battle
            </p>
            <p className="text-center text-yellow-500 mb-12 text-sm">
              ⚠️ Real money games require age verification (18+) ⚠️
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {games.map((game, index) => (
                <div
                  key={index}
                  className="ancient-panel game-card cursor-pointer group relative"
                >
                  {/* 18+ Badge for real money games */}
                  {!ageVerified && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
                      18+
                    </div>
                  )}

                  {/* Game Icon */}
                  <div className="text-6xl mb-4 text-center transform group-hover:scale-110 transition-transform">
                    {game.emoji}
                  </div>
                  
                  {/* Game Name */}
                  <h3 className="text-lg font-bold text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                    {game.name}
                  </h3>
                  
                  {/* Player Count */}
                  <div className="flex items-center justify-center space-x-2 text-bronze text-sm">
                    <Users className="h-4 w-4" />
                    <span>{game.players} Warriors</span>
                  </div>

                  {/* Glow Effect on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity rounded-lg pointer-events-none`} />
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA - Grand Temple Entrance */}
          <div className="ancient-panel text-center pulse-glow">
            <Zap className="h-16 w-16 text-gold mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
              Your Destiny Awaits
            </h2>
            <p className="text-xl text-bronze mb-8 max-w-2xl mx-auto">
              Join thousands of warriors in the most legendary gaming arena. 
              Prove your worth and claim eternal glory in El Dorado.
            </p>
            <a
              href="/signup"
              onClick={(e) => handleRestrictedAccess(e, '/signup')}
              className="ancient-button text-2xl px-12 py-6 inline-block"
            >
              ⚔️ ENTER EL DORADO ⚔️ {!ageVerified && <span className="text-sm">(18+)</span>}
            </a>
          </div>
        </div>

        {/* Footer - Ancient Inscriptions */}
        <footer className="relative z-10 border-t-4 border-double border-gold/30 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Trophy className="h-8 w-8 trophy-gold" />
                <span className="text-2xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                  EL DORADO
                </span>
              </div>
              
              <p className="text-bronze text-sm mb-4">
                The Ancient Arena of Champions
              </p>
              
              <div className="ancient-divider my-6" />
              
              <p className="text-bronze text-xs">
                © 2025 El Dorado Gaming Platform. All Rights Reserved.
              </p>
              <p className="text-bronze text-xs mt-2">
                ⚠️ Sacred Warning: Warriors must be 18+ to enter the arena ⚠️
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
          }
