'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, UserPlus, Check, X, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function InvitesPage() {
  const supabase = createClient()
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
  fetchInvites()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
    
  

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvites(data || [])
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      alert('Please enter an email address')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address')
      return
    }

    setSending(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('admin_invites')
        .insert({
          email,
          invited_by: session.user.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          alert('This email has already been invited')
        } else {
          throw error
        }
        return
      }

      alert('Invite sent successfully!')
      setEmail('')
      fetchInvites()
    } catch (error: any) {
      console.error('Error sending invite:', error)
      alert('Failed to send invite: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('admin_invites')
        .delete()
        .eq('id', inviteId)

      if (error) throw error
      
      fetchInvites()
    } catch (error) {
      console.error('Error deleting invite:', error)
      alert('Failed to delete invite')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading invites...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Invites</h1>
        <p className="text-gray-400">Invite other admins to manage the platform</p>
      </div>

      {/* Send Invite Form */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <UserPlus className="h-6 w-6" />
          <span>Send New Invite</span>
        </h2>
        
        <form onSubmit={handleSendInvite} className="flex space-x-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Invite'}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-3">
          The invited user will automatically become an admin when they sign up with this email.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Invites</p>
          <p className="text-2xl font-bold text-white">{invites.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {invites.filter((i) => !i.used && new Date(i.expires_at) > new Date()).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Used</p>
          <p className="text-2xl font-bold text-green-400">
            {invites.filter((i) => i.used).length}
          </p>
        </div>
      </div>

      {/* Invites List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Invited By
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Expires
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Mail className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No invites sent yet</p>
                  </td>
                </tr>
              ) : (
                invites.map((invite) => {
                  const isExpired = new Date(invite.expires_at) < new Date()
                  const isUsed = invite.used
                  const isPending = !isUsed && !isExpired

                  return (
                    <tr key={invite.id} className="hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{invite.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {invite.profiles?.username || 'System'}
                      </td>
                      <td className="px-6 py-4">
                        {isUsed ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                            <Check className="h-3 w-3" />
                            <span>Used</span>
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                            <X className="h-3 w-3" />
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {format(new Date(invite.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {format(new Date(invite.expires_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isUsed && (
                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">How it works:</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Send an invite to an email address</li>
          <li>• The user signs up with that email</li>
          <li>• They automatically get admin access</li>
          <li>• Invites expire after 7 days</li>
        </ul>
      </div>
    </div>
  )
}
