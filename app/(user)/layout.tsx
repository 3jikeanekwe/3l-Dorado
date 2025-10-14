'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Home, User, Wallet, LogOut, Menu, X } from 'lucide-react'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/lobby" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">El Dorado</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/lobby"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
              >
                <Home className="h-5 w-5" />
                <span>Lobby</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              
              {/* Balance */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg">
                <Wallet className="h-5 w-5 text-green-400" />
                <span className="text-white font-semibold">
                  ${profile?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{profile?.username}</p>
                  <p className="text-xs text-gray-400">Level {profile?.level || 1}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/lobby"
                onClick={() => setMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                <Home className="h-5 w-5" />
                <span>Lobby</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg">
                <Wallet className="h-5 w-5 text-green-400" />
                <span className="text-white font-semibold">
                  Balance: ${profile?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
                }
