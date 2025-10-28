'use client'

import { useEffect, useState } from 'react'

interface AncientGateProps {
  isOpening: boolean
  onOpenComplete?: () => void
}

export default function AncientGate({ isOpening, onOpenComplete }: AncientGateProps) {
  const [gateState, setGateState] = useState<'closed' | 'opening' | 'open'>('closed')

  useEffect(() => {
    if (isOpening && gateState === 'closed') {
      // Start opening after a brief delay
      setTimeout(() => {
        setGateState('opening')
      }, 500)

      // Complete opening animation
      setTimeout(() => {
        setGateState('open')
        onOpenComplete?.()
      }, 4000) // 4 second animation
    }
  }, [isOpening, gateState, onOpenComplete])

  if (gateState === 'open') return null // Gate is fully open and hidden

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Left Gate Door */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-[3s] ease-out ${
          gateState === 'opening' ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(to right, #1A1410 0%, #2C2416 100%)',
          boxShadow: 'inset -20px 0 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Left Door Design */}
        <div className="relative w-full h-full">
          {/* Stone Texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent 0px, rgba(255, 215, 0, 0.05) 1px, transparent 2px, transparent 40px),
                repeating-linear-gradient(90deg, transparent 0px, rgba(255, 215, 0, 0.05) 1px, transparent 2px, transparent 40px)
              `,
            }}
          />

          {/* Ancient Carvings - Left Side */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8">
            {/* Top Symbol */}
            <div className="text-6xl md:text-8xl opacity-50 text-gold">
              ◆
            </div>

            {/* Center Symbol */}
            <div className="text-8xl md:text-9xl text-gold animate-pulse">
              👑
            </div>

            {/* Ancient Runes */}
            <div className="text-2xl md:text-4xl text-bronze opacity-70 font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
              EL
            </div>

            {/* Bottom Symbol */}
            <div className="text-6xl md:text-8xl opacity-50 text-gold">
              ◆
            </div>
          </div>

          {/* Gold Border on Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-gold via-dark-gold to-gold" />
          
          {/* Door Handle/Ring */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full border-4 border-gold bg-dark-gold shadow-2xl" />
          </div>
        </div>
      </div>

      {/* Right Gate Door */}
      <div
        className={`absolute top-0 right-0 w-1/2 h-full transition-transform duration-[3s] ease-out ${
          gateState === 'opening' ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(to left, #1A1410 0%, #2C2416 100%)',
          boxShadow: 'inset 20px 0 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Right Door Design */}
        <div className="relative w-full h-full">
          {/* Stone Texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent 0px, rgba(255, 215, 0, 0.05) 1px, transparent 2px, transparent 40px),
                repeating-linear-gradient(90deg, transparent 0px, rgba(255, 215, 0, 0.05) 1px, transparent 2px, transparent 40px)
              `,
            }}
          />

          {/* Ancient Carvings - Right Side */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8">
            {/* Top Symbol */}
            <div className="text-6xl md:text-8xl opacity-50 text-gold">
              ◆
            </div>

            {/* Center Symbol */}
            <div className="text-8xl md:text-9xl text-gold animate-pulse">
              ⚔️
            </div>

            {/* Ancient Runes */}
            <div className="text-2xl md:text-4xl text-bronze opacity-70 font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
              DORADO
            </div>

            {/* Bottom Symbol */}
            <div className="text-6xl md:text-8xl opacity-50 text-gold">
              ◆
            </div>
          </div>

          {/* Gold Border on Edge */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-gold via-dark-gold to-gold" />
          
          {/* Door Handle/Ring */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full border-4 border-gold bg-dark-gold shadow-2xl" />
          </div>
        </div>
      </div>

      {/* Center Seal (breaks when opening) */}
      {gateState === 'closed' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            {/* Glowing Seal */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-gold bg-dark-stone flex items-center justify-center shadow-2xl animate-pulse">
              <div className="text-4xl md:text-6xl text-gold">
                🔱
              </div>
            </div>
            
            {/* Seal Glow */}
            <div className="absolute inset-0 rounded-full bg-gold opacity-20 blur-2xl animate-pulse" />
          </div>
        </div>
      )}

      {/* Center Seal Breaking Animation */}
      {gateState === 'opening' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          {/* Explosion Effect */}
          <div className="relative w-48 h-48">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-4 h-4 bg-gold rounded-full"
                style={{
                  animation: `explode 1s ease-out forwards`,
                  animationDelay: `${i * 0.05}s`,
                  transform: `rotate(${i * 30}deg) translateX(0)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dust Particles */}
      {gateState === 'opening' && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-bronze rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float 2s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes explode {
          0% {
            transform: rotate(var(--rotation)) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation)) translateX(200px) scale(0);
            opacity: 0;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 50 - 25}px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Rumbling Screen Effect */}
      {gateState === 'opening' && (
        <div
          className="absolute inset-0 bg-black/20"
          style={{
            animation: 'shake 0.5s ease-in-out 3',
          }}
        />
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  )
            }
