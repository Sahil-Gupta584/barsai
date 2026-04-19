import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { orpc } from '#/orpc/client'
import { SignInPrompt } from '#/components/SignInPrompt'
import { VideoPlayer } from '#/components/VideoPlayer'
import { checkFreeTier, markFreeTierUsed } from '#/lib/free-tier'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/rap')({
  component: RapGeneratorPage,
})

type Status = 'idle' | 'generating' | 'done' | 'error' | 'blocked'

const ERROR_MESSAGES: Record<string, string> = {
  LYRICS_PARSE_ERROR: "Couldn't generate lyrics for that topic — try rephrasing.",
  RENDER_FAILED: 'Video rendering failed — please try again.',
  UNAUTHORIZED: 'Sign in to generate more videos.',
  DEFAULT: 'Something went wrong. Please try again.',
}

const STAGE_LABELS = [
  '🎤 Writing lyrics...',
  '🎵 Generating audio...',
  '🎬 Rendering video...',
]

function useGenerationStages(isGenerating: boolean) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!isGenerating) {
      setStageIndex(0)
      return
    }
    // Cycle through stages every ~8s to give user feedback
    const timings = [0, 8000, 18000]
    const timers = timings.map((delay, i) =>
      setTimeout(() => setStageIndex(i), delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [isGenerating])

  return STAGE_LABELS[stageIndex]
}

function RapGeneratorPage() {
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  const stageLabel = useGenerationStages(status === 'generating')

  // Pre-fill topic from sessionStorage after sign-in redirect
  useEffect(() => {
    const pending = sessionStorage.getItem('rippy_pending_topic')
    if (pending) {
      setTopic(pending)
      sessionStorage.removeItem('rippy_pending_topic')
    }
  }, [])

  const mutation = useMutation({
    mutationFn: (t: string) => orpc.rap.generate.call({ topic: t }),
    onSuccess: (data) => {
      if (!isAuthenticated) markFreeTierUsed()
      setVideoUrl(data.videoUrl)
      setStatus('done')
    },
    onError: (err: Error) => {
      const code = (err as { code?: string }).code ?? 'DEFAULT'
      setError(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.DEFAULT)
      setStatus('error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = topic.trim()
    if (trimmed.length < 3) return

    // Check free tier
    const { allowed, requiresAuth } = checkFreeTier(isAuthenticated)
    if (!allowed && requiresAuth) {
      setStatus('blocked')
      return
    }

    setStatus('generating')
    setError(null)
    setVideoUrl(null)
    mutation.mutate(trimmed)
  }

  const handleReset = () => {
    setStatus('idle')
    setVideoUrl(null)
    setError(null)
    setTopic('')
  }
console.log({topic});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-start px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-3">
          <span className="text-yellow-400">Rippy</span>
        </h1>
        <p className="text-white/50 text-lg">
          Drop a topic. Get a rap video.
        </p>
      </div>

      {/* Main content */}
      <div className="w-full max-w-xl">
        {/* Blocked — free tier exhausted */}
        {status === 'blocked' && (
          <SignInPrompt topic={topic} />
        )}

        {/* Done — show video */}
        {status === 'done' && videoUrl && (
          <div className="flex flex-col gap-6">
            <VideoPlayer src={videoUrl} topic={topic} />
            <button
              type="button"
              onClick={handleReset}
              className="text-white/40 hover:text-white/70 text-sm text-center transition-colors"
            >
              Make another rap →
            </button>
          </div>
        )}

        {/* Idle or error — show form */}
        {(status === 'idle' || status === 'error') && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => {
                  console.log(e);
                   setTopic(e.target.value)}}
                placeholder="e.g. daily routine of a nerd programmer"
                maxLength={200}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-base resize-none focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
              <span className="absolute bottom-3 right-4 text-white/20 text-xs">
                {topic.length}/200
              </span>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={topic.trim().length < 3}
              className="w-full py-4 rounded-2xl bg-yellow-400 text-black font-black text-lg hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Generate Rap 🎤
            </button>

            {!isAuthenticated && (
              <p className="text-white/25 text-xs text-center">
                1 free rap • Sign in for unlimited
              </p>
            )}
          </form>
        )}

        {/* Generating — loading state */}
        {status === 'generating' && (
          <div className="flex flex-col items-center gap-8 py-12">
            {/* Animated bars */}
            <div className="flex items-end gap-1.5 h-12">
              {[...Array(7)].map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static bars
                  key={i}
                  className="w-2 bg-yellow-400 rounded-full"
                  style={{
                    height: `${30 + Math.sin(i * 0.8) * 20}%`,
                    animation: `bounce 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <p className="text-white/70 text-base font-medium">{stageLabel}</p>
            <p className="text-white/30 text-sm">This takes ~30–60 seconds</p>
          </div>
        )}
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
