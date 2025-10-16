-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE game_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE session_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');
CREATE TYPE bet_tier AS ENUM ('free', '0.25', '0.5', '1', '3', '5');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    role user_role DEFAULT 'user',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin invites table
CREATE TABLE public.admin_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    invited_by UUID REFERENCES public.profiles(id),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Games table (created by admins)
CREATE TABLE public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    status game_status DEFAULT 'draft',
    max_players INTEGER NOT NULL,
    min_players INTEGER DEFAULT 2,
    game_config JSONB, -- Stores game logic, physics, sprites, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE public.game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    bet_tier bet_tier DEFAULT 'free',
    max_slots INTEGER NOT NULL,
    current_players INTEGER DEFAULT 0,
    status session_status DEFAULT 'waiting',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    prize_pool DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants
CREATE TABLE public.session_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    bet_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_position INTEGER,
    prize_amount DECIMAL(10, 2) DEFAULT 0.00,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- Transactions table (USDC bets & prizes)
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    session_id UUID REFERENCES public.game_sessions(id),
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'bet', 'prize', 'deposit', 'withdrawal'
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    usdc_transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admin invites: Only admins can manage
CREATE POLICY "Admins can manage invites"
    ON public.admin_invites FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Games: Everyone can read published, admins can manage all
CREATE POLICY "Published games are viewable by everyone"
    ON public.games FOR SELECT
    USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Admins can create games"
    ON public.games FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update own games"
    ON public.games FOR UPDATE
    USING (created_by = auth.uid());

-- Game sessions: Everyone can read, system creates
CREATE POLICY "Sessions are viewable by everyone"
    ON public.game_sessions FOR SELECT
    USING (true);

-- Session participants: Users can read own, insert own
CREATE POLICY "Users can view own participation"
    ON public.session_participants FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can join sessions"
    ON public.session_participants FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Transactions: Users can view own
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (user_id = auth.uid());

-- Functions

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if email is in admin invites
    SELECT EXISTS (
        SELECT 1 FROM public.admin_invites
        WHERE email = NEW.email
        AND used = FALSE
        AND expires_at > NOW()
    ) INTO is_admin;

    -- Create profile
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN is_admin THEN 'admin'::user_role ELSE 'user'::user_role END
    );

    -- Mark invite as used if admin
    IF is_admin THEN
        UPDATE public.admin_invites
        SET used = TRUE
        WHERE email = NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert your email as admin invite
INSERT INTO public.admin_invites (email, invited_by)
VALUES ('3jike.anekwe@gmail.com', NULL);
