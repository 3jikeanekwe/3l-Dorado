'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'

export default function WalletPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchWalletData()
  }, [supabase])

  const fetchWalletData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount)
    
    if (!depositAmount || depositAmount < 1) {
      alert('Minimum deposit is $1.00')
      return
    }

    setProcessing(true)

    try {
      // TODO: Integrate Circle API or payment provider
      // For now, just add to balance (development only)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Create pending transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: session.user.id,
          amount: depositAmount,
          type: 'deposit',
          status: 'pending',
          usdc_transaction_hash: `dev_${Date.now()}`,
        })
        .select()
        .single()

      if (txError) throw txError

      // Update balance (in production, this happens after payment confirmation)
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: (profile?.balance || 0) + depositAmount,
        })
        .eq('id', session.user.id)

      if (balanceError) throw balanceError

      // Mark transaction as completed
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id)

      alert('Deposit successful!')
      setAmount('')
      setShowDeposit(false)
      fetchWalletData()
    } catch (error: any) {
      console.error('Deposit error:', error)
      alert('Deposit failed: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount)
    
    if (!withdrawAmount || withdrawAmount < 5) {
      alert('Minimum withdrawal is $5.00')
      return
    }

    if (withdrawAmount > (profile?.balance || 0)) {
      alert('Insufficient balance')
      return
    }

    if (!walletAddress) {
      alert('Please enter your wallet address')
      return
    }

    setProcessing(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Calculate fee (2%, minimum $0.50)
      const fee = Math.max(withdrawAmount * 0.02, 0.5)
      const totalDeduction = withdrawAmount + fee

      if (totalDeduction > (profile?.balance || 0)) {
        alert(`Insufficient balance. Fee: $${fee.toFixed(2)}`)
        setProcessing(false)
        return
      }

      // Create pending transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: session.user.id,
          amount: withdrawAmount,
          type: 'withdrawal',
          status: 'pending',
          usdc_transaction_hash: `dev_withdrawal_${Date.now()}`,
        })
        .select()
        .single()

      if (txError) throw txError

      // Deduct from balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: (profile?.balance || 0) - totalDeduction,
        })
        .eq('id', session.user.id)

      if (balanceError) throw balanceError

      // Mark transaction as completed (in production, this happens after blockchain confirmation)
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id)

      alert(`Withdrawal successful! Fee: $${fee.toFixed(2)}`)
      setAmount('')
      setWalletAddress('')
      setShowWithdraw(false)
      fetchWalletData()
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      alert('Withdrawal failed: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading wallet...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Wallet</h1>
        <p className="text-gray-400">Manage your USDC balance and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 mb-8 border border-green-500/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold text-white">
              ${profile?.balance?.toFixed(2) || '0.00'}
            </h2>
            <p className="text-green-100 text-sm mt-2">USDC</p>
          </div>
          <Wallet className="h-16 w-16 text-white/30" />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowDeposit(true)
              setShowWithdraw(false)
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 transition font-bold"
          >
            <ArrowDownToLine className="h-5 w-5" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              setShowWithdraw(true)
              setShowDeposit(false)
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition font-bold"
          >
            <ArrowUpFromLine className="h-5 w-5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Deposit Form */}
      {showDeposit && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Deposit USDC</h3>
            <button
              onClick={() => setShowDeposit(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <p className="text-sm text-gray-400 mt-1">Minimum: $1.00</p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Development Mode</p>
                  <p>This is a demo deposit. In production, you'll connect your wallet or use Circle API for real USDC deposits.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={processing}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Deposit USDC'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <History className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white">Transaction History</h3>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-6 hover:bg-gray-700/30 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-full ${
                        tx.type === 'deposit'
                          ? 'bg-green-600'
                          : tx.type === 'withdrawal'
                          ? 'bg-blue-600'
                          : tx.type === 'prize'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                    >
                      {tx.type === 'deposit' && (
                        <ArrowDownToLine className="h-5 w-5 text-white" />
                      )}
                      {tx.type === 'withdrawal' && (
                        <ArrowUpFromLine className="h-5 w-5 text-white" />
                      )}
                      {tx.type === 'prize' && (
                        <Check className="h-5 w-5 text-white" />
                      )}
                      {tx.type === 'bet' && (
                        <X className="h-5 w-5 text-white" />
                      )}
                    </div>

                    <div>
                      <p className="text-white font-semibold capitalize">
                        {tx.type}
                      </p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {tx.usdc_transaction_hash && (
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {tx.usdc_transaction_hash}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        tx.type === 'deposit' || tx.type === 'prize'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'prize' ? '+' : '-'}$
                      {Number(tx.amount).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tx.status === 'completed'
                          ? 'bg-green-600 text-white'
                          : tx.status === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
        <h3 className="text-blue-400 font-semibold mb-3">About USDC Payments</h3>
        <ul className="text-sm text-blue-200 space-y-2">
          <li>• USDC is a stablecoin pegged 1:1 to the US Dollar</li>
          <li>• Deposits are instant, withdrawals take 1-3 business days</li>
          <li>• Withdrawal fee: 2% (minimum $0.50)</li>
          <li>• Supported networks: Polygon (MATIC), Ethereum</li>
          <li>• All transactions are recorded on the blockchain</li>
        </ul>
      </div>
    </div>
  )
}

      )}

      {/* Withdraw Form */}
      {showWithdraw && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Withdraw USDC</h3>
            <button
              onClick={() => setShowWithdraw(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="5"
                step="0.01"
                max={profile?.balance || 0}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <p className="text-sm text-gray-400 mt-1">
                Minimum: $5.00 | Fee: 2% (min $0.50)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <p className="text-sm text-gray-400 mt-1">Polygon (MATIC) network</p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-semibold mb-1">Development Mode</p>
                  <p>This is a demo withdrawal. In production, USDC will be sent to your wallet via Circle API.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Withdraw USDC'}
            </button>
          </div>
        </div>
