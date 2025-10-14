import Link from 'next/link'
import { Trophy, Gamepad2, DollarSign, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">El Dorado</span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-white hover:text-yellow-400 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Compete. Win. Earn.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join the ultimate competitive gaming platform. Play multiplayer games, 
            place bets with USDC, and win real money.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/lobby"
              className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-bold text-lg backdrop-blur-sm"
            >
              View Games
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Gamepad2 className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Multiple Games</h3>
            <p className="text-gray-400">
              Battle royale, racing, combat arenas, and unique mini-games
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <DollarSign className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Real Money Betting</h3>
            <p className="text-gray-400">
              Bet with USDC and win cash prizes. Multiple betting tiers available
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Users className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Session-Based</h3>
            <p className="text-gray-400">
              Join ongoing matches instantly. No waiting for lobbies to fill
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Trophy className="h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ranked System</h3>
            <p className="text-gray-400">
              Level up, earn XP, and unlock exclusive rewards and customizations
            </p>
          </div>
        </div>

        {/* Game Modes Preview */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Popular Game Modes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Battle Royale', players: '16-100 players', img: '🎯' },
              { name: 'Car Racing', players: '8-32 players', img: '🏎️' },
              { name: 'Last Man Standing', players: '16-100 players', img: '⚔️' },
              { name: 'Fastest Finger', players: '10-50 players', img: '⌨️' },
              { name: 'Dodgeball', players: '8-32 players', img: '🏐' },
              { name: 'Musical Chairs', players: '64 players', img: '🪑' },
            ].map((game) => (
              <div key={game.name} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-yellow-400/50 transition">
                <div className="text-6xl mb-4">{game.img}</div>
                <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-400">{game.players}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-12 border border-yellow-500/30">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Compete?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of players and start winning today
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 El Dorado Gaming Platform. All rights reserved.</p>
            <p className="mt-2 text-sm">Play responsibly. 18+ only.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
