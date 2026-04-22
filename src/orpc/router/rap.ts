import fs from 'fs'
import { os, ORPCError } from '@orpc/server'
import path from 'node:path'
import { v4 as uuid } from 'uuid'
import { eq, count } from 'drizzle-orm'
import { RapGenerateInputSchema } from '../schema'
import { getLyricsService } from '#/lib/lyrics-service'
import { getAudioService } from '#/lib/audio-service'
import { getBeat } from '#/lib/beat-service'
import { getRenderService } from '#/lib/render-service'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import { rapJobs } from '#/db/schema'
import { testingAudioResult, testingLyrics } from '#/lib/utils'
import { env } from '#/env'

export const rapGenerate = os
  .input(RapGenerateInputSchema)
  .handler(async ({ input, context }) => {
    const request = (context as any).request as Request
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user.id

    if (!userId) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Sign in to generate videos.' })
    }

    // Check Limits (Max 2)
    const [stats] = await db.select({ value: count() }).from(rapJobs).where(eq(rapJobs.userId, userId))
    if (stats.value >= 2) {
      throw new ORPCError('FORBIDDEN', { message: 'You have reached the limit of 2 videos.' })
    }

    const jobId = uuid()
    const outputPath = path.resolve(process.cwd(), 'public/videos', `${jobId}.mp4`)

    try {
      // 1. Generate Lyrics
      const lyrics = await getLyricsService().generateLyrics(input.topic)
      if (!lyrics) throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'LYRICS_PARSE_ERROR' })

      // 2. Generate Audio (Voice)
      const audioResult = await getAudioService().synthesize(lyrics.fullText)
      const { audioBuffer, wordTimestamps } = audioResult
      const beatBuffer = getBeat()

      // Record job in DB
      await db.insert(rapJobs).values({
        userId,
        topic: input.topic,
        status: 'done',
      })

      // 3. Render Video (Auto-switches to Lambda if configured)
      const result = await getRenderService().render({
        lyrics,
        wordTimestamps,
        audioBuffer,
        beatBuffer,
        outputPath,
      })

      if (!result.videoUrl && result.buffer) {
        fs.writeFileSync(outputPath, result.buffer)
      }

      const finalVideoUrl = result.videoUrl || `${process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'}/videos/${jobId}.mp4`

      return {
        videoUrl: finalVideoUrl,
        jobId,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[rap.generate] failed:', message)
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message })
    }
  })

export const rapPreview = os
  .input(RapGenerateInputSchema)
  .handler(async ({ input, context }) => {
    const request = (context as any).request as Request
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user.id

    // Check limits if logged in
    if (userId) {
      const [stats] = await db.select({ value: count() }).from(rapJobs).where(eq(rapJobs.userId, userId))
      if (stats.value >= 2) {
        throw new ORPCError('FORBIDDEN', { message: 'You have reached your limit of 2 raps.' })
      }
    }

    const jobId = uuid()

    try {
      // 1. Generate Lyrics
      const lyrics = await getLyricsService().generateLyrics(input.topic)
      // const lyrics = testingLyrics
      // console.log('lyrics', JSON.stringify(lyrics));

      if (!lyrics) throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'LYRICS_PARSE_ERROR' })

      // 2. Generate Audio
      const { audioBuffer, wordTimestamps } = await getAudioService().synthesize(lyrics.fullText)
      // const { audioBuffer, wordTimestamps } = {
      //   audioBuffer: fs.readFileSync(`./public/videos/${'f78452f8-b51a-4e68-87e3-d63d6e645d09'}.mp3`),
      //   wordTimestamps: testingAudioResult
      // }

      // console.log('wordTimestamps', JSON.stringify(wordTimestamps));

      // fs.writeFileSync(`./public/videos/${jobId}.mp3`, audioBuffer)

      // Use Data URL for Vercel compatibility instead of local file writing
      const audioUrl = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`

      const serverUrl = env.BETTER_AUTH_URL ?? 'http://localhost:3000'
      const beatUrl = `${serverUrl}/beats/hook.mp3`
      const punchUrl = `${serverUrl}/beats/punch.mp3`

      // Record usage in DB if user is logged in
      if (userId) {
        await db.insert(rapJobs).values({
          userId,
          topic: input.topic,
          status: 'done',
        })
      }

      return {
        lyrics,
        wordTimestamps,
        audioUrl,
        beatUrl,
        punchUrl,
        jobId,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[rap.preview] failed:', message)
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message })
    }
  })
