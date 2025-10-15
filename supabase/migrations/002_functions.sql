-- Additional database functions for El Dorado Platform

-- Function to increment user balance
CREATE OR REPLACE FUNCTION public.increment_balance(
    user_id UUID,
    amount DECIMAL(10, 2)
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET balance = balance + amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement user balance
CREATE OR REPLACE FUNCTION public.decrement_balance(
    user_id UUID,
    amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL(10, 2);
BEGIN
    -- Get current balance
    SELECT balance INTO current_balance
    FROM public.profiles
    WHERE id = user_id;

    -- Check if sufficient balance
    IF current_balance >= amount THEN
        UPDATE public.profiles
        SET balance = balance - amount
        WHERE id = user_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION public.add_xp(
    user_id UUID,
    xp_amount INTEGER
)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    new_xp INTEGER;
    new_level INTEGER;
BEGIN
    -- Get current XP
    SELECT xp INTO current_xp
    FROM public.profiles
    WHERE id = user_id;

    -- Calculate new XP and level
    new_xp := current_xp + xp_amount;
    new_level := FLOOR(SQRT(new_xp / 100)) + 1;

    -- Update profile
    UPDATE public.profiles
    SET 
        xp = new_xp,
        level = new_level
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record win
CREATE OR REPLACE FUNCTION public.record_win(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET total_wins = total_wins + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record loss
CREATE OR REPLACE FUNCTION public.record_loss(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET total_losses = total_losses + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active sessions for a game
CREATE OR REPLACE FUNCTION public.get_active_sessions(game_id UUID)
RETURNS TABLE (
    session_id UUID,
    bet_tier bet_tier,
    current_players INTEGER,
    max_slots INTEGER,
    prize_pool DECIMAL(10, 2),
    status session_status,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        bet_tier,
        current_players,
        max_slots,
        prize_pool,
        status,
        created_at
    FROM public.game_sessions
    WHERE game_sessions.game_id = get_active_sessions.game_id
    AND status IN ('waiting', 'active')
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can join session
CREATE OR REPLACE FUNCTION public.can_join_session(
    session_id UUID,
    user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    session_record RECORD;
    user_balance DECIMAL(10, 2);
    bet_amount DECIMAL(10, 2);
    already_joined BOOLEAN;
BEGIN
    -- Get session details
    SELECT * INTO session_record
    FROM public.game_sessions
    WHERE id = session_id;

    -- Check if session exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Check if session is full
    IF session_record.current_players >= session_record.max_slots THEN
        RETURN FALSE;
    END IF;

    -- Check if already joined
    SELECT EXISTS (
        SELECT 1 FROM public.session_participants
        WHERE session_participants.session_id = can_join_session.session_id
        AND session_participants.user_id = can_join_session.user_id
    ) INTO already_joined;

    IF already_joined THEN
        RETURN FALSE;
    END IF;

    -- Check balance if not free
    IF session_record.bet_tier != 'free' THEN
        bet_amount := session_record.bet_tier::DECIMAL;
        
        SELECT balance INTO user_balance
        FROM public.profiles
        WHERE profiles.id = can_join_session.user_id;

        IF user_balance < bet_amount THEN
            RETURN FALSE;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id UUID)
RETURNS TABLE (
    total_games INTEGER,
    total_wins INTEGER,
    total_losses INTEGER,
    win_rate DECIMAL(5, 2),
    total_earned DECIMAL(10, 2),
    total_spent DECIMAL(10, 2),
    current_level INTEGER,
    current_xp INTEGER,
    xp_for_next_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.total_wins + p.total_losses AS total_games,
        p.total_wins,
        p.total_losses,
        CASE 
            WHEN (p.total_wins + p.total_losses) > 0 
            THEN ROUND((p.total_wins::DECIMAL / (p.total_wins + p.total_losses)) * 100, 2)
            ELSE 0::DECIMAL
        END AS win_rate,
        COALESCE(
            (SELECT SUM(amount) FROM public.transactions 
             WHERE transactions.user_id = get_user_stats.user_id 
             AND type = 'prize' 
             AND status = 'completed'),
            0
        ) AS total_earned,
        COALESCE(
            (SELECT SUM(amount) FROM public.transactions 
             WHERE transactions.user_id = get_user_stats.user_id 
             AND type = 'bet' 
             AND status = 'completed'),
            0
        ) AS total_spent,
        p.level AS current_level,
        p.xp AS current_xp,
        (p.level * p.level * 100) AS xp_for_next_level
    FROM public.profiles p
    WHERE p.id = get_user_stats.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to distribute prizes after game ends
CREATE OR REPLACE FUNCTION public.distribute_prizes(session_id UUID)
RETURNS VOID AS $$
DECLARE
    session_record RECORD;
    participant_record RECORD;
    prize_distribution DECIMAL[] := ARRAY[0.50, 0.25, 0.07, 0.05, 0.03];
    platform_fee DECIMAL := 0.10;
    position INTEGER := 1;
BEGIN
    -- Get session details
    SELECT * INTO session_record
    FROM public.game_sessions
    WHERE id = session_id;

    -- Loop through participants in order of final position
    FOR participant_record IN
        SELECT * FROM public.session_participants
        WHERE session_participants.session_id = distribute_prizes.session_id
        AND final_position IS NOT NULL
        ORDER BY final_position ASC
        LIMIT 5
    LOOP
        IF position <= 5 THEN
            -- Calculate prize
            DECLARE
                prize DECIMAL(10, 2);
            BEGIN
                prize := session_record.prize_pool * prize_distribution[position];

                -- Update participant prize
                UPDATE public.session_participants
                SET prize_amount = prize
                WHERE id = participant_record.id;

                -- Add to user balance
                PERFORM public.increment_balance(participant_record.user_id, prize);

                -- Record win for first place
                IF position = 1 THEN
                    PERFORM public.record_win(participant_record.user_id);
                ELSE
                    PERFORM public.record_loss(participant_record.user_id);
                END IF;

                -- Add XP based on position
                PERFORM public.add_xp(
                    participant_record.user_id,
                    100 - (position * 15)
                );

                position := position + 1;
            END;
        END IF;
    END LOOP;

    -- Mark all other participants as losers
    UPDATE public.session_participants
    SET prize_amount = 0
    WHERE session_participants.session_id = distribute_prizes.session_id
    AND final_position > 5;

    FOR participant_record IN
        SELECT * FROM public.session_participants
        WHERE session_participants.session_id = distribute_prizes.session_id
        AND final_position > 5
    LOOP
        PERFORM public.record_loss(participant_record.user_id);
        PERFORM public.add_xp(participant_record.user_id, 10);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Cancel sessions that have been waiting for more than 1 hour
    UPDATE public.game_sessions
    SET status = 'cancelled'
    WHERE status = 'waiting'
    AND created_at < NOW() - INTERVAL '1 hour';

    GET DIAGNOSTICS expired_count = ROW_COUNT;

    -- Refund bets for cancelled sessions
    INSERT INTO public.transactions (user_id, session_id, amount, type, status)
    SELECT 
        sp.user_id,
        sp.session_id,
        sp.bet_amount,
        'refund',
        'completed'
    FROM public.session_participants sp
    INNER JOIN public.game_sessions gs ON sp.session_id = gs.id
    WHERE gs.status = 'cancelled'
    AND sp.bet_amount > 0;

    -- Add refunds to user balances
    UPDATE public.profiles p
    SET balance = balance + refund_total
    FROM (
        SELECT 
            sp.user_id,
            SUM(sp.bet_amount) AS refund_total
        FROM public.session_participants sp
        INNER JOIN public.game_sessions gs ON sp.session_id = gs.id
        WHERE gs.status = 'cancelled'
        AND sp.bet_amount > 0
        GROUP BY sp.user_id
    ) refunds
    WHERE p.id = refunds.user_id;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_xp TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_win TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_loss TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_join_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.distribute_prizes TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions TO authenticated;
