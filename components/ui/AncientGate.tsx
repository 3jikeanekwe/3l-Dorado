'use client'

import React, { useEffect, useState } from 'react'

interface AncientGateProps {
  isOpening: boolean
  onOpenComplete?: () => void
  playCreak?: boolean
}

export default function AncientGate({ isOpening, onOpenComplete, playCreak = true }: AncientGateProps) {
  const [gateState, setGateState] = useState<'closed' | 'breaking' | 'opening' | 'open'>('closed')
  const [showLightning, setShowLightning] = useState(false)

  // Audio elements (optional small sounds from /public/sounds if you add them)
  const [stoneCrackAudio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      return new Audio('/sounds/stone-crack.mp3')
    } catch {
      return null
    }
  })
  const [gateCreakAudio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      return new Audio('/sounds/gate-creak.mp3')
    } catch {
      return null
    }
  })

  useEffect(() => {
    let t1: number | undefined
    let t2: number | undefined
    let t3: number | undefined
    let t4: number | undefined
    let t5: number | undefined

    if (isOpening) {
      // Start sequence
      // 0.5s -> breaking begins (rumble + lightning)
      t1 = window.setTimeout(() => {
        setGateState('breaking')
        setShowLightning(true)
        // small rumble handled by CSS (parent page may also animate)
        if (stoneCrackAudio) {
          try { stoneCrackAudio.volume = 0.5; stoneCrackAudio.play().catch(()=>{}) } catch {}
        }
      }, 500)

      // 1.5s -> peak rumble (keep lightning short)
      t2 = window.setTimeout(() => {
        setShowLightning(false)
      }, 1500)

      // 2.0s -> explosion (we show particles via the component while breaking)
      t3 = window.setTimeout(() => {
        // advance to opening animation
        setGateState('opening')
        if (playCreak && gateCreakAudio) {
          try { gateCreakAudio.volume = 0.45; gateCreakAudio.play().catch(()=>{}) } catch {}
        }
      }, 2000)

      // 3.0s -> gates mostly open (we still keep component around for fade)
      t4 = window.setTimeout(() => {
        setGateState('open')
      }, 3000)

      // 4.0s -> finalize and tell parent to show content
      t5 = window.setTimeout(() => {
        onOpenComplete?.()
      }, 4000)
    }

    return () => {
      if (t1) clearTimeout(t1)
      if (t2) clearTimeout(t2)
      if (t3) clearTimeout(t3)
      if (t4) clearTimeout(t4)
      if (t5) clearTimeout(t5)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpening])

  // When open, don't render (so content is accessible)
  if (gateState === 'open') return null

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Fullscreen dark backdrop while gate active */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          gateState === 'closed' ? 'opacity-100' : 'opacity-90'
        }`}
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.6))' }}
      />

      {/* Left Door */}
      <div
        aria-hidden
        className={`absolute top-0 left-0 w-1/2 h-full transform transition-transform ease-out ${
          gateState === 'opening' ? '-translate-x-[110%]' : 'translate-x-0'
        } duration-[1200ms]`}
        style={{
          background: 'linear-gradient(to right, #2C2416 0%, #1A1410 100%)',
          boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.8)',
        }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div className="text-6xl md:text-8xl opacity-60 text-gold">◆</div>
            <div className="text-8xl md:text-9xl text-gold animate-pulse">👑</div>
            <div className="text-2xl md:text-4xl text-bronze opacity-80 font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>EL</div>
            <div className="text-6xl md:text-8xl opacity-60 text-gold">◆</div>
          </div>

          {/* Gold border */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-gold via-dark-gold to-gold" />
          {/* Door ring */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full border-4 border-gold bg-dark-gold shadow-2xl" />
          </div>
        </div>
      </div>

      {/* Right Door */}
      <div
        aria-hidden
        className={`absolute top-0 right-0 w-1/2 h-full transform transition-transform ease-out ${
          gateState === 'opening' ? 'translate-x-[110%]' : 'translate-x-0'
        } duration-[1200ms]`}
        style={{
          background: 'linear-gradient(to left, #2C2416 0%, #1A1410 100%)',
          boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.8)',
        }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div className="text-6xl md:text-8xl opacity-60 text-gold">◆</div>
            <div className="text-8xl md:text-9xl text-gold animate-pulse">⚔️</div>
            <div className="text-2xl md:text-4xl text-bronze opacity-80 font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>DORADO</div>
            <div className="text-6xl md:text-8xl opacity-60 text-gold">◆</div>
          </div>

          {/* Gold border */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-gold via-dark-gold to-gold" />
          {/* Door ring */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full border-4 border-gold bg-dark-gold shadow-2xl" />
          </div>
        </div>
      </div>

      {/* Center seal while closed */}
      {gateState === 'closed' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="relative">
            <div className="w-36 h-36 md:w-56 md:h-56 rounded-full border-8 border-gold bg-dark-stone flex items-center justify-center shadow-2xl animate-pulse">
              <div className="text-5xl md:text-7xl text-gold">🔱</div>
            </div>
            <div className="absolute inset-0 rounded-full bg-gold opacity-20 blur-2xl animate-pulse" />
          </div>
        </div>
      )}

      {/* Breaking / explosion */}
      {gateState === 'breaking' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative w-48 h-48">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute w-4 h-4 bg-gold rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'center',
                  transform: `rotate(${i * 30}deg) translateX(0)`,
                  animation: `eld-explode 900ms ease-out ${i * 45}ms forwards`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dust particles while opening */}
      {(gateState === 'opening' || gateState === 'breaking') && (
        <div className="absolute inset-0 overflow-hidden z-30 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-bronze rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `eld-dust ${1200 + Math.floor(Math.random() * 900)}ms ease-out ${Math.random() * 400}ms forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lightning flash */}
      {showLightning && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-white/90 animate-eld-lightning" />
        </div>
      )}

      {/* Screen rumble overlay */}
      {(gateState === 'breaking' || gateState === 'opening') && (
        <div className="absolute inset-0 z-50 pointer-events-none animate-eld-shake" />
      )}

      {/* small styles scoped to this component */}
      <style jsx>{`
        @keyframes eld-explode {
          0% { transform: rotate(var(--r)) translateX(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--r)) translateX(220px) scale(0.2); opacity: 0; }
        }

        @keyframes eld-dust {
          0% { transform: translateY(0) translateX(0); opacity: 0.8; }
          100% { transform: translateY(-120px) translateX(${Math.random() * 60 - 30}px); opacity: 0; }
        }

        @keyframes eld-lightning {
          0% { opacity: 0; }
          10% { opacity: 1; }
          25% { opacity: 0.2; }
          35% { opacity: 0.9; }
          100% { opacity: 0; }
        }

        @keyframes eld-shake {
          0% { transform: translate(0,0); }
          10% { transform: translate(-6px, -2px); }
          20% { transform: translate(5px, 3px); }
          30% { transform: translate(-4px, 2px); }
          40% { transform: translate(4px, -2px); }
          50% { transform: translate(0,0); }
          100% { transform: translate(0,0); }
        }

        .animate-eld-shake {
          animation: eld-shake 600ms linear 3;
        }

        .animate-eld-lightning {
          animation: eld-lightning 350ms linear 1;
        }
      `}</style>
    </div>
  )
}
