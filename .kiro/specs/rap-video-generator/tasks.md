# Implementation Plan: Rap Video Generator (Rippy)

## Overview

Implement the full Rippy pipeline: topic input → Gemini lyrics → ElevenLabs audio with word timestamps → Remotion server-side MP4 render → video playback. Build incrementally: data layer first, then services, then the oRPC procedure, then the UI.

## Tasks

- [-] 1. Install dependencies and extend environment config
  - Run `pnpm add remotion @remotion/renderer @remotion/player elevenlabs` and `pnpm add -D fast-check`
  - Add `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` to `src/env.ts` as server-only `z.string()` fields
  - Add `PUBLIC_VIDEOS_DIR` (server-only, defaults to `public/videos`) for local MP4 storage
  - _Requirements: all pipeline steps depend on these env vars_

- [ ] 2. Add `rapJobs` Drizzle schema and run migration
  - [x] 2.1 Add `rapJobs` table to `src/db/schema.ts`
    - Columns: `id` (uuid, PK), `userId` (text, nullable), `topic` (text), `status` (text enum: pending/processing/done/failed), `videoPath` (text, nullable), `errorMessage` (text, nullable), `createdAt` (timestamp), `updatedAt` (timestamp)
    - _Requirements: RapJob data model_
  - [ ] 2.2 Generate and apply migration
    - Run `pnpm db:generate` then `pnpm db:push` (or `db:migrate`)
    - _Requirements: RapJob data model_

- [ ] 3. Define shared TypeScript types and Zod schemas
  - [x] 3.1 Create `src/lib/rap-types.ts` with all shared interfaces
    - Export `LyricsLine`, `LyricsSection`, `LyricsDocument`, `WordTimestamp`, `StylePreset`, `AnimationType`, `SectionType`, `AudioResult`, `RenderInput`
    - Export `STYLE_PRESETS` constant mapping each `SectionType` to a `StylePreset` (Impact/pop for hook, Bebas Neue/slide for verse, Montserrat/shake for bridge, Impact/glow for outro)
    - _Requirements: Data models section_
  - [x] 3.2 Create `src/orpc/schema.ts` additions — add `RapGenerateInputSchema` and `RapGenerateOutputSchema` using Zod
    - Input: `{ topic: z.string().min(3).max(200), guestToken: z.string().optional() }`
    - Output: `{ videoUrl: z.string(), jobId: z.string() }`
    - _Requirements: rap.generate procedure interface_
  - [ ]* 3.3 Write property test: style preset completeness
    - **Property 4: Style Consistency** — for every `SectionType` value, `STYLE_PRESETS[type]` is defined and has all required fields (`fontFamily`, `color`, `accentColor`, `animation`, `fontSize`, `textTransform`)
    - **Validates: Requirements — StylePreset data model**
    - Use `fast-check` in `src/lib/__tests__/rap-types.test.ts`

- [ ] 4. Implement `LyricsService`
  - [x] 4.1 Create `src/lib/lyrics-service.ts`
    - Use `@tanstack/ai-gemini` to call Gemini with a prompt that requests structured rap lyrics with `[Hook]`, `[Verse N]`, `[Bridge]`, `[Outro]` section labels
    - Implement `parseLyricsFromGemini(rawText, topic)` following the pseudocode in the design: split on newlines, detect section headers via regex, tokenize lines into words, build `LyricsDocument`
    - Assign `stylePreset` from `STYLE_PRESETS` to each section by type
    - Throw `LyricsGenerationError` (custom error class) if parsing yields 0 sections or empty content
    - Export `lyricsService` singleton
    - _Requirements: generateLyrics spec, parseLyricsFromGemini pseudocode_
  - [ ]* 4.2 Write unit tests for `parseLyricsFromGemini` in `src/lib/__tests__/lyrics-service.test.ts`
    - Test: valid multi-section input produces correct section count and `fullText`
    - Test: missing section labels throws `LyricsGenerationError`
    - Test: empty string throws `LyricsGenerationError`
    - _Requirements: generateLyrics error handling_

