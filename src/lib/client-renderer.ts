// Client-side video renderer - ports Remotion RapVideoComposition to browser
// Uses Canvas for rendering + Web Audio API for audio + MediaRecorder for export

import type { LyricsDocument, WordTimestamp } from './rap-types'

// ─── Constants ────────────────────────────────────────────────────────────────

const WIDTH = 1080
const HEIGHT = 1080
const FPS = 30

// Font families to cycle through
const FONTS = ['Oswald', 'Anton', 'Impact', 'Arial Black', 'Verdana']

// Regex to detect emotion tags
const EMOTION_TAG_REGEX = /^\\[(sad|angry|happily|excited|calm|serious|whispers|shouts|slow|fast|laughs|sighs|gasp|emphasis|dramatic|sorrowful|clears throat|silence|long_pause|break)\\]$/i

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ClientRendererProps {
  lyrics: LyricsDocument
  wordTimestamps: WordTimestamp[]
  audioSrc: string
  beatSrc?: string
  punchSrc?: string
}

// Punchline timestamps (in seconds) - auto-detect from gaps > 1.5s between words
function detectPunchlineTimes(wordTimestamps: WordTimestamp[]): number[] {
  const punchlines: number[] = []
  // Look for pauses > 1.5s between words (potential punchline moments)
  for (let i = 1; i < wordTimestamps.length; i++) {
    const gap = wordTimestamps[i].startTime - wordTimestamps[i - 1].endTime
    if (gap > 1.5) {
      punchlines.push(wordTimestamps[i].startTime)
    }
  }
  return punchlines
}

// Will be set dynamically based on actual word timestamps
let PUNCHLINE_TIMES: number[] = []

// Offset to sync audio with visual timing
const AUDIO_OFFSET = 0.0

export interface RenderOptions {
  showDebug?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripEmotionTags(text: string): string {
  return text.replace(EMOTION_TAG_REGEX, '').trim()
}

function isEmotionTag(word: string): boolean {
  return EMOTION_TAG_REGEX.test(word)
}

function countRealWords(words: string[]): number {
  return words.filter(w => !isEmotionTag(w)).length
}

// Build flat list of words with their timestamps and line index
// Line index increments when there's a gap > 0.5s between words
function buildWordList(
  lyrics: LyricsDocument,
  wordTimestamps: WordTimestamp[],
): Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }> {
  const result: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }> = []
  let tsIndex = 0

  for (const section of lyrics.sections) {
    for (const line of section.lines) {
      for (const rawWord of line.words) {
        if (isEmotionTag(rawWord)) continue
        if (tsIndex >= wordTimestamps.length) break
        result.push({
          word: stripEmotionTags(rawWord),
          timestamp: wordTimestamps[tsIndex++],
          lineIndex: result.length > 0 ? Math.max(0, result[result.length - 1].lineIndex) : 0,
        })
      }
      // Increment line index after each line
      if (result.length > 0) {
        const lastLineStart = result.filter((_, i) => 
          i === 0 || result[i].lineIndex !== result[i - 1].lineIndex
        ).length - 1
      }
    }
  }
  
  // Re-assign line indices properly
  let currentLineIndex = 0
  let lastWordIndex = -1
  // Assign line indices based on gaps > 0.5s
  for (let i = 1; i < result.length; i++) {
    const gap = result[i].timestamp.startTime - result[i - 1].timestamp.endTime
    if (gap > 0.5) {
      currentLineIndex++
    }
    result[i].lineIndex = currentLineIndex
  }
  
  // Ensure all words in the same utterance have the same line index
  // by looking at timestamp proximity
  currentLineIndex = 0
  for (let i = 1; i < result.length; i++) {
    const timeSinceLastWord = result[i].timestamp.startTime - result[i - 1].timestamp.startTime
    if (timeSinceLastWord > 1.0) {
      currentLineIndex++
    }
    result[i].lineIndex = currentLineIndex
  }

  return result
}

// Get current line of words being spoken (uses AUDIO_OFFSET for sync)
function getCurrentLine(
  currentTime: number,
  allWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>,
): Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }> {
  const adjustedTime = currentTime - AUDIO_OFFSET
  const activeWord = allWords.find(
    w => adjustedTime >= w.timestamp.startTime && adjustedTime < w.timestamp.endTime
  )
  
  if (!activeWord) {
    // Find last word that ended
    const pastWords = allWords.filter(w => adjustedTime >= w.timestamp.endTime)
    if (pastWords.length === 0) return []
    return allWords.filter(w => w.lineIndex === pastWords[pastWords.length - 1].lineIndex)
  }
  
  return allWords.filter(w => w.lineIndex === activeWord.lineIndex)
}

