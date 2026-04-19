import { Download } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  topic: string
}

export function VideoPlayer({ src, topic }: VideoPlayerProps) {
  const filename = `rippy-${topic.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.mp4`

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* Video */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        {/* biome-ignore lint/a11y/useMediaCaption: rap video has embedded captions */}
        <video
          src={src}
          controls
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Download button */}
      <a
        href={src}
        download={filename}
        className="flex items-center gap-2 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/10"
      >
        <Download size={16} />
        Download MP4
      </a>
    </div>
  )
}
