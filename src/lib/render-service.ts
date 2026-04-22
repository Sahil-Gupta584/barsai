import fs from 'node:fs'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { renderVideoOnLambda } from '@remotion/lambda/client'
import { RenderError, type RenderInput } from './rap-types'

// ─── Serverless detection ─────────────────────────────────────────────────────

function isServerless(): boolean {
  return process.env.VERCEL === '1' || !fs.existsSync(path.join(process.cwd(), 'public'))
}

function getTempDir(): string {
  // Use /tmp on serverless, otherwise use public/videos
  if (isServerless()) return '/tmp'
  const videosDir = path.join(process.cwd(), 'public/videos')
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true })
  }
  return videosDir
}

// ─── Duration helper ──────────────────────────────────────────────────────────

export function computeDurationInFrames(
  wordTimestamps: { endTime: number }[],
  fps = 30,
): number {
  if (wordTimestamps.length === 0) return fps * 5
  const lastEndTime = wordTimestamps[wordTimestamps.length - 1].endTime
  return Math.ceil((lastEndTime + 0.5) * fps)
}

// ─── Service ──────────────────────────────────────────────────────────────────

class RenderService {
  /**
   * Main entry point: automatically chooses between local and Lambda rendering
   */
  async render(input: RenderInput): Promise<{ videoUrl?: string; buffer?: Buffer }> {
    const useLambda = !!process.env.REMOTION_LAMBDA_FUNCTION_NAME && isServerless()

    if (useLambda) {
      console.log('Using Remotion Lambda for rendering...')
      const videoUrl = await this.renderOnLambda(input)
      return { videoUrl }
    } else {
      console.log('Using local Remotion for rendering...')
      const buffer = await this.renderVideo(input)
      return { buffer }
    }
  }

  /**
   * Local render (Puppeteer based)
   */
  async renderVideo(input: RenderInput): Promise<Buffer> {
    const { lyrics, wordTimestamps, audioBuffer, beatBuffer, outputPath } = input
    const tempDir = getTempDir()
    const jobId = path.basename(outputPath, '.mp4')

    const audioPath = path.join(tempDir, `${jobId}-audio.mp3`)
    fs.writeFileSync(audioPath, audioBuffer)

    let beatPath: string | undefined
    if (beatBuffer) {
      beatPath = path.join(tempDir, `${jobId}-beat.mp3`)
      fs.writeFileSync(beatPath, beatBuffer)
    }

    const isLocal = !isServerless()
    const serverUrl = isLocal
      ? (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000')
      : null

    const audioSrc = isLocal
      ? `${serverUrl}/videos/${jobId}-audio.mp3`
      : `file://${audioPath}`

    const beatSrc = beatPath && isLocal
      ? `${serverUrl}/videos/${jobId}-beat.mp3`
      : beatPath ? `file://${beatPath}` : undefined

    const punchSoundPath = path.join(process.cwd(), 'public/beats/punch.mp3')
    const punchSrc = isLocal
      ? `${serverUrl}/beats/punch.mp3`
      : (fs.existsSync(punchSoundPath) ? `file://${punchSoundPath}` : undefined)

    const durationInFrames = computeDurationInFrames(wordTimestamps)
    const fps = 30
    const props = { lyrics, wordTimestamps, durationInFrames, fps, audioSrc, beatSrc, punchSrc }

    try {
      const bundleLocation = await bundle({
        entryPoint: path.resolve(process.cwd(), 'src/remotion/index.tsx'),
        webpackOverride: (config) => config,
      })

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'RapVideo',
        inputProps: props,
      })

      const finalComposition = {
        ...composition,
        durationInFrames,
        fps,
        width: 1080,
        height: 1080,
      }

      const renderOutputPath = path.join(tempDir, `${jobId}.mp4`)

      await renderMedia({
        composition: finalComposition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: renderOutputPath,
        inputProps: props,
        concurrency: 2,
      })

      const mp4Buffer = fs.readFileSync(renderOutputPath)
      if (mp4Buffer.length === 0) throw new RenderError('Rendered MP4 is empty')

      return mp4Buffer
    } catch (err) {
      throw new RenderError(`Remotion render failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  /**
   * Cloud render (AWS Lambda based)
   */
  async renderOnLambda(input: RenderInput): Promise<string> {
    const { lyrics, wordTimestamps, audioBuffer, beatBuffer } = input
    const durationInFrames = computeDurationInFrames(wordTimestamps)
    const fps = 30

    // For Lambda, we MUST use public URLs for audio files because Lambda can't access local files
    // We expect them to be uploaded to a public location (like our public/videos dir served by Vercel)
    // Or we could upload them to S3. For simplicity, we assume they are served from BETTER_AUTH_URL
    const jobId = path.basename(input.outputPath, '.mp4')
    const serverUrl = process.env.BETTER_AUTH_URL ?? 'https://your-app.vercel.app'
    
    // Note: On Vercel, we can't write to public/ during runtime.
    // So for Lambda, we should ideally upload these buffers to S3 first.
    // For now, let's assume they are either already there or provide a warning.
    const audioSrc = `${serverUrl}/videos/${jobId}-audio.mp3`
    const beatSrc = beatBuffer ? `${serverUrl}/videos/${jobId}-beat.mp3` : undefined
    const punchSrc = `${serverUrl}/beats/punch.mp3`

    const { renderId, bucketName } = await renderVideoOnLambda({
      region: (process.env.REMOTION_LAMBDA_REGION as any) || 'us-east-1',
      functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
      serveUrl: process.env.REMOTION_LAMBDA_SERVE_URL!,
      composition: 'RapVideo',
      inputProps: {
        lyrics,
        wordTimestamps,
        durationInFrames,
        fps,
        audioSrc,
        beatSrc,
        punchSrc,
      },
      codec: 'h264',
      privacy: 'public',
    })

    return `https://${bucketName}.s3.${process.env.REMOTION_LAMBDA_REGION || 'us-east-1'}.amazonaws.com/renders/${renderId}/out.mp4`
  }
}

let _instance: RenderService | null = null

export function getRenderService(): RenderService {
  if (!_instance) {
    _instance = new RenderService()
  }
  return _instance
}
