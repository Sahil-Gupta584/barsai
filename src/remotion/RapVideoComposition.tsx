import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, spring, Sequence } from 'remotion'
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

// SYNC TUNING: increase if captions lag behind audio, decrease if ahead
// NOTE: If audio starts at frame 0 and word timestamps align with audio,
// this offset should be 0. A positive offset causes highlights to BEHIND audio.
const AUDIO_OFFSET = 0

export interface RapVideoProps {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  durationInFrames: number
  fps: number
  audioSrc?: string
  beatSrc?: string
  punchSrc?: string
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

// Emotion tag regex - used both for stripping and counting
const EMOTION_TAG_REGEX = /^\[(sad|angry|happily|excited|calm|serious|whispers|shouts|slow|fast|laughs|sighs|gasp|emphasis|dramatic|sorrowful|clears throat|silence|long_pause|break|BOOM)\]$/i

// Remove emotion tags from text for display
function stripEmotionTags(text: string): string {
  return text.replace(EMOTION_TAG_REGEX, '').trim()
}

// Check if word is an emotion tag (consolidated logic)
function isEmotionTag(word: string): boolean {
  return EMOTION_TAG_REGEX.test(word)
}

// Count non-emotion-tag words in a line
function countRealWords(line: string[]): number {
  return line.filter(w => !isEmotionTag(w)).length
}

// Helper to clean word for better matching
function clean(word: string) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Group all words with their timestamps.
// The wordTimestamps array (from ElevenLabs) is the ground truth — it contains
// both real words AND emotion tags in the correct spoken order, with precise timing.
// We drive iteration from that array and assign lineIndex by consuming real lyric words.
function getAllWords(
  lyrics: LyricsDocument,
  wordTimestamps: WordTimestamp[],
): { 
  displayWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>;
  punchlineTimes: number[];
} {
  const displayWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }> = []
  const punchlineTimes: number[] = []

  // Build a flat list of (non-tag) lyric words with their line index
  // The lyrics words array strips tags already, so this is our line-tracking source
  const flatLines: Array<{ lineIndex: number; wordsInLine: number }> = []
  let li = 0
  for (const section of lyrics.sections) {
    for (const line of section.lines) {
      flatLines.push({ lineIndex: li, wordsInLine: line.words.length })
      li++
    }
  }

  // Track which line we're on based on how many real (non-tag) words we've consumed
  let realWordCount = 0
  let currentLineIdx = 0
  let wordsConsumedInCurrentLine = 0

  const advanceLine = () => {
    while (currentLineIdx < flatLines.length && wordsConsumedInCurrentLine >= flatLines[currentLineIdx].wordsInLine) {
      wordsConsumedInCurrentLine -= flatLines[currentLineIdx].wordsInLine
      currentLineIdx++
    }
  }

  for (const timestamp of wordTimestamps) {
    const isBoom = timestamp.word.toUpperCase() === '[BOOM]'
    if (isBoom) {
      punchlineTimes.push(timestamp.startTime)
      continue
    }

    if (isEmotionTag(timestamp.word)) {
      // Emotion tag — skip display but don't advance the real-word counter
      continue
    }

    // Real word — advance line tracking
    advanceLine()
    const lineIndex = currentLineIdx < flatLines.length ? flatLines[currentLineIdx].lineIndex : (flatLines.at(-1)?.lineIndex ?? 0)

    displayWords.push({
      word: timestamp.word,
      timestamp,
      lineIndex,
    })

    realWordCount++
    wordsConsumedInCurrentLine++
  }

  return { displayWords, punchlineTimes }
}

