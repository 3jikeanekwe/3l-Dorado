'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Save, 
  Play, 
  Code, 
  Layers, 
  Image, 
  Settings,
  Upload,
  X,
  Plus
} from 'lucide-react'

type Tab = 'visual' | 'code' | 'assets' | 'settings'

export default function CreateGamePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<Tab>('settings')
  const [saving, setSaving] = useState(false)
  
  // Game basic info
  const [gameName, setGameName] = useState('')
  const [description, setDescription] = useState('')
  const [minPlayers, setMinPlayers] = useState(2)
  const [maxPlayers, setMaxPlayers] = useState(32)
  
  // Game config
  const [gameCode, setGameCode] = useState(`// Game initialization
function initGame() {
  console.log('Game started!');
  
  // Setup canvas
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // Game loop
  function gameLoop() {
    // Update game state
    update();
    
    // Render graphics
    render(ctx);
    
    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
}

function update() {
  // Update game logic here
}

function render(ctx) {
  // Render graphics here
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}`)

  const [sprites, setSprites] = useState<any[]>([])
  const [gameObjects, setGameObjects] = useState<any[]>([])

  const handleSaveGame = async () => {
    if (!gameName) {
      alert('Please enter a game name')
      return
    }

    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const gameConfig = {
        code: gameCode,
        sprites,
        gameObjects,
        physics: {
          gravity: 9.8,
          friction: 0.1,
        },
      }

      const { data, error } = await supabase
        .from('games')
        .insert({
          name: gameName,
          description,
          min_players: minPlayers,
          max_players: maxPlayers,
          created_by: session.user.id,
          game_config: gameConfig,
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error

      alert('Game created successfully!')
      router.push('/dashboard/games')
    } catch (error: any) {
      console.error('Error saving game:', error)
      alert('Failed to save game: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddSprite = () => {
    const spriteName = prompt('Enter sprite name:')
    if (!spriteName) return

    setSprites([
      ...sprites,
      {
        id: Date.now().toString(),
        name: spriteName,
        url: '',
        width: 32,
        height: 32,
      },
    ])
  }

  const handleAddGameObject = () => {
    setGameObjects([
      ...gameObjects,
      {
        id: Date.now().toString(),
        name: `Object ${gameObjects.length + 1}`,
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        sprite: null,
      },
    ])
  }

  const tabs = [
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'visual' as Tab, label: 'Visual Editor', icon: Layers },
    { id: 'code' as Tab, label: 'Code Editor', icon: Code },
    { id: 'assets' as Tab, label: 'Assets', icon: Image },
  ]

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Game</h1>
          <p className="text-gray-400">Build your game with visual editor + code</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            <Play className="h-5 w-5" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSaveGame}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Game'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition ${
                activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 h-[calc(100%-12rem)] overflow-auto">
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">Game Settings</h2>
            
            <div className="space-y-6">
              {/* Game Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game Name *
                </label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter game name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Describe your game..."
                />
              </div>

              {/* Player Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Players
                  </label>
                  <input
                    type="number"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(parseInt(e.target.value))}
                    min={1}
                    max={maxPlayers}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Players
                  </label>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    min={minPlayers}
                    max={100}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Game Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Game Type Template (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Battle Royale', desc: 'Last player standing wins' },
                    { name: 'Racing', desc: 'First to finish wins' },
                    { name: 'Arena Combat', desc: 'Team-based combat' },
                    { name: 'Custom', desc: 'Build from scratch' },
                  ].map((template) => (
                    <button
                      key={template.name}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-left border-2 border-transparent hover:border-yellow-400"
                    >
                      <p className="text-white font-semibold mb-1">{template.name}</p>
                      <p className="text-sm text-gray-400">{template.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Editor Tab */}
        {activeTab === 'visual' && (
          <div className="h-full flex">
            {/* Left Panel - Objects */}
            <div className="w-64 border-r border-gray-700 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Game Objects</h3>
                <button
                  onClick={handleAddGameObject}
                  className="p-1 bg-yellow-500 text-black rounded hover:bg-yellow-400"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {gameObjects.map((obj) => (
                  <div
                    key={obj.id}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
                  >
                    <p className="text-white text-sm">{obj.name}</p>
                    <p className="text-xs text-gray-400">
                      {obj.width}x{obj.height}
                    </p>
                  </div>
                ))}
                {gameObjects.length === 0 && (
                  <p className="text-gray-500 text-sm">No objects yet</p>
                )}
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 p-8 overflow-auto">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <Layers className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Visual game editor canvas</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Drag and drop objects here
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Properties */}
            <div className="w-64 border-l border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-white font-bold mb-4">Properties</h3>
              <p className="text-gray-500 text-sm">Select an object to edit</p>
            </div>
          </div>
        )}

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="h-full p-4">
            <div className="mb-4">
              <h3 className="text-white font-bold mb-2">Game Logic & Physics</h3>
              <p className="text-gray-400 text-sm">
                Write your game code here. Use JavaScript to define game behavior, physics, and logic.
              </p>
            </div>
            <textarea
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              className="w-full h-[calc(100%-6rem)] p-4 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Write your game code..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Assets Management</h2>
              <button
                onClick={handleAddSprite}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold"
              >
                <Upload className="h-5 w-5" />
                <span>Upload Asset</span>
              </button>
            </div>

            {/* Sprites Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sprites.map((sprite) => (
                <div
                  key={sprite.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer group relative"
                >
                  <div className="aspect-square bg-gray-800 rounded mb-2 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-white text-sm truncate">{sprite.name}</p>
                  <button
                    onClick={() => setSprites(sprites.filter((s) => s.id !== sprite.id))}
                    className="absolute top-2 right-2 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {sprites.length === 0 && (
              <div className="text-center py-16">
                <Image className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No assets uploaded</p>
                <p className="text-sm text-gray-500">
                  Upload sprites, images, and sounds for your game
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
        }
