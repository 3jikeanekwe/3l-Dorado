-- Seed Script: Insert All 11 Pre-coded Games
-- Run this AFTER setting up your database and creating admin account
-- This populates the games table with all ready-to-play games

-- Get the first admin user ID (you can replace with specific admin ID)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get first admin user
    SELECT id INTO admin_user_id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1;

    -- Insert all games
    INSERT INTO public.games (name, description, min_players, max_players, status, created_by, game_config) VALUES

    -- Game 1: Battle Royale + Maze
    (
        '2D Battle Royale + Maze',
        'Last player standing wins. Shrinking play zone, maze obstacles, collect weapons. surviv.io style gameplay with strategic maze navigation.',
        16,
        100,
        'published',
        admin_user_id,
        '{
            "gameType": "battle_royale",
            "controls": "WASD to move, Mouse to aim, Click to shoot",
            "thumbnail": "🎯",
            "physics": {
                "gravity": 0,
                "friction": 0.95,
                "playerSpeed": 3,
                "bulletSpeed": 10
            },
            "weapons": ["pistol", "rifle", "shotgun"],
            "shrinkZone": true,
            "mazeGeneration": true,
            "zoneShrinkRate": 0.5
        }'::jsonb
    ),

    -- Game 2: Car Racing
    (
        'Multi-Car Racing',
        'Race against opponents on an oval track. Complete 3 laps first to win. Use boost pads for extra speed!',
        8,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "racing",
            "controls": "Arrow keys or WASD to drive",
            "thumbnail": "🏎️",
            "physics": {
                "gravity": 0,
                "friction": 0.98,
                "maxSpeed": 5,
                "acceleration": 0.2,
                "turnSpeed": 0.03
            },
            "laps": 3,
            "checkpoints": 8,
            "track": "oval"
        }'::jsonb
    ),

    -- Game 3: Combat Arena
    (
        'Combat Arena - Last Man Standing',
        '16-100 player combat arena with zombie attacks. Eliminate enemies and survive zombies. Players must toss eliminated players to zombies to make them retreat.',
        16,
        100,
        'published',
        admin_user_id,
        '{
            "gameType": "combat",
            "controls": "WASD to move, Mouse to aim, Click to attack, E to toss player",
            "thumbnail": "⚔️",
            "physics": {
                "gravity": 0,
                "friction": 0.95,
                "playerSpeed": 2.5
            },
            "zombies": {
                "enabled": true,
                "spawnRate": 5000,
                "speed": 1.5,
                "health": 50,
                "retreatOnFeed": true
            },
            "weapons": true
        }'::jsonb
    ),

    -- Game 4: Fastest Finger
    (
        'Fastest Finger Typing Challenge',
        'Type random words correctly. When only 10 players remain, the slowest player each round is eliminated until one winner remains.',
        10,
        50,
        'published',
        admin_user_id,
        '{
            "gameType": "typing",
            "controls": "Type the words that appear on screen",
            "thumbnail": "⌨️",
            "rounds": 10,
            "wordsPerRound": 5,
            "timePerWord": 10000,
            "eliminationThreshold": 10,
            "wordList": ["velocity", "champion", "lightning", "adventure", "incredible", "challenge", "mysterious", "fantastic", "brilliant", "spectacular"]
        }'::jsonb
    ),

    -- Game 5: Dodgeball
    (
        'Dodgeball Arena',
        'Throw balls to eliminate opponents. Dodge incoming balls. Last team or player standing wins!',
        8,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "dodgeball",
            "controls": "WASD to move, Click to throw ball, Space to catch",
            "thumbnail": "🏐",
            "physics": {
                "gravity": 0,
                "friction": 0.97,
                "ballSpeed": 6,
                "playerSpeed": 3
            },
            "balls": 6,
            "teams": 2
        }'::jsonb
    ),

    -- Game 6: Musical Chairs
    (
        'Musical Chairs (64 Players Max)',
        'Run to claim a chair when music stops. One less chair each round. Player without chair is eliminated!',
        32,
        64,
        'published',
        admin_user_id,
        '{
            "gameType": "musical_chairs",
            "controls": "WASD to move, Space to sit on chair",
            "thumbnail": "🪑",
            "musicDuration": [10000, 15000],
            "chairReductionPerRound": 1,
            "moveSpeed": 3.5,
            "sitRadius": 30
        }'::jsonb
    ),

    -- Game 7: Lava Floor
    (
        'Lava Floor - Platform Survival',
        'Platforms disappear randomly. Push other players off or survive by changing platforms. Last player standing wins!',
        8,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "platformer",
            "controls": "WASD to move, Space to jump, E to push nearby players",
            "thumbnail": "🔥",
            "physics": {
                "gravity": 0.5,
                "friction": 0.9,
                "jumpForce": 8,
                "playerSpeed": 3,
                "pushForce": 5
            },
            "platformDisappearRate": 5000,
            "lavaDamage": 100,
            "platformCount": 20
        }'::jsonb
    ),

    -- Game 8: Wall Climb
    (
        'Wall Climb - Escape the Crabs',
        'Climb the wall before killer crabs reach you. Hit other players to slow down crabs temporarily!',
        8,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "climbing",
            "controls": "WASD to climb, Click to hit other climbers",
            "thumbnail": "🧗",
            "physics": {
                "climbSpeed": 2,
                "gravity": 0.3,
                "hitKnockback": 50
            },
            "wallHeight": 1000,
            "crabSpeed": 1,
            "crabSpawnRate": 3000,
            "crabSlowOnKill": 2000
        }'::jsonb
    ),

    -- Game 9: Table Tennis (Tournament)
    (
        'Table Tennis / Digital Ping Pong',
        '1v1 ping pong matches. Tournament-style elimination. Beat your opponent to advance to the next round!',
        2,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "tournament_1v1",
            "controls": "Mouse or Arrow keys to move paddle",
            "thumbnail": "🏓",
            "physics": {
                "ballSpeed": 5,
                "paddleSpeed": 4,
                "ballAcceleration": 1.05
            },
            "pointsToWin": 11,
            "tournamentBracket": true,
            "maxPlayers": 32
        }'::jsonb
    ),

    -- Game 10: Penalty Kicks (Tournament)
    (
        'Penalty Kicks Tournament',
        '1v1 penalty shootout. Score more goals than opponent. Take turns as striker and goalkeeper!',
        2,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "tournament_1v1",
            "controls": "Aim with mouse, click to shoot/dive",
            "thumbnail": "⚽",
            "shotsPerRound": 5,
            "goalSize": {"width": 300, "height": 150},
            "shooterTime": 5000,
            "goalkeeperTime": 1000,
            "tournamentBracket": true,
            "maxPlayers": 32
        }'::jsonb
    ),

    -- Game 11: Tic Tac Toe (Tournament)
    (
        'Tic Tac Toe Tournament',
        '1v1 tic-tac-toe matches. Tournament bracket elimination. Get 3 in a row to win and advance!',
        2,
        32,
        'published',
        admin_user_id,
        '{
            "gameType": "tournament_1v1",
            "controls": "Click on grid to place your mark",
            "thumbnail": "❌⭕",
            "gridSize": 3,
            "timePerMove": 30000,
            "tournamentBracket": true,
            "maxPlayers": 32
        }'::jsonb
    );

    RAISE NOTICE 'Successfully inserted 11 pre-coded games!';
END $$;
