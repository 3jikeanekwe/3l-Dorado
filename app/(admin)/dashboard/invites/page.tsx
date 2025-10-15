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
