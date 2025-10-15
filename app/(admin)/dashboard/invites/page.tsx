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
  }, [supabase])

  const fetchInvites = async () => {
    try {
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

      alert(`Invitation sent to ${email}`)
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
    if (!confirm('Are you sure you want to delete this invite?')) return

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
        <form onSubmit={handleSendInvite} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold disabled:opacity-50"
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
          <p className="text-gray-400 text-sm mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-400">
            {invites.filter((i) => i.used).length}
          </p>
        </div>
      </div>

      {/* Invites List */}
      {invites.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
          <Mail className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">No invites sent yet</p>
          <p className="text-gray-500">Send your first admin invite above</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Invited By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Sent Date
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
                {invites.map((invite) => {
                  const isExpired = new Date(invite.expires_at) < new Date()
                  const status = invite.used
                    ? 'accepted'
                    : isExpired
                    ? 'expired'
                    : 'pending'

                  return (
                    <tr key={invite.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{invite.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'accepted'
                              ? 'bg-green-600 text-white'
                              : status === 'expired'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}
                        >
                          {status === 'accepted' && <Check className="h-3 w-3" />}
                          {status === 'expired' && <X className="h-3 w-3" />}
                          {status === 'pending' && <Clock className="h-3 w-3" />}
                          <span className="capitalize">{status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {invite.profiles?.username || 'System'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {format(new Date(invite.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {format(new Date(invite.expires_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!invite.used && (
                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
ites')
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

      const { data, error} = await supabase
        .from('admin_inv
