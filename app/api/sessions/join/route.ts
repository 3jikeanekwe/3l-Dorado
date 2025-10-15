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

    // Parse request body
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get game session
    const { data: gameSession, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !gameSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if session is full
    if (gameSession.current_players >= gameSession.max_slots) {
      return NextResponse.json({ error: 'Session is full' }, { status: 400 })
    }

    // Check if user already joined
    const { data: existing } = await supabase
      .from('session_participants')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', session.user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already joined this session' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', session.user.id)
      .single()

    // Calculate bet amount
    const betAmount = gameSession.bet_tier === 'free' ? 0 : parseFloat(gameSession.bet_tier)

    // Check if user has sufficient balance
    if (betAmount > 0 && (profile?.balance || 0) < betAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Deduct bet amount from balance
    if (betAmount > 0) {
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: (profile?.balance || 0) - betAmount })
        .eq('id', session.user.id)

      if (balanceError) throw balanceError

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: session.user.id,
        session_id: sessionId,
        amount: betAmount,
        type: 'bet',
        status: 'completed',
      })
    }

    // Add user to session
    const { data: participant, error: participantError } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: session.user.id,
        bet_amount: betAmount,
      })
      .select()
      .single()

    if (participantError) throw participantError

    // Update session player count and prize pool
    const newPlayerCount = gameSession.current_players + 1
    const newPrizePool = gameSession.prize_pool + betAmount

    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        current_players: newPlayerCount,
        prize_pool: newPrizePool,
      })
      .eq('id', sessionId)

    if (updateError) throw updateError

    return NextResponse.json(
      { 
        participant,
        message: 'Successfully joined session',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error joining session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
      }
