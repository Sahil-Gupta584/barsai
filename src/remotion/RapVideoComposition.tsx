import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { Audio } from '@remotion/media'
import type { LyricsDocument, StylePreset, WordTimestamp } from '#/lib/rap-types'
import { getWordAnimationStyle } from './animations'

export interface RapVideoProps {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  durationInFrames: number
  fps: number
  audioSrc?: string
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

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

function getWordProgress(wt: WordTimestamp, currentFrame: number, fps: number): number {
  const currentTime = currentFrame / fps
  const duration = wt.endTime - wt.startTime
  if (duration <= 0) return 1
  return Math.max(0, Math.min(1, (currentTime - wt.startTime) / duration))
}

// ─── Styled word ──────────────────────────────────────────────────────────────

function AnimatedWord({ wt, preset, frame, fps }: {
  wt: WordTimestamp
  preset: StylePreset
  frame: number
  fps: number
}) {
  const progress = getWordProgress(wt, frame, fps)
  const animStyle = getWordAnimationStyle(preset.animation, progress)

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: "'Bebas Neue', Impact, sans-serif",
        fontSize: preset.fontSize,
        color: preset.color,
        textTransform: 'uppercase',
        margin: '0 6px',
        lineHeight: 1,
        letterSpacing: '0.05em',
        ...animStyle,
      }}
    >
      {wt.word}
    </span>
  )
}

// ─── Grid overlay (matches landing page aesthetic) ────────────────────────────

function GridOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Section badge ────────────────────────────────────────────────────────────

function SectionBadge({ type }: { type: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: "'Space Mono', monospace",
        fontSize: 16,
        color: 'rgba(250,204,21,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 8,
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
  const currentTime = frame / fps

  // Find current section
  const currentSection = (() => {
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
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>

      {/* Grid */}
      <GridOverlay />

      {/* Radial glow — color shifts per section */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${preset?.accentColor ?? '#facc15'}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Section badge */}
      {currentSection && <SectionBadge type={currentSection.type} />}

      {/* Audio */}
      {audioSrc && <Audio src={audioSrc} />}

      {/* Lyrics */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px',
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
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#facc15',
              opacity: 0.3,
            }}
          />
        )}
      </div>

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: "'Space Mono', monospace",
          fontSize: 14,
          color: 'rgba(250,204,21,0.2)',
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}
      >
        BARS.AI
      </div>
    </AbsoluteFill>
  )
}
