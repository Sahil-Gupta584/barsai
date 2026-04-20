import { useState } from 'react'
import { authClient } from '#/lib/auth-client'

interface SignInPromptProps {
  topic: string
}

export function SignInPrompt({ topic }: SignInPromptProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveTopic = () => sessionStorage.setItem('rippy_pending_topic', topic)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    saveTopic()
    const result = await authClient.signIn.magicLink({ email, callbackURL: '/rap' })
    setLoading(false)
    if (result.error) setError(result.error.message ?? 'Failed to send link')
    else setSent(true)
  }

  const handleGoogle = async () => {
    saveTopic()
    await authClient.signIn.social({ provider: 'google', callbackURL: '/rap' })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-white/10 bg-white/5 text-center max-w-md mx-auto">
        <div className="text-4xl">📬</div>
        <h3 className="text-xl font-bold text-white">Check your inbox</h3>
        <p className="text-white/50 text-sm">Magic link sent to <span className="text-yellow-400">{email}</span></p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 p-8 rounded-2xl border border-white/10 bg-white/5 text-center max-w-md mx-auto">
      <div className="text-4xl">🎤</div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">You've used your free rap</h3>
        <p className="text-white/50 text-sm">Sign in for unlimited raps. It's free.</p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full py-3 px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Magic link */}
      <form onSubmit={handleMagicLink} className="w-full flex flex-col gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-400/60"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : '✉️ Send magic link'}
        </button>
      </form>

      <p className="text-white/20 text-xs">
        Topic saved: "{topic.slice(0, 40)}{topic.length > 40 ? '…' : ''}"
      </p>
    </div>
  )
}
