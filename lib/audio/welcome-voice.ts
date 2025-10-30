/**
 * El Dorado Voice Announcer System
 * Plays the two-part dramatic sequence:
 *  - "WELCOME..."  (at ~1.0s)
 *  - "TO EL DORADO" (at ~2.5s)
 *
 * Uses Web Speech API and a short oscillator thunder for drama.
 * This file exposes a class with methods to play the sequence.
 */

export class ElDoradoVoice {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  private playRumble(duration = 800) {
    if (!this.audioContext) return
    const now = this.audioContext.currentTime
    const o = this.audioContext.createOscillator()
    const g = this.audioContext.createGain()

    o.type = 'sine'
    o.frequency.setValueAtTime(50, now)
    o.frequency.exponentialRampToValueAtTime(20, now + duration / 1000)

    g.gain.setValueAtTime(0.28, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000)

    o.connect(g)
    g.connect(this.audioContext.destination)

    o.start()
    o.stop(now + duration / 1000)
  }

  /**
   * Plays the cinematic two-line voice announcement sequence.
   * Sequence timings:
   *  1.0s -> "WELCOME..."   (utterance 1)
   *  2.5s -> "TO EL DORADO" (utterance 2)
   */
  playWelcomeSequence() {
    if (typeof window === 'undefined') return

    // Attempt to resume audio context (autoplay policy)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {})
    }

    // schedule rumble slightly before speech for impact
    setTimeout(() => this.playRumble(700), 500) // thunder rumble start at ~0.5s

    // First utterance "WELCOME..."
    setTimeout(() => {
      this.speak('WELCOME...', { pitch: 0.09, rate: 0.7 })
    }, 1000)

    // Second utterance "TO EL DORADO"
    setTimeout(() => {
      this.speak('TO EL DORADO', { pitch: 0.08, rate: 0.65 })
    }, 2500)
  }

  speak(text: string, options?: { pitch?: number; rate?: number }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    // cancel any running speech
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.pitch = options?.pitch ?? 0.15
    utterance.rate = options?.rate ?? 0.8
    utterance.volume = 1.0
    utterance.lang = 'en-US'

    // try to pick a deeper male voice if available
    const voices = window.speechSynthesis.getVoices()
    let deepVoice = voices.find(v => /male|alex|daniel|fred|deep/i.test(v.name)) || voices.find(v => /en-US/i.test(v.lang))
    if (!deepVoice && voices.length > 0) deepVoice = voices[0]

    if (deepVoice) utterance.voice = deepVoice

    // If no voices loaded yet, wait for onvoiceschanged
    if (!voices || voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis.speak(utterance)
    }
  }

  // small helpers for other announcements
  announce(text: string) {
    this.speak(text, { pitch: 0.18, rate: 0.8 })
  }
}

export function getVoiceAnnouncer() {
  return new ElDoradoVoice()
}

export default getVoiceAnnouncer