- [ ] 5. Implement `AudioService`
  - [x] 5.1 Create `src/lib/audio-service.ts`
    - Use the `elevenlabs` SDK to call `client.textToSpeech.convertWithTimestamps(voiceId, { text, modelId: 'eleven_multilingual_v2' })`
    - Map ElevenLabs `alignment.characters` / `words` response to `WordTimestamp[]`
    - Sort timestamps ascending by `startTime`
    - Implement fallback: if alignment data is absent, distribute words evenly across `durationSeconds`
    - Throw `AudioSynthesisError` (custom error class) on API failure
    - Export `audioService` singleton
    - _Requirements: synthesize spec, WordTimestamp model_
  - [ ]* 5.2 Write property test for timestamp monotonicity in `src/lib/__tests__/audio-service.test.ts`
    - **Property 1: Timestamp Monotonicity** — for any `WordTimestamp[]` returned by the fallback distributor, `timestamps[i].startTime < timestamps[i+1].startTime` for all valid `i`
    - **Validates: Requirements — Correctness Property 1**
    - Use `fast-check` to generate arbitrary word lists and durations
  - [ ]* 5.3 Write unit tests for `AudioService`
    - Test: fallback evenly distributes N words across duration
    - Test: sorted output even when input is unordered
    - _Requirements: synthesize postconditions_

- [ ] 6. Implement Remotion composition
  - [x] 6.1 Create `src/remotion/RapVideoComposition.tsx`
    - Implement `RapVideoComposition` component with `RapVideoProps` interface
    - Dark background `#0a0a0a`, 1080×1080 canvas
    - Use Remotion's `useCurrentFrame()` and `useVideoConfig()` hooks
    - Implement `getVisibleWords(wordTimestamps, currentFrame, fps)` pure function (design pseudocode)
    - Render visible words with their section's `StylePreset` (font, color, size, transform)
    - _Requirements: RapVideoComposition component, getVisibleWords pseudocode_
  - [x] 6.2 Implement word animation in `src/remotion/animations.ts`
    - Implement `getWordAnimationStyle(animationType, progress)` following the design pseudocode exactly for all four types: `pop`, `slide`, `shake`, `glow`
    - Use Remotion's `interpolate` for smooth transitions
    - _Requirements: getWordAnimationStyle pseudocode, AnimationType_
  - [ ]* 6.3 Write property test for frame determinism in `src/remotion/__tests__/composition.test.ts`
    - **Property 3: Frame Determinism** — `getVisibleWords(ts, f, fps)` called twice with identical arguments returns identical results (referential equality of word objects)
    - **Validates: Requirements — Correctness Property 3**
    - Use `fast-check` to generate arbitrary timestamp arrays and frame numbers
  - [ ]* 6.4 Write unit tests for `getWordAnimationStyle`
    - Test each animation type at `progress = 0`, `0.5`, `1.0`
    - Verify `pop` at progress=0 has scale≈0, at progress=1 has scale≈1
    - _Requirements: getWordAnimationStyle spec_
  - [x] 6.5 Register Remotion composition in `src/remotion/index.ts`
    - Export `registerRoot` with `<Composition>` for `RapVideoComposition` (id: `'RapVideo'`, fps: 30, width: 1080, height: 1080)
    - _Requirements: renderVideo precondition — composition must be registered_

- [ ] 7. Implement `RenderService`
  - [x] 7.1 Create `src/lib/render-service.ts`
    - Import `renderMedia`, `selectComposition` from `@remotion/renderer`
    - Write audio buffer to a temp file (use `os.tmpdir()`), pass as `audioSrc` to Remotion
    - Call `renderMedia` with codec `'h264'`, composition `'RapVideo'`, `inputProps: { lyrics, wordTimestamps, durationInFrames, fps: 30 }`
    - Compute `durationInFrames = Math.ceil((lastWordTimestamp.endTime + 0.5) * 30)` per design spec
    - Read output MP4 into a `Buffer` and return it
    - Throw `RenderError` on failure; clean up temp files in `finally`
    - Export `renderService` singleton
    - _Requirements: renderVideo spec, Video Duration Bound property 6_
  - [ ]* 7.2 Write unit tests for duration calculation in `src/lib/__tests__/render-service.test.ts`
    - Test: `durationInFrames` equals `ceil((lastEndTime + 0.5) * 30)` for various inputs
    - **Property 6: Video Duration Bound** — for any non-empty `WordTimestamp[]`, computed frames always exceed `lastEndTime * fps`
    - **Validates: Requirements — Correctness Property 6**

- [ ] 8. Checkpoint — Ensure all unit and property tests pass
  - Run `pnpm test` and confirm all tests in tasks 3–7 pass. Ask the user if any issues arise.

