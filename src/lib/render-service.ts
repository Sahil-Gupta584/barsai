import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { RenderError, type RenderInput } from './rap-types'

// ─── Duration helper ──────────────────────────────────────────────────────────

export function computeDurationInFrames(
  wordTimestamps: { endTime: number }[],
  fps = 30,
): number {
  if (wordTimestamps.length === 0) return fps * 5 // 5s default
  const lastEndTime = wordTimestamps[wordTimestamps.length - 1].endTime
  return Math.ceil((lastEndTime + 0.5) * fps)
}

// ─── Service ──────────────────────────────────────────────────────────────────

class RenderService {
  async renderVideo(input: RenderInput): Promise<Buffer> {
    const { lyrics, wordTimestamps, audioBuffer, outputPath } = input

    const tmpDir = os.tmpdir()
    const audioTmpPath = path.join(tmpDir, `rippy-audio-${Date.now()}.mp3`)

    try {
      // Write audio to temp file so Remotion can reference it
      fs.writeFileSync(audioTmpPath, audioBuffer)

      const durationInFrames = computeDurationInFrames(wordTimestamps)
      const fps = 30

      const props = {
        lyrics,
        wordTimestamps,
        durationInFrames,
        fps,
        audioSrc: audioTmpPath,
      }

      // Bundle the Remotion composition
      const bundleLocation = await bundle({
        entryPoint: path.resolve(process.cwd(), 'src/remotion/index.ts'),
        webpackOverride: (config) => config,
      })

      // Select the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'RapVideo',
        inputProps: props,
      })

      // Override duration with computed value
      const finalComposition = {
        ...composition,
        durationInFrames,
        fps,
        width: 1080,
        height: 1080,
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
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
          // progress is 0–1
          process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`)
        },
      })

      process.stdout.write('\n')

      // Read back as buffer
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
      // Clean up temp audio file
      try {
        if (fs.existsSync(audioTmpPath)) {
          fs.unlinkSync(audioTmpPath)
        }
      } catch {
        // ignore cleanup errors
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
