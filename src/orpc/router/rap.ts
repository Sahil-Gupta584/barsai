import fs from 'fs'
import { os, ORPCError } from '@orpc/server'
import path from 'node:path'
import { v4 as uuid } from 'uuid'
import { RapGenerateInputSchema } from '../schema'
import { getLyricsService } from '#/lib/lyrics-service'
import { getAudioService } from '#/lib/audio-service'
import { getBeat } from '#/lib/beat-service'
import { getRenderService } from '#/lib/render-service'
import { testingAudioResult, testingLyrics } from '#/lib/utils'

export const rapGenerate = os
  .input(RapGenerateInputSchema)
  .handler(async ({ input }) => {
    const jobId = uuid()
    const outputPath = path.resolve(process.cwd(), 'public/videos', `${jobId}.mp4`)

    try {
      // const lyrics = await getLyricsService().generateLyrics(input.topic)
      // console.log('lyrics', JSON.stringify(lyrics));
      const lyrics = testingLyrics
      const videosPath = path.resolve(process.cwd(), 'public/videos', `${'33dae322-17ea-4ba9-9cab-ea64b97b4ff9'}.mp3`)
      // const { audioBuffer, wordTimestamps } = await getAudioService().synthesize(lyrics.fullText)
      // console.log(JSON.stringify({ wordTimestamps }));

      // Testing with pre-recorded audio:
      const { audioBuffer, wordTimestamps } = {
        audioBuffer: fs.readFileSync(videosPath),
        wordTimestamps: testingAudioResult.wordTimestamps
      }

      // fs.writeFileSync(videosPath, audioBuffer)

      const beatBuffer = getBeat()
      await getRenderService().renderVideo({
        lyrics,
        wordTimestamps,
        audioBuffer,
        beatBuffer,
        outputPath
      })

      const serverUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
      const videoUrl = `${serverUrl}/videos/${jobId}.mp4`

      return {
        videoUrl,
        jobId
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[rap.generate] failed:', message)
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message })
    }
  })
