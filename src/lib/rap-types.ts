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
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    color: '#facc15',       // yellow — primary accent
    accentColor: '#facc15',
    animation: 'pop',
    fontSize: 96,
    textTransform: 'uppercase',
  },
  verse: {
    id: 'verse',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    color: '#ffffff',       // white
    accentColor: '#facc15',
    animation: 'slide',
    fontSize: 80,
    textTransform: 'uppercase',
  },
  bridge: {
    id: 'bridge',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    color: '#facc15',
    accentColor: '#ff0055',
    animation: 'glow',
    fontSize: 72,
    textTransform: 'uppercase',
  },
  outro: {
    id: 'outro',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
    color: '#ffffff',
    accentColor: '#facc15',
    animation: 'shake',
    fontSize: 88,
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
