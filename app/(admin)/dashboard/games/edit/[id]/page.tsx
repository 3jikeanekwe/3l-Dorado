'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react'

type Tab = 'visual' | 'code' | 'assets' | 'settings'

export default function EditGamePage() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.id as string
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<Tab>('settings')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Game data
  const [gameName, setGameName] = useState('')
  const [description, setDescription] = useState('')
  const [minPlayers, setMinPlayers] = useState(2)
  const [maxPlayers, setMaxPlayers] = useState(32)
  const [gameCode, setGameCode] = useState('')
  const [sprites, setSprites] = useState<any[]>([])
  const [gameObjects, setGameObjects] = useState<any[]>([])
  const [selectedObject, setSelectedObject] = useState<any>(null)

  useEffect(() => {
    fetchGame()
  }, [gameId, supabase])

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (error) throw error

      setGameName(data.name)
      setDescription(data.description || '')
      setMinPlayers(data.min_players)
      setMaxPlayers(data.max_players)
      
      if (data.game_config) {
        setGameCode(data.game_config.code || '')
        setSprites(data.game_config.sprites || [])
        setGameObjects(data.game_config.gameObjects || [])
      }
    } catch (error) {
      console.error('Error fetching game:', error)
      alert('Failed to load game')
      router.push('/dashboard/games')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGame = async () => {
    if (!gameName) {
      alert('Please enter a game name')
      return
    }

    setSaving(true)

    try {
      const gameConfig = {
        code: gameCode,
        sprites,
        gameObjects,
        physics: {
          gravity: 9.8,
          friction: 0.1,
        },
      }

      const { error } = await supabase
        .from('games')
        .update({
          name: gameName,
          description,
          min_players: minPlayers,
          max_players: maxPlayers,
          game_config: gameConfig,
        })
        .eq('id', gameId)

      if (error) throw error

      alert('Game updated successfully!')
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

  const handleDeleteSprite = (spriteId: string) => {
    setSprites(sprites.filter((s) => s.id !== spriteId))
  }

  const handleAddGameObject = () => {
    const newObject = {
      id: Date.now().toString(),
      name: `Object ${gameObjects.length + 1}`,
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      sprite: null,
      type: 'rectangle',
      color: '#3b82f6',
      physics: {
        enabled: true,
        mass: 1,
        friction: 0.5,
      },
    }
    setGameObjects([...gameObjects, newObject])
    setSelectedObject(newObject)
  }

  const handleDeleteObject = (objectId: string) => {
    setGameObjects(gameObjects.filter((obj) => obj.id !== objectId))
    if (selectedObject?.id === objectId) {
      setSelectedObject(null)
    }
  }

  const handleUpdateObject = (objectId: string, updates: any) => {
    setGameObjects(
      gameObjects.map((obj) =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      )
    )
    if (selectedObject?.id === objectId) {
      setSelectedObject({ ...selectedObject, ...updates })
    }
  }

  const tabs = [
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'visual' as Tab, label: 'Visual Editor', icon: Layers },
    { id: 'code' as Tab, label: 'Code Editor', icon: Code },
    { id: 'assets' as Tab, label: 'Assets', icon: Image },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/games')}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Game</h1>
            <p className="text-gray-400">{gameName || 'Untitled Game'}</p>
          </div>
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
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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
            </div>
          </div>
        )}

        {/* Visual Editor Tab */}
        {activeTab === 'visual' && (
          <div className="h-full flex">
            {/* Left Panel - Objects */}
            <div className="w-64 border-r border-gray-700 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Objects</h3>
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
                    onClick={() => setSelectedObject(obj)}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedObject?.id === obj.id
                        ? 'bg-yellow-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div>
                      <p className="text-white text-sm">{obj.name}</p>
                      <p className="text-xs text-gray-400">
                        {obj.width}x{obj.height}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteObject(obj.id)
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 p-8 overflow-auto bg-gray-900">
              <div className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 relative"
                   style={{ width: '800px', height: '600px' }}>
                {gameObjects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => setSelectedObject(obj)}
                    className={`absolute cursor-pointer transition ${
                      selectedObject?.id === obj.id ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    style={{
                      left: obj.x,
                      top: obj.y,
                      width: obj.width,
                      height: obj.height,
                      backgroundColor: obj.color,
                      borderRadius: '4px',
                    }}
                  >
                    <div className="text-xs text-white p-1">{obj.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Properties */}
            <div className="w-64 border-l border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-white font-bold mb-4">Properties</h3>
              {selectedObject ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={selectedObject.name}
                      onChange={(e) =>
                        handleUpdateObject(selectedObject.id, { name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        value={selectedObject.x}
                        onChange={(e) =>
                          handleUpdateObject(selectedObject.id, { x: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        value={selectedObject.y}
                        onChange={(e) =>
                          handleUpdateObject(selectedObject.id, { y: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Width</label>
                      <input
                        type="number"
                        value={selectedObject.width}
                        onChange={(e) =>
                          handleUpdateObject(selectedObject.id, { width: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Height</label>
                      <input
                        type="number"
                        value={selectedObject.height}
                        onChange={(e) =>
                          handleUpdateObject(selectedObject.id, { height: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedObject.color}
                      onChange={(e) =>
                        handleUpdateObject(selectedObject.id, { color: e.target.value })
                      }
                      className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select an object to edit</p>
              )}
            </div>
          </div>
        )}

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="h-full p-4">
            <div className="mb-4">
              <h3 className="text-white font-bold mb-2">Game Logic & Physics</h3>
              <p className="text-gray-400 text-sm">
                Write JavaScript code for game behavior, controls, and physics
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
              <h2 className="text-2xl font-bold text-white">Assets</h2>
              <button
                onClick={handleAddSprite}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-bold"
              >
                <Upload className="h-5 w-5" />
                <span>Add Asset</span>
              </button>
            </div>

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
                    onClick={() => handleDeleteSprite(sprite.id)}
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
