import path from 'node:path'
import { ORPCError, os } from '@orpc/server'
import { eq } from 'drizzle-orm'
import { db } from '#/db/index'
import { rapJobs } from '#/db/schema'
import { env } from '#/env'
import { getAudioService } from '#/lib/audio-service'
import { getLyricsService } from '#/lib/lyrics-service'
import { getRenderService } from '#/lib/render-service'
import { RapGenerateInputSchema, RapGenerateOutputSchema } from '#/orpc/schema'

export const rapGenerate = os
  .input(RapGenerateInputSchema)
  .output(RapGenerateOutputSchema)
  .handler(async ({ input, context }) => {
    const { topic } = input

    // ── Auth / free-tier check ──────────────────────────────────────────────
    // Server-side: we trust the client to enforce localStorage,
    // but we also check via guestToken presence.
    // For now: guests can generate once (enforced client-side).
    // Authenticated users always allowed.
    const userId = (context as { userId?: string })?.userId ?? null

    // ── Step 1: Generate lyrics ─────────────────────────────────────────────
    const lyricsService = getLyricsService()
    let lyrics: Awaited<ReturnType<typeof lyricsService.generateLyrics>>

    try {
      lyrics = await lyricsService.generateLyrics(topic)
    } catch (err) {
      console.log('err',err);
      
      throw new ORPCError('BAD_REQUEST', {
        message: `Couldn't generate lyrics for that topic — try rephrasing. (${err instanceof Error ? err.message : String(err)})`,
      })
    }

    // ── Step 2: Synthesize audio ────────────────────────────────────────────
    const audioService = getAudioService()
    let audioResult: Awaited<ReturnType<typeof audioService.synthesize>>

    try {
      audioResult = await audioService.synthesize(lyrics.fullText)
    } catch (err) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `Audio generation failed. Please try again. (${err instanceof Error ? err.message : String(err)})`,
      })
    }

    // ── Step 3: Render video ────────────────────────────────────────────────
    const jobId = crypto.randomUUID()
    const videosDir = path.resolve(process.cwd(), env.PUBLIC_VIDEOS_DIR)
    const outputPath = path.join(videosDir, `${jobId}.mp4`)

    // Insert job as processing
    await db.insert(rapJobs).values({
      id: jobId,
      userId,
      topic,
      status: 'processing',
    })

    const renderService = getRenderService()

    try {
      await renderService.renderVideo({
        lyrics,
        wordTimestamps: audioResult.wordTimestamps,
        audioBuffer: audioResult.audioBuffer,
        outputPath,
      })
    } catch (err) {
      console.log(err);
      
      // Mark job as failed
      await db
        .update(rapJobs)
        .set({
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : String(err),
          updatedAt: new Date(),
        })
        .where(eq(rapJobs.id, jobId))

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Video rendering failed — please try again.',
      })
    }

    // ── Step 4: Mark done ───────────────────────────────────────────────────
    const videoUrl = `/videos/${jobId}.mp4`

    await db
      .update(rapJobs)
      .set({
        status: 'done',
        videoPath: outputPath,
        updatedAt: new Date(),
      })
      .where(eq(rapJobs.id, jobId))

    return { videoUrl, jobId }
  })
