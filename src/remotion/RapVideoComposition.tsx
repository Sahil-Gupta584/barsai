import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, spring } from 'remotion'
import { loadFont as loadRobotoMono } from '@remotion/google-fonts/RobotoMono'
import { loadFont as loadOswald } from '@remotion/google-fonts/Oswald'
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue'
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton'
import { loadFont as loadRubikMonoOne } from '@remotion/google-fonts/RubikMonoOne'
import type { LyricsDocument, WordTimestamp } from '#/lib/rap-types'

const { fontFamily: robotoMono } = loadRobotoMono()
const { fontFamily: oswald } = loadOswald()
const { fontFamily: bebasNeue } = loadBebasNeue()
const { fontFamily: anton } = loadAnton()
const { fontFamily: rubikMonoOne } = loadRubikMonoOne()

// Array of fonts to cycle through for variety
const fonts = [oswald, bebasNeue, anton, rubikMonoOne]

export interface RapVideoProps {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  durationInFrames: number
  fps: number
  audioSrc?: string
  beatSrc?: string
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

// Remove emotion tags from text for display
function stripEmotionTags(text: string): string {
  return text.replace(/\[(sad|angry|happily|excited|calm|serious|whispers|shouts|slow|fast|laughs|sighs|gasp|emphasis|dramatic|sorrowful|clears throat|silence|long_pause|break)\]/gi, '').trim()
}

// Group all words with their timestamps - keep full sentences together
function getAllWords(
  lyrics: LyricsDocument,
  wordTimestamps: WordTimestamp[],
): Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }> {
  const result: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }> = []
  let tsIndex = 0
  let lineIndex = 0

  for (const section of lyrics.sections) {
    for (const line of section.lines) {
      for (let i = 0; i < line.words.length && tsIndex < wordTimestamps.length; i++) {
        const word = line.words[i]
        // Skip emotion tags
        if (!/^\[(sad|angry|happily|excited|calm|serious|whispers|shouts|slow|fast|laughs|sighs|gasp|emphasis|dramatic|sorrowful|clears throat|silence|long_pause|break)\]$/i.test(word)) {
          result.push({
            word: stripEmotionTags(word),
            timestamp: wordTimestamps[tsIndex++],
            lineIndex,
          })
        }
      }
      lineIndex++
    }
  }

  return result
}

// Get current line being spoken
function getCurrentLine(
  currentTime: number,
  allWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>,
): { text: string; words: Array<{ word: string; timestamp: WordTimestamp }> } | null {
  // Add small offset to account for audio processing delay (adjust if needed)
  const adjustedTime = currentTime - 0.05 // 50ms offset
  
  // Find which word is currently active
  const activeWord = allWords.find(
    w => w.timestamp.startTime <= adjustedTime && adjustedTime < w.timestamp.endTime
  )

  if (!activeWord) return null

  // Get all words from the same line
  const lineWords = allWords.filter(w => w.lineIndex === activeWord.lineIndex)
  
  return {
    text: lineWords.map(w => w.word).join(' '),
    words: lineWords.map(w => ({ word: w.word, timestamp: w.timestamp })),
  }
}

// ─── Full-width waveform at bottom ───────────────────────────────────────────