// Spring animation function
function spring(current: number, target: number, velocity: number, damping = 200, stiffness = 300, mass = 0.3): { value: number; velocity: number } {
  const dt = 1 / FPS
  const springForce = -stiffness * (current - target)
  const dampingForce = -damping * velocity
  const acceleration = (springForce + dampingForce) / mass
  
  return {
    value: current + velocity * dt,
    velocity: velocity + acceleration * dt,
  }
}

// ─── Drawing Functions ─────────────────────────────────────────────────────────

// Draw background with particles and pulsing circle
function drawBackground(ctx: CanvasRenderingContext2D, frame: number, punchlineFlash = 0) {
  // Base color
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  
  // Radial gradient glow
  const gradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, WIDTH * 0.6)
  gradient.addColorStop(0, 'rgba(250, 204, 21, 0.08)')
  gradient.addColorStop(0.5, 'rgba(250, 204, 21, 0.03)')
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  
  // Particles
  for (let i = 0; i < 20; i++) {
    const x = (i * 50 + frame * 0.5) % WIDTH
    const y = Math.sin(frame * 0.02 + i) * 200 + HEIGHT / 2
    const size = 4 + Math.sin(frame * 0.05 + i) * 2
    const opacity = 0.1 + Math.sin(frame * 0.03 + i) * 0.05
    
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(250, 204, 21, ${opacity})`
    ctx.fill()
    
    // Glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
    glowGradient.addColorStop(0, `rgba(250, 204, 21, ${opacity * 0.5})`)
    glowGradient.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGradient
    ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6)
  }
  
  // Pulsing circle
  const pulseScale = 1 + Math.sin(frame * 0.15) * 0.2
  const pulseOpacity = 0.15 + Math.sin(frame * 0.1) * 0.05
  const circleSize = 400 * pulseScale
  
  const circleGradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, circleSize / 2)
  circleGradient.addColorStop(0, `rgba(250, 204, 21, ${pulseOpacity})`)
  circleGradient.addColorStop(1, 'transparent')
  ctx.fillStyle = circleGradient
  ctx.beginPath()
  ctx.arc(WIDTH / 2, HEIGHT / 2, circleSize / 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawWaveform(ctx: CanvasRenderingContext2D, frame: number) {
  const barCount = 100
  const barWidth = (WIDTH - 40) / barCount
  const baseY = HEIGHT - 60
  
  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, baseY - 60, 0, HEIGHT)
  bgGradient.addColorStop(0, 'transparent')
  bgGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.6)')
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, baseY - 60, WIDTH, 120)
  
  for (let i = 0; i < barCount; i++) {
    const time = frame / FPS
    const baseHeight = 25
    const wave1 = Math.sin(time * 5 + i * 0.2) * 35
    const wave2 = Math.cos(time * 3.5 + i * 0.15) * 25
    const wave3 = Math.sin(time * 6 + i * 0.1) * 20
    const height = baseHeight + wave1 + wave2 + wave3
    const clampedHeight = Math.max(15, Math.min(100, height))
    
    const x = 20 + i * barWidth
    const y = baseY - clampedHeight
    
    // Bar gradient
    const barGradient = ctx.createLinearGradient(x, y + clampedHeight, x, y)
    barGradient.addColorStop(0, '#f59e0b')
    barGradient.addColorStop(0.5, '#fbbf24')
    barGradient.addColorStop(1, '#facc15')
    
    ctx.fillStyle = barGradient
    ctx.fillRect(x, y, barWidth - 2, clampedHeight)
    
    // Glow
    ctx.shadowColor = 'rgba(250, 204, 21, 0.5)'
    ctx.shadowBlur = 20
    ctx.fillRect(x, y, barWidth - 2, clampedHeight)
    ctx.shadowBlur = 0
  }
}

// Draw karaoke-style lyrics with word highlighting
function drawWords(
  ctx: CanvasRenderingContext2D,
  currentTime: number,
  allWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>,
) {
  const lineWords = getCurrentLine(currentTime, allWords)
  if (lineWords.length === 0) {
    // Draw something even when no active line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('READY', WIDTH / 2, HEIGHT / 2)
    return
  }
  
  const lineEndTime = lineWords[lineWords.length - 1].timestamp.endTime
  
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Calculate total width first
  let totalWidth = 0
  const wordWidths: number[] = []
  
  const adjustedTime = currentTime - AUDIO_OFFSET
  
  lineWords.forEach((w, i) => {
    const fontIndex = i % FONTS.length
    const isActive = adjustedTime >= w.timestamp.startTime && adjustedTime < w.timestamp.endTime
    const isPast = adjustedTime >= lineEndTime
    const fontSize = isActive ? 72 : 60
    const fontWeight = isActive ? '900' : '700'
    
    ctx.font = `${fontWeight} ${fontSize}px ${FONTS[fontIndex]}, sans-serif`
    const metrics = ctx.measureText(w.word)
    const width = metrics.width + 18 // margin
    wordWidths.push(width)
    totalWidth += width
  })
  
  // Starting position
  let x = (WIDTH - totalWidth) / 2 + wordWidths[0] / 2
  const y = HEIGHT / 2 - 50
  
  lineWords.forEach((w, i) => {
    const fontIndex = i % FONTS.length
    const isActive = adjustedTime >= w.timestamp.startTime && adjustedTime < w.timestamp.endTime
    const isPast = adjustedTime >= lineEndTime
    
    const fontSize = isActive ? 72 : 60
    const fontWeight = isActive ? '900' : '700'
    
    // Color based on state
    if (isActive) {
      ctx.fillStyle = '#facc15'
      ctx.shadowColor = 'rgba(250, 204, 21, 0.8)'
      ctx.shadowBlur = 40
    } else if (isPast) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.shadowBlur = 0
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.shadowBlur = 0
    }
    
    ctx.font = `${fontWeight} ${fontSize}px ${FONTS[fontIndex]}, sans-serif`
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 1
    
    const displayWord = w.word.toUpperCase()
    
    // Stroke then fill for outline effect
    ctx.strokeText(displayWord, x, y)
    ctx.fillText(displayWord, x, y)
    
    ctx.shadowBlur = 0
    x += wordWidths[i]
  })
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.font = '700 12px monospace'
  ctx.fillStyle = 'rgba(250, 204, 21, 0.4)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('BARS.AI', WIDTH / 2, HEIGHT - 140)
}

// Draw debug info (frame count, active word, etc.)
function drawDebugOverlay(ctx: CanvasRenderingContext2D, frame: number, currentTime: number, allWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>) {
  ctx.font = '14px monospace'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  const activeWord = allWords.find(
    w => w.timestamp.startTime <= currentTime && currentTime < w.timestamp.endTime
  )
  
  const lines = [
    `Frame: ${frame} | Time: ${currentTime.toFixed(3)}s`,
    `Active: \"${activeWord?.word ?? '—'}\"`,
    `Expected: ${activeWord?.timestamp.startTime.toFixed(3) ?? '—'}s → ${activeWord?.timestamp.endTime.toFixed(3) ?? '—'}s`,
  ]
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(20, 20, 300, lines.length * 20 + 20)
  
  lines.forEach((line, i) => {
    ctx.fillStyle = i === 2 && activeWord ? '#44ff44' : 'rgba(255, 255, 255, 0.7)'
    ctx.fillText(line, 30, 30 + i * 20)
  })
}

