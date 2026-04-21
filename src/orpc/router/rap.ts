import fs from 'node:fs'
import { os, ORPCError } from '@orpc/server'
import path from 'node:path'
import { v4 as uuid } from 'uuid'
import { RapGenerateInputSchema } from '../schema'
import { getLyricsService } from '#/lib/lyrics-service'
import { getAudioService } from '#/lib/audio-service'
import { getBeat } from '#/lib/beat-service'
import { getRenderService } from '#/lib/render-service'
import { env } from '#/env'
import { testingAudioResult } from '#/lib/utils'

export const rapGenerate = os
  .input(RapGenerateInputSchema)
  .handler(async ({ input }) => {
    const jobId = uuid()
    const outputPath = path.resolve(process.cwd(), env.PUBLIC_VIDEOS_DIR, `${jobId}.mp4`)

    try {
      const lyrics = await getLyricsService().generateLyrics(input.topic)
      // console.log('lyrics',JSON.stringify(lyrics));
      
      const { audioBuffer, wordTimestamps,durationSeconds } = await getAudioService().synthesize(lyrics.fullText)
      // const { audioBuffer, wordTimestamps }={
      //   audioBuffer:fs.readFileSync(path.resolve(process.cwd(), env.PUBLIC_VIDEOS_DIR, `${'90962e6b-7e90-4d9b-bda2-63c4797c66ef'}-audio.mp3`)),
      //   wordTimestamps:testingAudioResult.wordTimestamps
      // }
      // fs.writeFileSync(path.resolve(process.cwd(), env.PUBLIC_VIDEOS_DIR, `${jobId}-audio.mp3`), audioBuffer)
      // console.log(JSON.stringify({wordTimestamps,durationSeconds}));
      
      const beatBuffer = getBeat()
      await getRenderService().renderVideo({ lyrics, wordTimestamps, audioBuffer, beatBuffer, outputPath })
      return { videoUrl: `/videos/${jobId}.mp4`, jobId }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[rap.generate] failed:', message)
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message })
    }
  })