// Get current line being spoken
function getCurrentLine(
  currentTime: number,
  allWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>,
): { text: string; words: Array<{ word: string; timestamp: WordTimestamp }> } | null {
  // Find which word is currently active using raw time
  const activeWord = allWords.find(
    w => w.timestamp.startTime <= currentTime && currentTime < w.timestamp.endTime
  )

  // Use active word's line, or if between words, find last word that ended
  const targetWord = activeWord || allWords.filter(w => currentTime >= w.timestamp.endTime).at(-1)

  if (!targetWord) return null

  // Get all words from the same line
  const lineWords = allWords.filter(w => w.lineIndex === targetWord.lineIndex)

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
  lineEndTime,
}: {
  word: string
  timestamp: WordTimestamp
  frame: number
  fps: number
  isActive: boolean
  wordIndex: number
  lineEndTime: number
}) {
  const currentTime = frame / fps
  // A word stays "highlighted" until the entire line is done (karaoke style)
  const isPast = currentTime >= lineEndTime

  // Use different font for each word for variety
  const fontFamily = fonts[wordIndex % fonts.length]

  // Spring animation - calculate frames since this word became active
  // This ensures the spring plays once when word becomes active, not continuously
  const framesSinceStart = Math.max(0, frame - Math.round(timestamp.startTime * fps))
  const scale = isActive ? spring({
    frame: framesSinceStart,
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
  punchSrc,
}: RapVideoProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const currentTime = frame / fps

  const { displayWords, punchlineTimes: boomTimes } = getAllWords(lyrics, wordTimestamps)
  const currentLine = getCurrentLine(currentTime, displayWords)

  // Combined punchline hits
  const punchlineTimes: number[] = [...boomTimes]

  // Fallback: If absolutely no [BOOM] tags were provided by AI, use section ends
  if (punchlineTimes.length === 0) {
    let currentGlobalLineIndex = 0
    for (const section of lyrics.sections) {
      const lastLineRelativeIndex = section.lines.length - 1
      const lastLineGlobalIndex = currentGlobalLineIndex + lastLineRelativeIndex
      currentGlobalLineIndex += section.lines.length

      const firstWordOfLastLine = displayWords.find(w => w.lineIndex === lastLineGlobalIndex)
      if (firstWordOfLastLine) {
        punchlineTimes.push(firstWordOfLastLine.timestamp.startTime)
      }
    }
  }

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

      {/* Audio - background beat (lower volume when a punchline hits) */}
      {(() => {
        if (!beatSrc) return null;

        // Calculate if we're currently in a "punchline zone" (0.5s after any punchline hit)
        const isPunching = punchlineTimes.some(t => {
          const punchFrame = Math.round(t * fps);
          return frame >= punchFrame && frame < punchFrame + (fps * 0.5);
        });

        return <Audio src={beatSrc} volume={isPunching ? 0.05 : 0.15} loop />;
      })()}

      {/* Punchline flash effect — white flash + scale on punchline hits */}
      {punchlineTimes.map((t, i) => {
        // Shift flash slightly earlier too for visual impact
        const punchFrame = Math.round((t - 0.05) * fps)
        const elapsed = frame - punchFrame
        if (elapsed < 0 || elapsed > fps * 0.4) return null
        const flashOpacity = Math.max(0, 0.5 - elapsed / (fps * 0.4))
        const scaleVal = 1 + Math.max(0, 0.04 - (elapsed / (fps * 0.4)) * 0.04)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: `rgba(250,204,21,${flashOpacity})`,
              pointerEvents: 'none',
              zIndex: 10,
              transform: `scale(${scaleVal})`,
            }}
          />
        )
      })}

      {/* Audio - punchline boom: fires SLIGHTLY EARLIER than the word for maximum impact */}
      {punchSrc && punchlineTimes.map((t, i) => (
        <Sequence key={i} from={Math.round((t - 0.1) * fps)} durationInFrames={Math.round(fps * 2.0)}>
          <Audio src={punchSrc} volume={10.0} />
        </Sequence>
      ))}

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
              // Direct time comparison - no offset needed if audio starts at frame 0
              const isActive = currentTime >= w.timestamp.startTime && currentTime < w.timestamp.endTime
              // Pass the end time of the last word in the line so all words stay lit until line ends
              const lineEndTime = currentLine.words[currentLine.words.length - 1].timestamp.endTime
              return (
                <KaraokeWord
                  key={`${w.word}-${i}-${w.timestamp.startTime}`}
                  word={w.word}
                  timestamp={w.timestamp}
                  frame={frame}
                  fps={fps}
                  isActive={isActive}
                  wordIndex={i}
                  lineEndTime={lineEndTime}
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
        <div>Frame: {frame} | Time: {currentTime.toFixed(3)}s | Offset: {AUDIO_OFFSET}s</div>
        {(() => {
          // Direct comparison - no offset
          const activeWord = displayWords.find(w =>
            currentTime >= w.timestamp.startTime && currentTime < w.timestamp.endTime
          )
          const drift = activeWord ? (currentTime - activeWord.timestamp.startTime).toFixed(3) : 'n/a'
          return (
            <>
              <div>Active: "{activeWord?.word ?? '—'}"</div>
              <div>Expected: {activeWord?.timestamp.startTime.toFixed(3) ?? '—'}s → {activeWord?.timestamp.endTime.toFixed(3) ?? '—'}s</div>
              <div style={{ color: Number(drift) > 0.1 ? '#ff4444' : '#44ff44' }}>
                Drift: +{drift}s
              </div>
              <div>Punchlines: {punchlineTimes.map(t => t.toFixed(2)).join(', ')}</div>
            </>
          )
        })()}
      </div>
      {currentLine && (
        <>
          <div style={{ position: 'absolute', top: 150, left: 20, fontFamily: robotoMono, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Line: {currentLine.text.substring(0, 30)}...
          </div>
          <div style={{ position: 'absolute', top: 170, left: 20, fontFamily: robotoMono, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Active word: {currentLine.words.find(w =>
              currentTime >= w.timestamp.startTime && currentTime < w.timestamp.endTime
            )?.word || 'none'}
          </div>
        </>
      )}
    </AbsoluteFill>
  )
}
