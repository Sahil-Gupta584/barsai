import { AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import type { LyricsDocument, StylePreset, WordTimestamp } from '#/lib/rap-types'
import { getWordAnimationStyle } from './animations'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RapVideoProps {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  durationInFrames: number
  fps: number
  audioSrc?: string // path to audio file for Remotion Audio component
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Returns words that should be visible at the given frame.
 * Pure function — same inputs always produce same output.
 */
export function getVisibleWords(
  wordTimestamps: WordTimestamp[],
  currentFrame: number,
  fps: number,
): WordTimestamp[] {
  const currentTime = currentFrame / fps
  return wordTimestamps.filter(
    (wt) => wt.startTime <= currentTime && currentTime < wt.endTime,
  )
}

/**
 * Compute animation progress (0–1) for a word at the current frame.
 */
function getWordProgress(wt: WordTimestamp, currentFrame: number, fps: number): number {
  const currentTime = currentFrame / fps
  const duration = wt.endTime - wt.startTime
  if (duration <= 0) return 1
  return Math.max(0, Math.min(1, (currentTime - wt.startTime) / duration))
}

// ─── Word component ───────────────────────────────────────────────────────────

interface WordProps {
  wt: WordTimestamp
  preset: StylePreset
  frame: number
  fps: number
}

function AnimatedWord({ wt, preset, frame, fps }: WordProps) {
  const progress = getWordProgress(wt, frame, fps)
  const animStyle = getWordAnimationStyle(preset.animation, progress)

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        color: preset.color,
        textTransform: preset.textTransform,
        margin: '0 8px',
        lineHeight: 1.1,
        ...animStyle,
      }}
    >
      {wt.word}
    </span>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ type }: { type: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: 'Impact, sans-serif',
        fontSize: 24,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 6,
      }}
    >
      {type}
    </div>
  )
}

// ─── Main composition ─────────────────────────────────────────────────────────

export function RapVideoComposition({
  lyrics,
  wordTimestamps,
  audioSrc,
}: RapVideoProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const visibleWords = getVisibleWords(wordTimestamps, frame, fps)

  // Determine which section we're in based on current time
  const currentTime = frame / fps
  const currentSection = (() => {
    // Build a map of word → section
    for (const section of lyrics.sections) {
      const sectionWords = section.lines.flatMap((l) => l.words)
      for (const wt of wordTimestamps) {
        if (
          sectionWords.includes(wt.word) &&
          wt.startTime <= currentTime &&
          currentTime < wt.endTime
        ) {
          return section
        }
      }
    }
    return lyrics.sections[0]
  })()

  const preset = currentSection?.stylePreset ?? lyrics.sections[0]?.stylePreset

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background gradient that pulses */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${preset?.accentColor ?? '#111'}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Section label */}
      {currentSection && <SectionLabel type={currentSection.type} />}

      {/* Audio */}
      {audioSrc && <Audio src={audioSrc} />}

      {/* Lyrics display area */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 60px',
          maxWidth: '100%',
          textAlign: 'center',
          minHeight: 200,
        }}
      >
        {visibleWords.length > 0 ? (
          visibleWords.map((wt, i) => (
            <AnimatedWord
              // biome-ignore lint/suspicious/noArrayIndexKey: stable within frame
              key={`${wt.word}-${i}`}
              wt={wt}
              preset={preset}
              frame={frame}
              fps={fps}
            />
          ))
        ) : (
          // Show a subtle beat indicator when no words are visible
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: preset?.accentColor ?? '#333',
              opacity: 0.4,
            }}
          />
        )}
      </div>

      {/* Bottom topic watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: 18,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: 2,
        }}
      >
        rippy.app
      </div>
    </AbsoluteFill>
  )
}
