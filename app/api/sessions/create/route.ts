import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { gameId, betTier, maxSlots, scheduledTime } = body

    // Validate input
    if (!gameId || !betTier || !maxSlots) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create game session
    const { data: gameSession, error } = await supabase
      .from('game_sessions')
      .insert({
        game_id: gameId,
        bet_tier: betTier,
        max_slots: maxSlots,
        current_players: 0,
        status: 'waiting',
        prize_pool: 0,
        start_time: scheduledTime || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session: gameSession }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
