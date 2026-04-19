import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-7xl mb-6">🎤</div>

        <h1 className="text-6xl font-black tracking-tight mb-4">
          <span className="text-yellow-400">Rippy</span>
        </h1>

        <p className="text-white/60 text-xl mb-10 leading-relaxed">
          Drop a topic. Get a rap video.
          <br />
          AI-generated lyrics, voice, and animated captions.
        </p>

        <Link
          to="/rap"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-yellow-400 text-black font-black text-xl hover:bg-yellow-300 transition-all"
        >
          Start Rapping →
        </Link>

        <p className="text-white/25 text-sm mt-6">
          1 free rap • No sign-up required
        </p>
      </div>
    </div>
  )
}
