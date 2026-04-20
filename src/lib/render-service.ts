import fs from 'node:fs'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { RenderError, type RenderInput } from './rap-types'

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
  async renderVideo(input: RenderInput): Promise<Buffer> {
    const { lyrics, wordTimestamps, audioBuffer, outputPath } = input

    // Audio must be served via http — write to public/ so Vite serves it
    const jobId = path.basename(outputPath, '.mp4')
    const publicAudioPath = path.resolve(
      process.cwd(),
      'public/videos',
      `${jobId}-audio.mp3`,
    )

    // Ensure public/videos exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(publicAudioPath, audioBuffer)

    // Remotion needs an http URL for audio — use the Vite dev server
    const serverUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
    const audioSrc = `${serverUrl}/videos/${jobId}-audio.mp3`

    const durationInFrames = computeDurationInFrames(wordTimestamps)
    const fps = 30

    const props = {
      lyrics,
      wordTimestamps,
      durationInFrames,
      fps,
      audioSrc,
    }

    try {
      // Bundle the Remotion composition
      const bundleLocation = await bundle({
        entryPoint: path.resolve(process.cwd(), 'src/remotion/index.tsx'),
        webpackOverride: (config) => config,
      })

      // Select the composition
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

      // Render to file
      await renderMedia({
        composition: finalComposition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: props,
        concurrency: 2,
        onProgress: ({ progress }) => {
          process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`)
        },
      })

      process.stdout.write('\n')

      const mp4Buffer = fs.readFileSync(outputPath)
      if (mp4Buffer.length === 0) {
        throw new RenderError('Rendered MP4 is empty')
      }

      return mp4Buffer
    } catch (err) {
      if (err instanceof RenderError) throw err
      throw new RenderError(
        `Remotion render failed: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      // Clean up temp audio file after render
      try {
        if (fs.existsSync(publicAudioPath)) {
          fs.unlinkSync(publicAudioPath)
        }
      } catch {
        // ignore
      }
    }
  }
}

let _instance: RenderService | null = null

export function getRenderService(): RenderService {
  if (!_instance) {
    _instance = new RenderService()
  }
  return _instance
}
