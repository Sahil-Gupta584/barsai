import { env } from '#/env'
import type { LyricsDocument } from './rap-types'

interface BeatLayer {
  type: 'kick' | 'snare' | 'hihat' | 'bass' | 'melody'
  audioBuffer: Buffer
  intensity: 'low' | 'medium' | 'high'
}

interface BeatStructure {
  hookBeat: Buffer  // High energy for hooks
  verseBeat: Buffer // Medium energy for verses
  punchlineBeat: Buffer // Extra punch for punchlines
}

// Analyze lyrics to identify punchlines and energy levels
function analyzeLyricsEnergy(lyrics: LyricsDocument): {
  hookLines: number[]
  punchlineWords: string[]
} {
  const punchlineIndicators = [
    'but', 'while', 'though', 'however', // Contrast words
    'crash', 'die', 'fail', 'broke', 'dead', // Impact words
    'king', 'god', 'master', 'genius', // Flex words
    '404', 'error', 'bug', 'null', // Tech punchlines
  ]

  const punchlineWords: string[] = []
  const hookLines: number[] = []

  lyrics.sections.forEach((section, sectionIdx) => {
    section.lines.forEach((line, lineIdx) => {
      // Hooks are always high energy
      if (section.type === 'hook') {
        hookLines.push(lineIdx)
      }

      // Check for punchline indicators
      const hasContrast = line.words.some(w => 
        punchlineIndicators.includes(w.toLowerCase())
      )
      
      // Last line of verse is usually a punchline
      const isLastLine = lineIdx === section.lines.length - 1

      if (hasContrast || isLastLine) {
        punchlineWords.push(...line.words)
      }
    })
  })

  return { hookLines, punchlineWords }
}

// Generate dynamic beats using ElevenLabs sound effects
export class BeatService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async generateSoundEffect(prompt: string, duration: number): Promise<Buffer> {
    const url = 'https://api.elevenlabs.io/v1/sound-generation'
    
    console.log('🎵 [BEAT-SERVICE] Calling ElevenLabs API...')
    console.log('🎵 [BEAT-SERVICE] URL:', url)
    console.log('🎵 [BEAT-SERVICE] Prompt:', prompt)
    console.log('🎵 [BEAT-SERVICE] Duration:', Math.min(duration, 22), 'seconds')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: Math.min(duration, 22), // Max 22 seconds for free tier
        prompt_influence: 0.8,
      }),
    })

    console.log('🎵 [BEAT-SERVICE] API Response status:', res.status)
    console.log('🎵 [BEAT-SERVICE] API Response ok?', res.ok)

    if (!res.ok) {
      const error = await res.text()
      console.error('❌ [BEAT-SERVICE] API Error:', error)
      throw new Error(`Sound generation failed: ${res.status} ${error}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('🎵 [BEAT-SERVICE] Received audio buffer, size:', buffer.length, 'bytes')
    return buffer
  }

  async generateDynamicBeats(
    lyrics: LyricsDocument,
    durationSeconds: number
  ): Promise<BeatStructure> {
    console.log('Analyzing lyrics for beat structure...')
    const analysis = analyzeLyricsEnergy(lyrics)
    
    console.log('Punchline words found:', analysis.punchlineWords.length)
    console.log('Hook lines:', analysis.hookLines.length)

    // Generate different beat layers
    const [hookBeat, verseBeat, punchlineBeat] = await Promise.all([
      // High energy for hooks - hard hitting
      this.generateSoundEffect(
        'Aggressive hip-hop drum beat with heavy 808 bass, hard kick, sharp snare, fast hi-hats, trap style, high energy, seamless loop',
        Math.min(durationSeconds / 2, 22)
      ),
      
      // Medium energy for verses - steady groove
      this.generateSoundEffect(
        'Smooth hip-hop drum beat with steady kick, light snare, rolling hi-hats, subtle bass, chill vibe, seamless loop',
        Math.min(durationSeconds / 2, 22)
      ),
      
      // Extra punch for punchlines - impact sound
      this.generateSoundEffect(
        'Heavy bass drop with sub-bass rumble, cinematic impact, short punchy hit with reverb tail',
        2 // Short impact sound
      ),
    ])

    console.log('Generated 3 beat layers:', {
      hookBeat: hookBeat.length,
      verseBeat: verseBeat.length,
      punchlineBeat: punchlineBeat.length,
    })

    return {
      hookBeat,
      verseBeat,
      punchlineBeat,
    }
  }

  // Simple approach: Generate one base beat
  async generateSimpleBeat(durationSeconds: number): Promise<Buffer> {
    console.log('🎵 [BEAT-SERVICE] Generating simple beat for', durationSeconds, 'seconds')
    console.log('🎵 [BEAT-SERVICE] API Key present?', this.apiKey ? 'YES' : 'NO')
    console.log('🎵 [BEAT-SERVICE] API Key length:', this.apiKey?.length || 0)
    
    const beat = await this.generateSoundEffect(
      'Hip-hop drum beat with 808 bass, kick, snare, hi-hats, trap style, energetic, seamless loop',
      Math.min(durationSeconds, 22)
    )
    
    console.log('🎵 [BEAT-SERVICE] Beat generated, size:', beat.length, 'bytes')
    return beat
  }
}

let _instance: BeatService | null = null

export function getBeatService(): BeatService {
  if (!_instance) {
    _instance = new BeatService(env.ELEVENLABS_API_KEY)
  }
  return _instance
}
