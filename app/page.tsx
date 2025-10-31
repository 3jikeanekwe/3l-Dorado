'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Gamepad2, Swords } from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'live' | 'wallet' | 'free'>('live')

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage: "url('/copilot_image_1761914239229.jpeg')",
      }}
    >
      {/* Overlay tint for ancient feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90"></div>

      {/* Content Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        {activeTab === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-gold">⚔️ Live Arena</h1>
            <p className="text-gray-300">
              Watch or join real-time matches and tournaments.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-stone-900/80 rounded-xl p-4 border border-gold/40">
                <h2 className="text-lg font-semibold text-gold">Last Man Standing</h2>
                <p className="text-sm text-gray-400">32 players • Arena full in 5m</p>
              </div>
              <div className="bg-stone-900/80 rounded-xl p-4 border border-gold/40">
                <h2 className="text-lg font-semibold text-gold">Car Racing</h2>
                <p className="text-sm text-gray-400">16 players • 2 slots left</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-gold">💰 Wallet & History</h1>
            <p className="text-gray-300">Manage your balance, bets, and sign in to play.</p>
            <div className="bg-stone-900/80 rounded-xl p-4 border border-gold/40 text-left max-w-md mx-auto">
              <button className="w-full py-2 rounded-lg bg-gold text-black font-semibold hover:bg-yellow-500 transition">
                Sign In / Sign Up
              </button>
              <div className="mt-4 text-sm text-gray-400">
                <p>Last Transactions:</p>
                <ul className="list-disc list-inside">
                  <li>+5.00 USDC — Win Reward</li>
                  <li>-1.00 USDC — Arena Entry</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'free' && (
          <motion.div
            key="free"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-gold">🕹️ Free Games</h1>
            <p className="text-gray-300">Play and earn XP with ads (no sign-in required).</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-stone-900/80 rounded-xl p-4 border border-gold/40">
                <h2 className="text-lg font-semibold text-gold">Dodgeball</h2>
                <p className="text-sm text-gray-400">Casual mode • 12 players</p>
              </div>
              <div className="bg-stone-900/80 rounded-xl p-4 border border-gold/40">
                <h2 className="text-lg font-semibold text-gold">Lava Floor</h2>
                <p className="text-sm text-gray-400">Survival • 20 players</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/70 border-t border-gold/30 backdrop-blur-sm flex justify-around py-3 z-20">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center text-sm ${
            activeTab === 'live' ? 'text-gold' : 'text-gray-400'
          }`}
        >
          <Swords className="w-6 h-6" />
          Live Games
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center text-sm ${
            activeTab === 'wallet' ? 'text-gold' : 'text-gray-400'
          }`}
        >
          <Wallet className="w-6 h-6" />
          Wallet
        </button>

        <button
          onClick={() => setActiveTab('free')}
          className={`flex flex-col items-center text-sm ${
            activeTab === 'free' ? 'text-gold' : 'text-gray-400'
          }`}
        >
          <Gamepad2 className="w-6 h-6" />
          Free Games
        </button>
      </nav>
    </div>
  )
}
