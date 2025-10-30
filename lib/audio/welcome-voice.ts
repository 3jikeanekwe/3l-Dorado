/**
 * El Dorado Voice Announcer System
 * Deep, powerful voice like Mortal Kombat
 * PLAYS EVERY TIME - No session storage
 */

export class ElDoradoVoice {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Play "WELCOME TO EL DORADO" with deep voice
   * Uses Web Speech API with deep pitch
   * REMOVED: hasPlayed check - now plays EVERY TIME
   */
  playWelcome() {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance('WELCOME... TO EL DORADO')
      
      // Deep voice settings
      utterance.pitch = 0.1 // Very low pitch (0-2, lower = deeper)
      utterance.rate = 0.7 // Slower speech rate (0.1-10)
      utterance.volume = 1.0 // Full volume
      utterance.lang = 'en-US'

      // Try to find a deep male voice
      const voices = window.speechSynthesis.getVoices()
      const deepVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('Deep') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Alex')
      ) || voices[0]

      if (deepVoice) {
        utterance.voice = deepVoice
      }

      // Add dramatic pauses
      utterance.onstart = () => {
        this.playDramaticSound()
      }

      // Wait for voices to load
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.speak(utterance)
        }
      } else {
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  /**
   * Play announcement for different events
   */
  announce(text: string, options?: { pitch?: number; rate?: number }) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.pitch = options?.pitch ?? 0.2
      utterance.rate = options?.rate ?? 0.8
      utterance.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      const deepVoice = voices.find(voice => voice.name.includes('Male')) || voices[0]
      if (deepVoice) utterance.voice = deepVoice

      window.speechSynthesis.speak(utterance)
    }
  }

  /**
   * Dramatic thunder/gong sound effect
   */
  private playDramaticSound() {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Deep thunder rumble
    oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      20,
      this.audioContext.currentTime + 0.5
    )

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.5
    )

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.5)
  }

  /**
   * Victory announcement
   */
  announceVictory(playerName: string) {
    this.announce(`${playerName} WINS! FLAWLESS VICTORY!`, { pitch: 0.15, rate: 0.6 })
    this.playVictoryFanfare()
  }

  /**
   * Game start announcement
   */
  announceGameStart() {
    this.announce('FIGHT!', { pitch: 0.1, rate: 0.5 })
  }

  /**
   * Game over announcement
   */
  announceGameOver() {
    this.announce('GAME OVER', { pitch: 0.15, rate: 0.7 })
  }

  /**
   * Victory fanfare sound
   */
  private playVictoryFanfare() {
    if (!this.audioContext) return

    const notes = [261.63, 329.63, 392.00, 523.25] // C, E, G, C (major chord)
    
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator()
        const gainNode = this.audioContext!.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext!.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.2, this.audioContext!.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext!.currentTime + 0.3
        )

        oscillator.start()
        oscillator.stop(this.audioContext!.currentTime + 0.3)
      }, index * 100)
    })
  }
}

// Create NEW instance every time (no singleton caching)
export function getVoiceAnnouncer(): ElDoradoVoice {
  return new ElDoradoVoice()
}

export default getVoiceAnnouncer