// ─── Main Renderer Class ──────────────────────────────────────────────────────

export class ClientRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private props: ClientRendererProps
  private allWords: Array<{ word: string; timestamp: WordTimestamp; lineIndex: number }>
  private audioContext: AudioContext | null = null
  private audioElement: HTMLAudioElement | null = null
  private beatElement: HTMLAudioElement | null = null
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null
  private animationId: number = 0
  private startTime: number = 0
  private isRecording: boolean = false
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private durationInSeconds: number
  private punchlineFlash: number = 0
  private showDebug: boolean = false

  constructor(canvas: HTMLCanvasElement, props: ClientRendererProps, options?: RenderOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.props = props
    this.allWords = buildWordList(props.lyrics, props.wordTimestamps)
    this.durationInSeconds = props.wordTimestamps[props.wordTimestamps.length - 1]?.endTime ?? 10
    this.showDebug = options?.showDebug ?? false
    
    console.log('[ClientRenderer] Initialized with', this.allWords.length, 'words, duration:', this.durationInSeconds, 's')
    console.log('[ClientRenderer] First few words:', this.allWords.slice(0, 5).map(w => `${w.word}(${w.timestamp.startTime.toFixed(2)}s)`))
    
    // Set canvas size
    canvas.width = WIDTH
    canvas.height = HEIGHT
    
    // Detect punchline times dynamically
    PUNCHLINE_TIMES = detectPunchlineTimes(props.wordTimestamps)
    console.log('[ClientRenderer] Punchline times:', PUNCHLINE_TIMES)
    
    // Load fonts
    this.loadFonts()
    
    // Draw initial frame
    this.renderFrame(0)
  }
  
  private async loadFonts() {
    const fontUrls = [
      'https://fonts.gstatic.com/s/oswald/v53/yTJRhxv1_5nQQgkYvBHMXw.woff2',
      'https://fonts.gstatic.com/s/anton/v14/1pDIGfSln24kVr9b0.woff2',
    ]
    
    const font = new FontFace('Oswald', 'url(https://fonts.gstatic.com/s/oswald/v53/yTJRhxv1_5nQQgkYvBHMXw.woff2)')
    const font2 = new FontFace('Anton', 'url(https://fonts.gstatic.com/s/anton/v14/1pDIGfSln24kVr9b0.woff2)')
    
    try {
      const [loadedFont, loadedFont2] = await Promise.all([font.load(), font2.load()])
      // @ts-ignore - document.fonts.add is valid at runtime
      document.fonts.add(loadedFont)
      // @ts-ignore
      document.fonts.add(loadedFont2)
    } catch (e) {
      console.warn('Failed to load custom fonts, using fallbacks')
    }
  }

  async prepareAudio(): Promise<void> {
    // Create audio context
    this.audioContext = new AudioContext()
    
    // Create voiceover audio element
    this.audioElement = new Audio(this.props.audioSrc)
    this.audioElement.crossOrigin = 'anonymous'
    
    // Create beat audio element (if provided)
    if (this.props.beatSrc) {
      this.beatElement = new Audio(this.props.beatSrc)
      this.beatElement.crossOrigin = 'anonymous'
      this.beatElement.loop = true
    }
    
    // Wait for audio to be ready
    await new Promise<void>((resolve, reject) => {
      if (!this.audioElement) return reject(new Error('No audio element'))
      
      const checkReady = () => {
        if (this.audioElement!.readyState >= 2) resolve()
      }
      
      if (this.audioElement.readyState >= 2) {
        checkReady()
      } else {
        this.audioElement.addEventListener('canplaythrough', checkReady, { once: true })
        this.audioElement.addEventListener('error', (e) => reject(new Error(`Audio error: ${e}`)), { once: true })
      }
      
      // Timeout after 10 seconds
      setTimeout(resolve, 10000)
    })
    
    // Create MediaStreamDestination for capturing audio
    this.mediaStreamDest = this.audioContext.createMediaStreamDestination()
    
    // Connect voiceover to both destination (capture) and speakers (playback)
    const voiceSource = this.audioContext.createMediaElementSource(this.audioElement)
    voiceSource.connect(this.mediaStreamDest)
    voiceSource.connect(this.audioContext.destination)
    
    // Connect beat to both destination (capture) and speakers (playback)
    if (this.beatElement) {
      const beatSource = this.audioContext.createMediaElementSource(this.beatElement)
      beatSource.connect(this.mediaStreamDest)
      beatSource.connect(this.audioContext.destination)
    }
  }

  private renderFrame(frame: number) {
    const currentTime = frame / FPS
    const adjustedTime = currentTime - AUDIO_OFFSET
    
    // Clear
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
    
    // Draw layers
    drawBackground(this.ctx, frame, this.punchlineFlash)
    drawWaveform(this.ctx, frame)
    drawWords(this.ctx, currentTime, this.allWords)
    
    // Check for punchline flash
    const punchlineHit = PUNCHLINE_TIMES.some(t => Math.abs(adjustedTime - t) < 0.1)
    if (punchlineHit && this.punchlineFlash < 5) {
      this.punchlineFlash = 5 // Trigger flash for 5 frames
    }
    if (this.punchlineFlash > 0) {
      this.punchlineFlash--
      // Draw flash overlay
      if (this.punchlineFlash > 3) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${(this.punchlineFlash - 3) * 0.3})`
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT)
      }
    }
    
    drawWatermark(this.ctx)
    if (this.showDebug) {
      drawDebugOverlay(this.ctx, frame, currentTime, this.allWords)
    }
  }

  async startPlayback(onComplete?: () => void): Promise<void> {
    if (!this.audioContext) await this.prepareAudio()
    
    this.startTime = performance.now()
    
    const animate = () => {
      const elapsed = (performance.now() - this.startTime) / 1000
      const frame = Math.floor(elapsed * FPS)
      
      this.renderFrame(frame)
      
      // Sync audio with first frame
      if (this.audioElement && this.audioElement.paused) {
        this.audioElement.currentTime = 0
        this.audioElement.play().catch(console.warn)
        if (this.beatElement) {
          this.beatElement.currentTime = 0
          this.beatElement.play().catch(console.warn)
        }
      }
      
      if (elapsed < this.durationInSeconds + 1) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }
    
    this.animationId = requestAnimationFrame(animate)
  }

  stopPlayback() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.currentTime = 0
    }
  }

  async startRecording(onProgress?: (progress: number) => void): Promise<void> {
    console.log('[ClientRenderer] Starting recording...')
    
    if (!this.audioContext) {
      console.log('[ClientRenderer] Preparing audio...')
      await this.prepareAudio()
      console.log('[ClientRenderer] Audio prepared')
    } else {
      console.log('[ClientRenderer] Audio already prepared')
    }
    
    // Resume AudioContext (browsers suspend until user interaction)
    await this.audioContext!.resume()
    console.log('[ClientRenderer] AudioContext resumed')
    
    // Create canvas stream
    const canvasStream = this.canvas.captureStream(FPS)
    
    // Get audio stream from MediaStreamDestination (already set up in prepareAudio)
    let audioTrack: MediaStreamTrack | null = null
    if (this.mediaStreamDest) {
      audioTrack = this.mediaStreamDest.stream.getAudioTracks()[0]
    }
    
    // Combine streams
    const tracks: MediaStreamTrack[] = [canvasStream.getVideoTracks()[0]]
    if (audioTrack) tracks.push(audioTrack)
    const combinedStream = new MediaStream(tracks)
    
    // Create recorder
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
    
    this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType })
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data)
      }
    }
    
    this.mediaRecorder.onstop = () => {
      console.log('[ClientRenderer] Recording stopped, chunks:', this.recordedChunks.length)
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
      console.log('[ClientRenderer] Blob created, size:', blob.size, 'bytes')
      this.isRecording = false
      // Dispatch custom event with the blob
      window.dispatchEvent(new CustomEvent('videoRenderComplete', { detail: blob }))
    }
    
    this.mediaRecorder.onerror = (e) => {
      console.error('[ClientRenderer] MediaRecorder error:', e)
    }
    
    this.mediaRecorder.start(100) // Collect data every 100ms
    
    // Start playback
    this.startTime = performance.now()
    this.punchlineFlash = 0
    
    // Progress tracking
    let lastProgressUpdate = 0
    
    const animate = () => {
      if (!this.isRecording) return
      
      const elapsed = (performance.now() - this.startTime) / 1000
      const frame = Math.floor(elapsed * FPS)
      
      // Update progress every ~10 frames (not every frame)
      if (frame - lastProgressUpdate >= 10 && onProgress) {
        const progress = Math.min(100, (elapsed / this.durationInSeconds) * 100)
        onProgress(progress)
        lastProgressUpdate = frame
      }
      
      this.renderFrame(frame)
      
      // Sync audio with first frame
      if (this.audioElement && this.audioElement.paused) {
        this.audioElement.currentTime = 0
        this.audioElement.play().catch(console.warn)
        if (this.beatElement) {
          this.beatElement.currentTime = 0
          this.beatElement.play().catch(console.warn)
        }
      }
      
      // Auto-stop when video ends
      if (elapsed >= this.durationInSeconds + 2) {
        this.stopRecording()
        return
      }
      
      this.animationId = requestAnimationFrame(animate)
    }
    
    console.log('[ClientRenderer] Starting animation loop, duration:', this.durationInSeconds, 's')
    this.animationId = requestAnimationFrame(animate)
  }

  stopRecording(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    if (this.audioElement) {
      this.audioElement.pause()
    }
    this.isRecording = false
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording
  }

  getDuration(): number {
    return this.durationInSeconds
  }

  destroy() {
    this.stopPlayback()
    this.stopRecording()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.mediaStreamDest = null
    if (this.audioElement) {
      this.audioElement = null
    }
    if (this.beatElement) {
      this.beatElement = null
    }
  }
}