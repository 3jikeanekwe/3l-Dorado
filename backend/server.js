/**
 * El Dorado Backend API Server (Render)
 * Purpose: Handle game logic, payments, and custom operations
 */

const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Supabase client with service role key (full access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes

/**
 * POST /api/sessions/start
 * Start a game session (called by admin or scheduler)
 */
app.post('/api/sessions/start', async (req, res) => {
  try {
    const { sessionId } = req.body

    // Update session status
    const { data, error } = await supabase
      .from('game_sessions')
      .update({
        status: 'active',
        start_time: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, session: data })
  } catch (error) {
    console.error('Error starting session:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/sessions/end
 * End a game session and distribute prizes
 */
app.post('/api/sessions/end', async (req, res) => {
  try {
    const { sessionId, results } = req.body

    // Update session
    await supabase
      .from('game_sessions')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Update participants with results
    for (const result of results) {
      await supabase
        .from('session_participants')
        .update({
          final_position: result.position,
        })
        .eq('session_id', sessionId)
        .eq('user_id', result.userId)
    }

    // Distribute prizes using database function
    await supabase.rpc('distribute_prizes', { session_id: sessionId })

    res.json({ success: true })
  } catch (error) {
    console.error('Error ending session:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/payments/deposit
 * Process USDC deposit (integrates with Circle API)
 */
app.post('/api/payments/deposit', async (req, res) => {
  try {
    const { userId, amount, transactionHash } = req.body

    // TODO: Verify transaction with Circle API
    // const verified = await verifyCircleTransaction(transactionHash)

    // Update user balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    await supabase
      .from('profiles')
      .update({
        balance: (profile.balance || 0) + amount,
      })
      .eq('id', userId)

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      amount,
      type: 'deposit',
      status: 'completed',
      usdc_transaction_hash: transactionHash,
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error processing deposit:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/payments/withdraw
 * Process USDC withdrawal
 */
app.post('/api/payments/withdraw', async (req, res) => {
  try {
    const { userId, amount, walletAddress } = req.body

    // Get user balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    // Check sufficient balance
    const fee = Math.max(amount * 0.02, 0.5)
    const totalDeduction = amount + fee

    if (profile.balance < totalDeduction) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // TODO: Process with Circle API
    // const result = await processCircleWithdrawal(amount, walletAddress)

    // Deduct balance
    await supabase
      .from('profiles')
      .update({
        balance: profile.balance - totalDeduction,
      })
      .eq('id', userId)

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      usdc_transaction_hash: `pending_${Date.now()}`,
    })

    res.json({ success: true, fee })
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stats
 * Get platform statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Active sessions
    const { count: activeSessions } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Total revenue
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'bet')
      .eq('status', 'completed')

    const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const platformRevenue = totalRevenue * 0.1

    res.json({
      totalUsers,
      activeSessions,
      totalRevenue,
      platformRevenue,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app
