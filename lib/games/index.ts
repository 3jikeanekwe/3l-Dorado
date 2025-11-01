/**
 * Complete Games Registry - All 11 Pre-coded Games
 * No admin building needed - fully playable games
 */

export const COMPLETE_GAMES = [
  {
    id: 'battle-royale',
    name: '2D Battle Royale + Maze',
    description: 'Last player standing wins. Shrinking play zone, maze obstacles, collect weapons. surviv.io style gameplay.',
    minPlayers: 16,
    maxPlayers: 100,
    thumbnail: '🎯',
    gameType: 'battle_royale',
    controls: 'WASD to move, Mouse to aim, Click to shoot',
    rules: 'Survive the shrinking zone, eliminate enemies, last player wins',
  },
  {
    id: 'car-racing',
    name: 'Multi-Car Racing',
    description: 'Race against opponents on an oval track. Complete 3 laps first to win.',
    minPlayers: 8,
    maxPlayers: 32,
    thumbnail: '🏎️',
    gameType: 'racing',
    controls: 'Arrow keys or WASD to drive',
    rules: 'Complete 3 laps, first to finish wins',
  },
  {
    id: 'combat-arena',
    name: 'Combat Arena (Last Man Standing)',
    description: '16-100 player combat arena with zombie attacks. Kill zombies and survive other players.',
    minPlayers: 16,
    maxPlayers: 100,
    thumbnail: '⚔️',
    gameType: 'combat',
    controls: 'WASD to move, Mouse to aim, Click to attack',
    rules: 'Eliminate other players, survive zombies, be the last standing',
  },
  {
    id: 'fastest-finger',
    name: 'Fastest Finger Typing',
    description: 'Type random words correctly. Slowest player eliminated when 10 remain.',
    minPlayers: 10,
    maxPlayers: 50,
    thumbnail: '⌨️',
    gameType: 'typing',
    controls: 'Type the words that appear on screen',
    rules: 'Type faster than others, eliminate slowest player each round',
  },
  {
    id: 'dodgeball',
    name: 'Dodgeball',
    description: 'Throw balls to eliminate opponents. Last team/player standing wins.',
    minPlayers: 8,
    maxPlayers: 32,
    thumbnail: '🏐',
    gameType: 'dodgeball',
    controls: 'WASD to move, Click to throw ball',
    rules: 'Hit opponents with balls, dodge incoming balls, last player wins',
  },
  {
    id: 'musical-chairs',
    name: 'Musical Chairs',
    description: 'Run to claim a chair when music stops. One less chair each round.',
    minPlayers: 32,
    maxPlayers: 64,
    thumbnail: '🪑',
    gameType: 'musical_chairs',
    controls: 'WASD to move, Space to sit',
    rules: 'Sit on a chair when music stops, player without chair is eliminated',
  },
  {
    id: 'lava-floor',
    name: 'Lava Floor',
    description: 'Platforms disappear randomly. Push others or survive falling. Last player wins.',
    minPlayers: 8,
    maxPlayers: 32,
    thumbnail: '🔥',
    gameType: 'platformer',
    controls: 'WASD to move, Space to jump, E to push',
    rules: 'Stay on platforms, push others into lava, last player wins',
  },
  {
    id: 'wall-climb',
    name: 'Wall Climb',
    description: 'Climb the wall before killer crabs reach you. Can slow down crabs by hitting other players.',
    minPlayers: 8,
    maxPlayers: 32,
    thumbnail: '🧗',
    gameType: 'climbing',
    controls: 'WASD to climb, Click to attack other climbers',
    rules: 'Reach the top before crabs catch you, slow crabs by eliminating others',
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis / Digital Ping Pong',
    description: '1v1 ping pong matches. Tournament-style elimination.',
    minPlayers: 2,
    maxPlayers: 32,
    thumbnail: '🏓',
    gameType: 'tournament_1v1',
    controls: 'Mouse or Arrow keys to move paddle',
    rules: 'Beat opponent in ping pong, advance through tournament',
  },
  {
    id: 'penalty-kicks',
    name: 'Penalty Kicks',
    description: '1v1 penalty shootout. Score more goals than opponent.',
    minPlayers: 2,
    maxPlayers: 32,
    thumbnail: '⚽',
    gameType: 'tournament_1v1',
    controls: 'Aim with mouse, click to shoot/dive',
    rules: 'Score goals as striker, save as goalkeeper, advance through tournament',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe Tournament',
    description: '1v1 tic-tac-toe matches. Tournament bracket elimination.',
    minPlayers: 2,
    maxPlayers: 32,
    thumbnail: '❌⭕',
    gameType: 'tournament_1v1',
    controls: 'Click on grid to place mark',
    rules: 'Get 3 in a row to win, advance through tournament bracket',
  },
]

// Game configuration with full logic
export const GAME_CONFIGS = {
  'battle-royale': {
    physics: {
      gravity: 0,
      friction: 0.95,
      playerSpeed: 3,
      bulletSpeed: 10,
    },
    weapons: ['pistol', 'rifle', 'shotgun'],
    shrinkZone: true,
    mazeGeneration: true,
  },
  'car-racing': {
    physics: {
      gravity: 0,
      friction: 0.98,
      maxSpeed: 5,
      acceleration: 0.2,
      turnSpeed: 0.03,
    },
    laps: 3,
    checkpoints: 8,
    track: 'oval',
  },
  'combat-arena': {
    physics: {
      gravity: 0,
      friction: 0.95,
      playerSpeed: 2.5,
    },
    zombies: {
      enabled: true,
      spawnRate: 5000, // ms
      speed: 1.5,
      health: 50,
    },
    weapons: true,
  },
  'fastest-finger': {
    rounds: 10,
    wordsPerRound: 5,
    timePerWord: 10000, // ms
    eliminationThreshold: 10, // eliminate when 10 players left
  },
  'dodgeball': {
    physics: {
      gravity: 0,
      friction: 0.97,
      ballSpeed: 6,
      playerSpeed: 3,
    },
    balls: 6,
    teams: 2,
  },
  'musical-chairs': {
    musicDuration: [10000, 15000], // random between 10-15s
    chairReductionPerRound: 1,
    moveSpeed: 3.5,
  },
  'lava-floor': {
    physics: {
      gravity: 0.5,
      friction: 0.9,
      jumpForce: 8,
      playerSpeed: 3,
    },
    platformDisappearRate: 5000, // ms
    lavaDamage: 100, // instant death
  },
  'wall-climb': {
    physics: {
      climbSpeed: 2,
      gravity: 0.3,
    },
    wallHeight: 1000,
    crabSpeed: 1,
    crabSpawnRate: 3000,
  },
  'table-tennis': {
    physics: {
      ballSpeed: 5,
      paddleSpeed: 4,
    },
    pointsToWin: 11,
    tournamentBracket: true,
  },
  'penalty-kicks': {
    shotsPerRound: 5,
    goalSize: {width: 300, height: 150},
    shooterTime: 5000, // ms to aim
    goalkeeperTime: 1000, // ms reaction time
    tournamentBracket: true,
  },
  'tic-tac-toe': {
    gridSize: 3,
    timePerMove: 30000, // ms
    tournamentBracket: true,
  },
}

export default COMPLETE_GAMES
