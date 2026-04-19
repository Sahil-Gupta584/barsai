// ─── Section & Animation Types ───────────────────────────────────────────────

export type SectionType = 'hook' | 'verse' | 'bridge' | 'outro'
export type AnimationType = 'pop' | 'slide' | 'shake' | 'glow'

// ─── Lyrics ──────────────────────────────────────────────────────────────────

export interface LyricsLine {
  text: string
  words: string[]
}

export interface LyricsSection {
  type: SectionType
  lines: LyricsLine[]
  stylePreset: StylePreset
}

export interface LyricsDocument {
  topic: string
  sections: LyricsSection[]
  fullText: string
}

// ─── Audio ───────────────────────────────────────────────────────────────────

export interface WordTimestamp {
  word: string
  startTime: number // seconds from audio start
  endTime: number // seconds
  confidence: number // 0–1
}

export interface AudioResult {
  audioBuffer: Buffer
  wordTimestamps: WordTimestamp[]
  durationSeconds: number
}

// ─── Style Presets ───────────────────────────────────────────────────────────

export interface StylePreset {
  id: string
  fontFamily: string
  color: string
  accentColor: string
  animation: AnimationType
  fontSize: number
  textTransform: 'uppercase' | 'none'
}

export const STYLE_PRESETS: Record<SectionType, StylePreset> = {
  hook: {
    id: 'hook',
    fontFamily: 'Impact, "Arial Black", sans-serif',
    color: '#FFD700',
    accentColor: '#FF6B00',
    animation: 'pop',
    fontSize: 72,
    textTransform: 'uppercase',
  },
  verse: {
    id: 'verse',
    fontFamily: '"Bebas Neue", Impact, sans-serif',
    color: '#FFFFFF',
    accentColor: '#00D4FF',
    animation: 'slide',
    fontSize: 60,
    textTransform: 'uppercase',
  },
  bridge: {
    id: 'bridge',
    fontFamily: '"Montserrat", "Arial", sans-serif',
    color: '#FF4ECD',
    accentColor: '#FF4ECD',
    animation: 'glow',
    fontSize: 56,
    textTransform: 'none',
  },
  outro: {
    id: 'outro',
    fontFamily: 'Impact, "Arial Black", sans-serif',
    color: '#A8FF78',
    accentColor: '#78FFD6',
    animation: 'shake',
    fontSize: 64,
    textTransform: 'uppercase',
  },
}

// ─── Render ───────────────────────────────────────────────────────────────────

export interface RenderInput {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  audioBuffer: Buffer
  outputPath: string
}

// ─── Custom Errors ────────────────────────────────────────────────────────────

export class LyricsGenerationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LyricsGenerationError'
  }
}

export class AudioSynthesisError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AudioSynthesisError'
  }
}

export class RenderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RenderError'
  }
}
