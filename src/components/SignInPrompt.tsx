import { authClient } from '#/lib/auth-client'

interface SignInPromptProps {
  topic: string
}

export function SignInPrompt({ topic }: SignInPromptProps) {
  const handleSignIn = async () => {
    // Store topic so we can pre-fill after redirect
    sessionStorage.setItem('rippy_pending_topic', topic)
    await authClient.signIn.social({ provider: 'google', callbackURL: '/rap' })
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-white/10 bg-white/5 text-center max-w-md mx-auto">
      <div className="text-4xl">🎤</div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          You've used your free rap
        </h3>
        <p className="text-white/60 text-sm">
          Sign in to generate unlimited raps. It's free.
        </p>
      </div>
      <button
        type="button"
        onClick={handleSignIn}
        className="w-full py-3 px-6 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition-colors"
      >
        Sign in to keep rapping
      </button>
      <p className="text-white/30 text-xs">
        Topic saved: "{topic.slice(0, 40)}{topic.length > 40 ? '…' : ''}"
      </p>
    </div>
  )
}