function FullWidthWaveform({ frame, fps }: { frame: number; fps: number }) {
  const bars = Array.from({ length: 100 }, (_, i) => {
    const time = frame / fps
    const baseHeight = 25
    const wave1 = Math.sin(time * 5 + i * 0.2) * 35
    const wave2 = Math.cos(time * 3.5 + i * 0.15) * 25
    const wave3 = Math.sin(time * 6 + i * 0.1) * 20
    const height = baseHeight + wave1 + wave2 + wave3
    return Math.max(15, Math.min(100, height))
  })

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        paddingBottom: 10,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: h,
            background: `linear-gradient(to top, #facc15, #fbbf24, #f59e0b)`,
            borderRadius: '4px 4px 0 0',
            boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated word with karaoke-style highlighting ───────────────────────────

function KaraokeWord({ 
  word, 
  timestamp, 
  frame, 
  fps,
  isActive,
  wordIndex,
}: {
  word: string
  timestamp: WordTimestamp
  frame: number
  fps: number
  isActive: boolean
  wordIndex: number
}) {
  const currentTime = frame / fps
  const adjustedTime = currentTime - 0.05 // Same offset as getCurrentLine
  const isPast = adjustedTime >= timestamp.endTime

  // Use different font for each word for variety
  const fontFamily = fonts[wordIndex % fonts.length]

  // Spring animation for active word
  const scale = isActive ? spring({
    frame: frame - (timestamp.startTime * fps),
    fps,
    config: {
      damping: 200,
      stiffness: 300,
      mass: 0.3,
    },
  }) : 1

  // Random slight rotation for variety
  const rotation = isActive ? Math.sin(wordIndex) * 3 : 0

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily,
        fontSize: isActive ? 72 : 60,
        fontWeight: isActive ? 900 : 700,
        color: isActive ? '#facc15' : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        marginRight: 18,
        lineHeight: 1.3,
        letterSpacing: '0.02em',
        textShadow: isActive 
          ? `0 0 40px #facc1590, 0 0 80px #facc1550, 0 6px 30px rgba(0,0,0,0.8)` 
          : isPast 
          ? '0 3px 15px rgba(0,0,0,0.5)'
          : '0 2px 10px rgba(0,0,0,0.3)',
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transition: 'font-size 0.15s ease-out, color 0.15s ease-out',
        filter: isActive ? 'brightness(1.3) drop-shadow(0 0 10px #facc15)' : 'brightness(1)',
        WebkitTextStroke: isActive ? '1px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {word}
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

// ─── Main composition ─────────────────────────────────────────────────────────

export function RapVideoComposition({
  lyrics,
  wordTimestamps,
  audioSrc,
  beatSrc,
}: RapVideoProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const allWords = getAllWords(lyrics, wordTimestamps)
  const currentLine = getCurrentLine(currentTime, allWords)

  // Determine current section type for dynamic beat volume
  const currentSection = lyrics.sections.find(section => {
    const sectionWords = section.lines.flatMap(line => line.words)
    const sectionStart = allWords.find(w => sectionWords.includes(w.word))
    const sectionEnd = allWords.filter(w => sectionWords.includes(w.word)).pop()
    
    if (!sectionStart || !sectionEnd) return false
    
    return currentTime >= sectionStart.timestamp.startTime && 
           currentTime <= sectionEnd.timestamp.endTime
  })

  // Dynamic beat volume: louder on hooks, quieter on verses
  const beatVolume = currentSection?.type === 'hook' ? 0.6 : 0.3

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

      {/* Audio - vocals */}
      {audioSrc && <Audio src={audioSrc} />}
      
      {/* Audio - background beat */}
      {beatSrc && <Audio src={beatSrc} volume={beatVolume} />}

      {/* Lyrics - Keep full sentence together, highlight words as they're spoken */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px 200px 80px',
        }}
      >
        {currentLine && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 1000,
              gap: 0,
            }}
          >
            {currentLine.words.map((w, i) => {
              const adjustedTime = currentTime - 0.05 // Same offset
              const isActive = w.timestamp.startTime <= adjustedTime && adjustedTime < w.timestamp.endTime
              return (
                <KaraokeWord
                  key={`${w.word}-${i}`}
                  word={w.word}
                  timestamp={w.timestamp}
                  frame={frame}
                  fps={fps}
                  isActive={isActive}
                  wordIndex={i}
                />
              )
            })}
          </div>
        )}
      </AbsoluteFill>

      {/* Full-width waveform at bottom */}
      <FullWidthWaveform frame={frame} fps={fps} />

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: robotoMono,
          fontSize: 12,
          color: 'rgba(250,204,21,0.4)',
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        BARS.AI
      </div>

      {/* Debug overlay - shows timing info */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            fontFamily: robotoMono,
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 10,
            borderRadius: 5,
          }}
        >
          <div>Frame: {frame}</div>
          <div>Time: {currentTime.toFixed(2)}s</div>
          <div>Adjusted: {(currentTime - 0.05).toFixed(2)}s</div>
          <div>Words: {allWords.length}</div>
          {currentLine && (
            <>
              <div>Line: {currentLine.text.substring(0, 30)}...</div>
              <div>Active word: {currentLine.words.find(w => {
                const adj = currentTime - 0.05
                return w.timestamp.startTime <= adj && adj < w.timestamp.endTime
              })?.word || 'none'}</div>
            </>
          )}
        </div>
      )}
    </AbsoluteFill>
  )
}
