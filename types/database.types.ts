export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          role: 'user' | 'admin'
          balance: number
          total_wins: number
          total_losses: number
          xp: number
          level: number
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          role?: 'user' | 'admin'
          balance?: number
          total_wins?: number
          total_losses?: number
          xp?: number
          level?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          role?: 'user' | 'admin'
          balance?: number
          total_wins?: number
          total_losses?: number
          xp?: number
          level?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_invites: {
        Row: {
          id: string
          email: string
          invited_by: string | null
          used: boolean
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          email: string
          invited_by?: string | null
          used?: boolean
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          email?: string
          invited_by?: string | null
          used?: boolean
          created_at?: string
          expires_at?: string
        }
      }
      games: {
        Row: {
          id: string
          name: string
          description: string | null
          thumbnail_url: string | null
          created_by: string | null
          status: 'draft' | 'published' | 'archived'
          max_players: number
          min_players: number
          game_config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          thumbnail_url?: string | null
          created_by?: string | null
          status?: 'draft' | 'published' | 'archived'
          max_players: number
          min_players?: number
          game_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          created_by?: string | null
          status?: 'draft' | 'published' | 'archived'
          max_players?: number
          min_players?: number
          game_config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          game_id: string
          bet_tier: 'free' | '0.25' | '0.5' | '1' | '3' | '5'
          max_slots: number
          current_players: number
          status: 'waiting' | 'active' | 'completed' | 'cancelled'
          start_time: string | null
          end_time: string | null
          prize_pool: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          bet_tier?: 'free' | '0.25' | '0.5' | '1' | '3' | '5'
          max_slots: number
          current_players?: number
          status?: 'waiting' | 'active' | 'completed' | 'cancelled'
          start_time?: string | null
          end_time?: string | null
          prize_pool?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          bet_tier?: 'free' | '0.25' | '0.5' | '1' | '3' | '5'
          max_slots?: number
          current_players?: number
          status?: 'waiting' | 'active' | 'completed' | 'cancelled'
          start_time?: string | null
          end_time?: string | null
          prize_pool?: number
          created_at?: string
          updated_at?: string
        }
      }
      session_participants: {
        Row: {
          id: string
          session_id: string
          user_id: string
          bet_amount: number
          final_position: number | null
          prize_amount: number
          joined_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          bet_amount?: number
          final_position?: number | null
          prize_amount?: number
          joined_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          bet_amount?: number
          final_position?: number | null
          prize_amount?: number
          joined_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          amount: number
          type: string
          status: string
          usdc_transaction_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          amount: number
          type: string
          status?: string
          usdc_transaction_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          amount?: number
          type?: string
          status?: string
          usdc_transaction_hash?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin'
      game_status: 'draft' | 'published' | 'archived'
      session_status: 'waiting' | 'active' | 'completed' | 'cancelled'
      bet_tier: 'free' | '0.25' | '0.5' | '1' | '3' | '5'
    }
  }
      }
