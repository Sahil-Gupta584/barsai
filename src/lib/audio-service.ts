import { env } from '#/env'
import {
  type AudioResult,
  type WordTimestamp,
  AudioSynthesisError,
} from './rap-types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fallback: evenly distribute words across the audio duration.
 */
function distributeWordsEvenly(
  words: string[],
  durationSeconds: number,
): WordTimestamp[] {
  if (words.length === 0) return []
  const interval = durationSeconds / words.length
  return words.map((word, i) => ({
    word,
    startTime: i * interval,
    endTime: (i + 1) * interval,
    confidence: 0.5,
  }))
}

/**
 * Convert ElevenLabs character-level alignment to word-level timestamps.
 * ElevenLabs returns arrays: characters[], character_start_times_seconds[], character_end_times_seconds[]
 */
function parseCharacterAlignment(
  // biome-ignore lint/suspicious/noExplicitAny: ElevenLabs alignment shape varies
  alignment: any,
): WordTimestamp[] {
  if (!alignment) return []

  const chars: string[] = alignment.characters ?? []
  const starts: number[] = alignment.character_start_times_seconds ?? []
  const ends: number[] = alignment.character_end_times_seconds ?? []

  if (chars.length === 0) return []

  const timestamps: WordTimestamp[] = []
  let wordChars = ''
  let wordStartTime = 0

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const isSpace = ch === ' ' || ch === '\n'
    const isLast = i === chars.length - 1

    if (!isSpace) {
      if (wordChars === '') {
        wordStartTime = starts[i] ?? 0
      }
      wordChars += ch
    }

    if ((isSpace || isLast) && wordChars.trim()) {
      timestamps.push({
        word: wordChars.trim(),
        startTime: wordStartTime,
        endTime: ends[isLast && !isSpace ? i : i - 1] ?? wordStartTime + 0.3,
        confidence: 1,
      })
      wordChars = ''
    }
  }

  return timestamps.sort((a, b) => a.startTime - b.startTime)
}

// ─── Service ──────────────────────────────────────────────────────────────────

class AudioService {
  private apiKey: string
  private voiceId: string

  constructor(apiKey: string, voiceId: string) {
    this.apiKey = apiKey
    this.voiceId = voiceId
  }

  async synthesize(text: string): Promise<AudioResult> {
    console.log('a');
    
    if (!text.trim()) {
      throw new AudioSynthesisError('Cannot synthesize empty text')
    }
    console.log('b');
    
    try {
      // Use the with-timestamps endpoint directly via fetch
      // (avoids SDK version issues while @elevenlabs/elevenlabs-js installs)
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/with-timestamps`
      console.log('c');

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_v3', // Changed to v3 for audio tags support
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      })
      console.log('d');
      
      if (!res.ok) {
        const errText = await res.text()
        throw new AudioSynthesisError(
          `ElevenLabs API error ${res.status}: ${errText}`,
        )
      }
      console.log('e');

      const data = await res.json() as {
        audio_base64?: string
        alignment?: {
          characters?: string[]
          character_start_times_seconds?: number[]
          character_end_times_seconds?: number[]
        }
      }
      if (!data.audio_base64) {
        throw new AudioSynthesisError('ElevenLabs returned no audio data')
      }

      const audioBuffer = Buffer.from(data.audio_base64, 'base64')

      // Parse word timestamps from character alignment
      let wordTimestamps = parseCharacterAlignment(data.alignment)

      // Fallback if parsing yielded nothing
      if (wordTimestamps.length === 0) {
        const words = text.trim().split(/\s+/).filter(Boolean)
        const estimatedDuration = words.length * 0.35
        wordTimestamps = distributeWordsEvenly(words, estimatedDuration)
      }

      const durationSeconds =
        wordTimestamps[wordTimestamps.length - 1]?.endTime ?? 30

      return { audioBuffer, wordTimestamps, durationSeconds }
    } catch (err) {
      if (err instanceof AudioSynthesisError) throw err
      throw new AudioSynthesisError(
        `ElevenLabs error: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
}

let _instance: AudioService | null = null

export function getAudioService(): AudioService {
  if (!_instance) {
    _instance = new AudioService(env.ELEVENLABS_API_KEY, env.ELEVENLABS_VOICE_ID)
  }
  return _instance
}