- [ ] 9. Implement `rap.generate` oRPC procedure
  - [x] 9.1 Create `src/orpc/router/rap.ts`
    - Implement `rapGenerate` procedure with `RapGenerateInputSchema` input
    - Follow the main pipeline pseudocode: auth check → `lyricsService.generateLyrics` → `audioService.synthesize` → assign style presets → `renderService.renderVideo` → write MP4 to `public/videos/{jobId}.mp4` → insert `rapJobs` row → return `{ videoUrl, jobId }`
    - Use `os` from `@orpc/server`; access `db` from `src/db/index.ts`
    - Enforce free-tier: if no session and `guestToken` indicates already used, throw `ORPCError` with code `UNAUTHORIZED`
    - Set `rapJobs.status = 'failed'` and rethrow on any pipeline error
    - _Requirements: rapGenerate procedure pseudocode, free-tier enforcement_
  - [x] 9.2 Register `rap` router in `src/orpc/router/index.ts`
    - Add `rap: { generate: rapGenerate }` to the exported router object
    - _Requirements: oRPC client call pattern_
  - [ ]* 9.3 Write integration test for `rap.generate` in `src/orpc/router/__tests__/rap.test.ts`
    - Mock `lyricsService`, `audioService`, `renderService` and the DB
    - Test happy path: returns `{ videoUrl, jobId }` and inserts a `done` row
    - Test free-tier: second guest call returns `UNAUTHORIZED` error
    - **Property 5: Free Tier Enforcement** — a guest token can only succeed once
    - **Validates: Requirements — Correctness Property 5**

- [x] 10. Implement `checkFreeTier` client utility
  - Create `src/lib/free-tier.ts` with `checkFreeTier(): { allowed: boolean; requiresAuth: boolean }`
  - Logic: if authenticated → `{ allowed: true, requiresAuth: false }`; if `localStorage.getItem('rippy_free_used') === null` → `{ allowed: true, requiresAuth: false }`; else → `{ allowed: false, requiresAuth: true }`
  - Export `markFreeTierUsed()` that sets `localStorage.setItem('rippy_free_used', 'true')`
  - _Requirements: checkFreeTier spec, free-tier sequence diagram_

- [ ] 11. Build the `RapGeneratorPage` UI
  - [x] 11.1 Create `src/routes/rap.tsx` as a TanStack route
    - Implement `RapGeneratorPage` with `GeneratorState` shape: `{ topic, status, videoUrl, jobId, error }`
    - Topic input (textarea, 3–200 chars), "Generate" button, status messages for each pipeline stage
    - On submit: call `checkFreeTier()` first; if not allowed, render `<SignInPrompt topic={topic} />`; otherwise call `orpc.rap.generate` via TanStack Query mutation
    - On success: set `markFreeTierUsed()` if guest, then render `<VideoPlayer>` and download link
    - On error: display user-friendly message per error code (`LYRICS_PARSE_ERROR`, `RENDER_FAILED`, `UNAUTHORIZED`)
    - _Requirements: RapGeneratorPage component, free-tier sequence diagram_
  - [x] 11.2 Create `src/components/SignInPrompt.tsx`
    - Accept `{ topic: string }` props
    - Show "Sign in to generate more videos" message with a sign-in button (use Better Auth `authClient.signIn`)
    - Store `topic` in `sessionStorage` so it can be pre-filled after redirect
    - _Requirements: SignInPrompt component, Scenario 4 error handling_
  - [x] 11.3 Create `src/components/VideoPlayer.tsx`
    - Accept `{ src: string }` props
    - Use `@remotion/player` `<Player>` component for in-browser preview, with a fallback `<video>` tag
    - Include a download `<a href={src} download>` button
    - _Requirements: RapGeneratorPage — VideoPlayer and download link_

- [ ] 12. Add nav link and wire up route
  - Add a "Rippy" nav link to `src/components/Header.tsx` pointing to `/rap`
  - Ensure `public/videos/` directory exists (add a `.gitkeep`)
  - _Requirements: RapGeneratorPage is accessible_

- [ ] 13. Final checkpoint — End-to-end smoke test
  - Run `pnpm test` to confirm all tests pass
  - Manually verify: navigate to `/rap`, enter a topic, confirm the full pipeline runs and a video is returned
  - Ask the user if any issues arise before considering the feature complete.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` and validate the six correctness properties from the design
- Remotion rendering is always server-side (`@remotion/renderer`) — never in the browser
- ElevenLabs word timestamps are the primary sync mechanism; the fallback (even distribution) is a degraded-quality safety net
- MP4 files are stored under `public/videos/` locally; swap for S3 in production
- The `guestToken` free-tier check is enforced both client-side (localStorage) and server-side (oRPC procedure)
