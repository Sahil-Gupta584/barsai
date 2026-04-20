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

const STAGES = [
  { label: 'WRITING BARS', sub: 'AI is cooking...' },
  { label: 'VOICING IT', sub: 'ElevenLabs spitting...' },
  { label: 'RENDERING', sub: 'Captions going hard...' },
]

function RapGeneratorPage() {
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stageIndex, setStageIndex] = useState(0)

  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  // Pre-fill topic from sessionStorage after sign-in redirect
  useEffect(() => {
    const pending = sessionStorage.getItem('rippy_pending_topic')
    if (pending) {
      setTopic(pending)
      sessionStorage.removeItem('rippy_pending_topic')
    }
  }, [])

  // Cycle through stages while generating
  useEffect(() => {
    if (status !== 'generating') { setStageIndex(0); return }
    const timers = [
      setTimeout(() => setStageIndex(0), 0),
      setTimeout(() => setStageIndex(1), 8000),
      setTimeout(() => setStageIndex(2), 20000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [status])

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
    const { allowed, requiresAuth } = checkFreeTier(isAuthenticated)
    if (!allowed && requiresAuth) { setStatus('blocked'); return }
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

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-mono-custom { font-family: 'Space Mono', monospace; }
        .input-bar {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(250,204,21,0.3);
          color: white;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-bar:focus {
          outline: none;
          border-color: rgba(250,204,21,0.9);
          box-shadow: 0 0 0 2px rgba(250,204,21,0.15);
        }
        .input-bar::placeholder { color: rgba(255,255,255,0.25); }
        .cta-btn {
          background: #facc15; color: #000;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.1em;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(250,204,21,0.4); }
        .cta-btn:active { transform: scale(0.97); }
        .cta-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(250,204,21,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes barBounce {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
        @keyframes scanline {
          0% { top: -10%; } 100% { top: 110%; }
        }
        .scanline {
          position: fixed; left: 0; width: 100%;
          height: 2px; background: rgba(250,204,21,0.06);
          animation: scanline 6s linear infinite;
          pointer-events: none; z-index: 50;
        }
      `}</style>

      <div className="scanline" />
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-50" />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(250,204,21,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-yellow-400/50 text-xs tracking-[0.3em] font-mono-custom mb-3">BARS.AI</p>
          <h1 className="font-display text-7xl md:text-9xl tracking-wider leading-none">
            <span className="text-white">DROP A </span>
            <span className="text-yellow-400">TOPIC</span>
          </h1>
          <p className="mt-4 text-white/30 text-sm font-mono-custom tracking-widest">
            WE WRITE THE BARS. VOICE THEM. RENDER THE VIDEO.
          </p>
        </div>

        {/* Main content */}
        <div className="w-full max-w-xl">

          {/* Blocked */}
          {status === 'blocked' && <SignInPrompt topic={topic} />}

          {/* Done */}
          {status === 'done' && videoUrl && (
            <div className="flex flex-col gap-6">
              <VideoPlayer src={videoUrl} topic={topic} />
              <button
                type="button"
                onClick={handleReset}
                className="font-mono-custom text-yellow-400/50 hover:text-yellow-400 text-xs text-center tracking-widest transition-colors"
              >
                ← DROP ANOTHER TOPIC
              </button>
            </div>
          )}

          {/* Form */}
          {(status === 'idle' || status === 'error') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e as unknown as React.FormEvent)
                    }
                  }}
                  placeholder="e.g. daily routine of a nerd programmer..."
                  maxLength={200}
                  rows={3}
                  className="input-bar w-full px-5 py-4 text-sm font-mono-custom rounded-sm resize-none"
                />
                <span className="absolute bottom-3 right-4 text-white/20 text-xs font-mono-custom">
                  {topic.length}/200
                </span>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-mono-custom text-center tracking-wide">{error}</p>
              )}

              <button
                type="submit"
                disabled={topic.trim().length < 3}
                className="cta-btn w-full py-4 text-2xl rounded-sm"
              >
                GENERATE RAP →
              </button>

              {!isAuthenticated && (
                <p className="text-white/20 text-xs text-center font-mono-custom tracking-widest">
                  1 FREE RAP · SIGN IN FOR UNLIMITED
                </p>
              )}
            </form>
          )}

          {/* Generating */}
          {status === 'generating' && (
            <div className="flex flex-col items-center gap-8 py-8">
              {/* Audio bars */}
              <div className="flex items-end gap-1 h-16">
                {Array(20).fill(null).map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static
                    key={i}
                    className="w-2 bg-yellow-400 rounded-t-sm"
                    style={{
                      height: `${25 + Math.sin(i * 0.9) * 20}px`,
                      animation: `barBounce ${0.4 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
              <div className="text-center">
                <p className="font-display text-3xl tracking-widest text-yellow-400">
                  {STAGES[stageIndex].label}
                </p>
                <p className="text-white/30 text-xs font-mono-custom mt-2 tracking-widest">
                  {STAGES[stageIndex].sub}
                </p>
              </div>
              <p className="text-white/20 text-xs font-mono-custom tracking-widest">
                THIS TAKES ~30–60 SECONDS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
