/**
 * El Dorado Game Engine
 * Core game engine for running multiplayer games
 */

export interface GameObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  color: string
  type: string
  physics?: {
    enabled: boolean
    mass: number
    friction: number
  }
}

export interface Player {
  id: string
  username: string
  x: number
  y: number
  width: number
  height: number
  health: number
  score: number
  color: string
  inputs: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    action: boolean
  }
}

export interface GameState {
  players: Map<string, Player>
  objects: GameObject[]
  score: { [playerId: string]: number }
  timeRemaining: number
  gameStatus: 'waiting' | 'active' | 'completed'
}

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private gameState: GameState
  private gameConfig: any
  private animationFrameId: number | null = null
  private lastFrameTime: number = 0
  private readonly FPS = 60
  private readonly FRAME_DURATION = 1000 / this.FPS

  constructor(canvas: HTMLCanvasElement, gameConfig: any) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get canvas context')
    }
    this.ctx = context
    this.gameConfig = gameConfig

    this.gameState = {
      players: new Map(),
      objects: gameConfig.gameObjects || [],
      score: {},
      timeRemaining: 300, // 5 minutes default
      gameStatus: 'waiting',
    }

    this.setupCanvas()
  }

  private setupCanvas() {
    this.canvas.width = 800
    this.canvas.height = 600
    this.ctx.imageSmoothingEnabled = true
  }

  // Main game loop
  start() {
    this.gameState.gameStatus = 'active'
    this.lastFrameTime = performance.now()
    this.gameLoop()
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.gameState.gameStatus = 'completed'
  }

  private gameLoop = () => {
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime

    if (deltaTime >= this.FRAME_DURATION) {
      this.update(deltaTime / 1000) // Convert to seconds
      this.render()
      this.lastFrameTime = currentTime - (deltaTime % this.FRAME_DURATION)
    }

    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  // Update game state
  private update(deltaTime: number) {
    if (this.gameState.gameStatus !== 'active') return

    // Update time
    this.gameState.timeRemaining -= deltaTime
    if (this.gameState.timeRemaining <= 0) {
      this.stop()
      return
    }

    // Update players
    this.gameState.players.forEach((player) => {
      this.updatePlayer(player, deltaTime)
    })

    // Update objects with physics
    this.gameState.objects.forEach((obj) => {
      if (obj.physics?.enabled) {
        this.applyPhysics(obj, deltaTime)
      }
    })

    // Check collisions
    this.checkCollisions()

    // Execute custom game code
    this.executeGameCode()
  }

  private updatePlayer(player: Player, deltaTime: number) {
    const speed = 200 // pixels per second

    // Handle input
    if (player.inputs.up) player.y -= speed * deltaTime
    if (player.inputs.down) player.y += speed * deltaTime
    if (player.inputs.left) player.x -= speed * deltaTime
    if (player.inputs.right) player.x += speed * deltaTime

    // Boundary checking
    player.x = Math.max(0, Math.min(this.canvas.width - player.width, player.x))
    player.y = Math.max(0, Math.min(this.canvas.height - player.height, player.y))
  }

  private applyPhysics(obj: GameObject, deltaTime: number) {
    if (!obj.physics) return

    const gravity = this.gameConfig.physics?.gravity || 9.8
    const friction = obj.physics.friction || 0.1

    // Apply gravity
    obj.velocityY += gravity * deltaTime

    // Apply friction
    obj.velocityX *= (1 - friction * deltaTime)
    obj.velocityY *= (1 - friction * deltaTime)

    // Update position
    obj.x += obj.velocityX * deltaTime
    obj.y += obj.velocityY * deltaTime

    // Boundary collision
    if (obj.y + obj.height >= this.canvas.height) {
      obj.y = this.canvas.height - obj.height
      obj.velocityY = -obj.velocityY * 0.5 // Bounce with energy loss
    }

    if (obj.x <= 0 || obj.x + obj.width >= this.canvas.width) {
      obj.velocityX = -obj.velocityX * 0.5
    }
  }

  private checkCollisions() {
    this.gameState.players.forEach((player) => {
      // Check player-object collisions
      this.gameState.objects.forEach((obj) => {
        if (this.isColliding(player, obj)) {
          this.handleCollision(player, obj)
        }
      })

      // Check player-player collisions
      this.gameState.players.forEach((otherPlayer) => {
        if (player.id !== otherPlayer.id && this.isColliding(player, otherPlayer)) {
          this.handlePlayerCollision(player, otherPlayer)
        }
      })
    })
  }

  private isColliding(a: any, b: any): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  private handleCollision(player: Player, obj: GameObject) {
    // Example: Collecting items, damaging obstacles, etc.
    if (obj.type === 'collectible') {
      player.score += 10
      this.gameState.score[player.id] = (this.gameState.score[player.id] || 0) + 10
    } else if (obj.type === 'obstacle') {
      player.health = Math.max(0, player.health - 10)
    }
  }

  private handlePlayerCollision(player1: Player, player2: Player) {
    // Simple push-back collision response
    const dx = player2.x - player1.x
    const dy = player2.y - player1.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 0) {
      const pushForce = 2
      player1.x -= (dx / distance) * pushForce
      player1.y -= (dy / distance) * pushForce
      player2.x += (dx / distance) * pushForce
      player2.y += (dy / distance) * pushForce
    }
  }

  private executeGameCode() {
    // Execute custom game code from gameConfig
    if (this.gameConfig.code) {
      try {
        // Create a safe execution context
        const gameContext = {
          players: this.gameState.players,
          objects: this.gameState.objects,
          score: this.gameState.score,
          canvas: this.canvas,
          ctx: this.ctx,
        }

        // Note: In production, use a safer method like Web Workers
        // or sandboxed evaluation
      } catch (error) {
        console.error('Error executing game code:', error)
      }
    }
  }

  // Render game
  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1f2937'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Render objects
    this.gameState.objects.forEach((obj) => {
      this.ctx.fillStyle = obj.color
      this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
    })

    // Render players
    this.gameState.players.forEach((player) => {
      // Player body
      this.ctx.fillStyle = player.color
      this.ctx.fillRect(player.x, player.y, player.width, player.height)

      // Player name
      this.ctx.fillStyle = '#ffffff'
      this.ctx.font = '12px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(player.username, player.x + player.width / 2, player.y - 5)

      // Health bar
      const healthBarWidth = player.width
      const healthBarHeight = 4
      this.ctx.fillStyle = '#ef4444'
      this.ctx.fillRect(player.x, player.y - 15, healthBarWidth, healthBarHeight)
      this.ctx.fillStyle = '#22c55e'
      this.ctx.fillRect(
        player.x,
        player.y - 15,
        healthBarWidth * (player.health / 100),
        healthBarHeight
      )
    })

    // Render UI
    this.renderUI()
  }

  private renderUI() {
    // Time remaining
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 20px Arial'
    this.ctx.textAlign = 'left'
    const minutes = Math.floor(this.gameState.timeRemaining / 60)
    const seconds = Math.floor(this.gameState.timeRemaining % 60)
    this.ctx.fillText(
      `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      10,
      30
    )

    // Player count
    this.ctx.fillText(
      `Players: ${this.gameState.players.size}`,
      10,
      60
    )

    // Leaderboard
    const sortedPlayers = Array.from(this.gameState.players.values()).sort(
      (a, b) => b.score - a.score
    )

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(this.canvas.width - 210, 10, 200, 150)

    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 16px Arial'
    this.ctx.fillText('Leaderboard', this.canvas.width - 110, 35)

    this.ctx.font = '14px Arial'
    sortedPlayers.slice(0, 5).forEach((player, index) => {
      const y = 60 + index * 25
      this.ctx.fillText(
        `${index + 1}. ${player.username}: ${player.score}`,
        this.canvas.width - 200,
        y
      )
    })
  }

  // Player management
  addPlayer(id: string, username: string) {
    const player: Player = {
      id,
      username,
      x: Math.random() * (this.canvas.width - 40),
      y: Math.random() * (this.canvas.height - 40),
      width: 40,
      height: 40,
      health: 100,
      score: 0,
      color: this.getRandomColor(),
      inputs: {
        up: false,
        down: false,
        left: false,
        right: false,
        action: false,
      },
    }

    this.gameState.players.set(id, player)
    this.gameState.score[id] = 0
  }

  removePlayer(id: string) {
    this.gameState.players.delete(id)
    delete this.gameState.score[id]
  }

  updatePlayerInput(id: string, inputs: Partial<Player['inputs']>) {
    const player = this.gameState.players.get(id)
    if (player) {
      player.inputs = { ...player.inputs, ...inputs }
    }
  }

  // Utility methods
  private getRandomColor(): string {
    const colors = [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#84cc16',
      '#22c55e',
      '#06b6d4',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  getGameState(): GameState {
    return this.gameState
  }

  getWinner(): Player | null {
    if (this.gameState.players.size === 0) return null

    const sortedPlayers = Array.from(this.gameState.players.values()).sort(
      (a, b) => b.score - a.score
    )

    return sortedPlayers[0]
  }

  getLeaderboard(): Player[] {
    return Array.from(this.gameState.players.values()).sort(
      (a, b) => b.score - a.score
    )
  }

  // Event handlers
  handleKeyDown(key: string, playerId: string) {
    const player = this.gameState.players.get(playerId)
    if (!player) return

    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        player.inputs.up = true
        break
      case 's':
      case 'arrowdown':
        player.inputs.down = true
        break
      case 'a':
      case 'arrowleft':
        player.inputs.left = true
        break
      case 'd':
      case 'arrowright':
        player.inputs.right = true
        break
      case ' ':
      case 'space':
        player.inputs.action = true
        break
    }
  }

  handleKeyUp(key: string, playerId: string) {
    const player = this.gameState.players.get(playerId)
    if (!player) return

    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        player.inputs.up = false
        break
      case 's':
      case 'arrowdown':
        player.inputs.down = false
        break
      case 'a':
      case 'arrowleft':
        player.inputs.left = false
        break
      case 'd':
      case 'arrowright':
        player.inputs.right = false
        break
      case ' ':
      case 'space':
        player.inputs.action = false
        break
    }
  }

  // Cleanup
  destroy() {
    this.stop()
    this.gameState.players.clear()
    this.gameState.objects = []
  }
}

export default GameEngine
