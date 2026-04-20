import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, spring } from 'remotion'
import { loadFont } from '@remotion/google-fonts/BebasNeue'
import { loadFont as loadRobotoMono } from '@remotion/google-fonts/RobotoMono'
import type { LyricsDocument, WordTimestamp } from '#/lib/rap-types'

const { fontFamily: bebasNeue } = loadFont()
const { fontFamily: robotoMono } = loadRobotoMono()

export interface RapVideoProps {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  durationInFrames: number
  fps: number
  audioSrc?: string
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

interface LineWithWords {
  text: string
  words: WordTimestamp[]
  startTime: number
  endTime: number
}

// Remove emotion tags from text for display
function stripEmotionTags(text: string): string {
  return text.replace(/\[(sad|angry|happily|excited|calm|serious|whispers|shouts|slow|fast|laughs|sighs|gasp|emphasis|dramatic|sorrowful|clears throat|silence|long_pause|break)\]/gi, '').trim()
}

function groupWordsIntoLines(
  lyrics: LyricsDocument,
  wordTimestamps: WordTimestamp[],
): LineWithWords[] {
  const lines: LineWithWords[] = []
  let tsIndex = 0

  for (const section of lyrics.sections) {
    for (const line of section.lines) {
      const lineWords: WordTimestamp[] = []
      for (let i = 0; i < line.words.length && tsIndex < wordTimestamps.length; i++) {
        // Skip words that are emotion tags
        const word = line.words[i]
        if (!/^\[(sad|angry|happily|excited|calm|serious|whispers|shouts|slow|fast|laughs|sighs|gasp|emphasis|dramatic|sorrowful|clears throat|silence|long_pause|break)\]$/i.test(word)) {
          lineWords.push(wordTimestamps[tsIndex++])
        }
      }
      if (lineWords.length > 0) {
        lines.push({
          text: stripEmotionTags(line.text),
          words: lineWords,
          startTime: lineWords[0].startTime,
          endTime: lineWords[lineWords.length - 1].endTime,
        })
      }
    }
  }

  return lines
}

function getVisibleLines(
  lines: LineWithWords[],
  currentFrame: number,
  fps: number,
): LineWithWords[] {
  const currentTime = currentFrame / fps
  return lines.filter(
    (line) => line.startTime <= currentTime && currentTime < line.endTime,
  )
}

// ─── Styled word with better animation ────────────────────────────────────────

function AnimatedWord({ wt, frame, fps }: {
  wt: WordTimestamp
  frame: number
  fps: number
}) {
  const currentTime = frame / fps
  const isActive = wt.startTime <= currentTime && currentTime < wt.endTime
  const isPast = currentTime >= wt.endTime
  
  // Clean the word from any emotion tags
  const cleanWord = stripEmotionTags(wt.word)

  // Spring animation for active word
  const scale = isActive ? spring({
    frame: frame - (wt.startTime * fps),
    fps,
    config: {
      damping: 200,
      stiffness: 200,
      mass: 0.5,
    },
  }) : isPast ? 1 : 0.95

  // Rotation effect for active word
  const rotation = isActive ? Math.sin(frame * 0.1) * 2 : 0

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: bebasNeue,
        fontSize: isActive ? 72 : 56,
        color: isActive ? '#facc15' : isPast ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        margin: '0 12px',
        lineHeight: 1.4,
        letterSpacing: '0.02em',
        fontWeight: isActive ? 900 : 700,
        textShadow: isActive 
          ? `0 0 30px #facc1580, 0 0 60px #facc1540, 0 4px 20px rgba(0,0,0,0.5)` 
          : isPast 
          ? '0 2px 10px rgba(0,0,0,0.3)'
          : 'none',
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transition: 'font-size 0.2s ease-out, color 0.2s ease-out',
        filter: isActive ? 'brightness(1.2)' : 'brightness(1)',
      }}
    >
      {cleanWord}
    </span>
  )
}

// ─── Animated background particles ────────────────────────────────────────────

function BackgroundParticles({ frame }: { frame: number }) {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = (i * 50 + frame * 0.5) % 1080
    const y = (Math.sin(frame * 0.02 + i) * 200 + 540)
    const size = 4 + Math.sin(frame * 0.05 + i) * 2
    const opacity = 0.1 + Math.sin(frame * 0.03 + i) * 0.05
    
    return { x, y, size, opacity }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: '#facc15',
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px #facc15`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Pulsing circle behind active word ───────────────────────────────────────

function PulsingCircle({ frame }: { frame: number }) {
  const scale = 1 + Math.sin(frame * 0.15) * 0.2
  const opacity = 0.15 + Math.sin(frame * 0.1) * 0.05

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 400,
        height: 400,
        marginLeft: -200,
        marginTop: -200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #facc1540 0%, transparent 70%)',
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Enhanced audio bars ──────────────────────────────────────────────────────

function AudioBars({ frame, fps }: { frame: number; fps: number }) {
  const bars = Array.from({ length: 60 }, (_, i) => {
    const time = frame / fps
    const baseHeight = 20
    const wave1 = Math.sin(time * 4 + i * 0.4) * 30
    const wave2 = Math.cos(time * 3 + i * 0.25) * 20
    const wave3 = Math.sin(time * 5 + i * 0.15) * 15
    const height = baseHeight + wave1 + wave2 + wave3
    return Math.max(10, Math.min(80, height))
  })

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 3,
        height: 100,
        opacity: 0.7,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: h,
            background: `linear-gradient(to top, #facc15, #fbbf24, #f59e0b)`,
            borderRadius: '4px 4px 0 0',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.4)',
          }}
        />
      ))}
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

  const lines = groupWordsIntoLines(lyrics, wordTimestamps)
  const visibleLines = getVisibleLines(lines, frame, fps)

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>

      {/* Animated background */}
      <BackgroundParticles frame={frame} />

      {/* Pulsing circle */}
      <PulsingCircle frame={frame} />

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, #facc1515 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Audio */}
      {audioSrc && <Audio src={audioSrc} />}

      {/* Lyrics — centered with better spacing */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 100px',
          gap: 24,
        }}
      >
        {visibleLines.length > 0 ? (
          visibleLines.map((line, li) => (
            <div
              key={`${line.startTime}-${li}`}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: 900,
              }}
            >
              {line.words.map((wt, i) => (
                <AnimatedWord
                  key={`${wt.word}-${i}`}
                  wt={wt}
                  frame={frame}
                  fps={fps}
                />
              ))}
            </div>
          ))
        ) : null}
      </AbsoluteFill>

      {/* Audio bars */}
      <AudioBars frame={frame} fps={fps} />

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: robotoMono,
          fontSize: 14,
          color: 'rgba(250,204,21,0.3)',
          letterSpacing: 6,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        BARS.AI
      </div>
    </AbsoluteFill>
  )
}
