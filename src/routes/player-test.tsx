import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { orpc } from '#/orpc/client'
import { Player } from '@remotion/player'
import { RapVideoComposition } from '#/remotion/RapVideoComposition'

export const Route = createFileRoute('/player-test')({
  component: PlayerTestPage,
})

function PlayerTestPage() {
  const [topic, setTopic] = useState('nerd programmer')
  const [data, setData] = useState<any>(null)

  const mutation = useMutation({
    mutationFn: (t: string) => orpc.rap.preview.call({ topic: t }),
    onSuccess: (res) => {
      setData(res)
    },
  })

  return (
    <div className="min-h-screen bg-black text-white p-12 font-mono">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">CLIENT-SIDE PLAYER TEST</h1>
      
      {!data ? (
        <div className="flex flex-col gap-4 max-w-md">
          <input 
            className="bg-zinc-900 border border-zinc-800 p-4 rounded text-white"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button 
            className="bg-yellow-400 text-black p-4 font-bold rounded hover:bg-yellow-500 transition-colors"
            onClick={() => mutation.mutate(topic)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'FETCHING METADATA...' : 'LOAD PLAYER'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="border-4 border-yellow-400 rounded-lg overflow-hidden shadow-2xl shadow-yellow-400/20 max-w-3xl">
            <Player
              component={RapVideoComposition}
              inputProps={{
                lyrics: data.lyrics,
                wordTimestamps: data.wordTimestamps,
                audioSrc: data.audioUrl,
                beatSrc: data.beatUrl,
                punchSrc: data.punchUrl,
                durationInFrames: 30 * 45, // approx 45s for test
                fps: 30,
              }}
              durationInFrames={30 * 45} // You might want to compute this accurately
              fps={30}
              compositionWidth={1080}
              compositionHeight={1080}
              style={{
                width: '100%',
                aspectRatio: '1',
              }}
              controls
              autoPlay
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              className="text-zinc-500 hover:text-white underline"
              onClick={() => setData(null)}
            >
              ← GO BACK
            </button>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg text-xs leading-relaxed max-w-3xl border border-zinc-800 text-zinc-400">
             <h3 className="text-yellow-400 font-bold mb-2">DEBUG INFO:</h3>
             <pre>{JSON.stringify({
               jobId: data.jobId,
               audio: data.audioUrl,
               lyricsCount: data.lyrics.sections.length
             }, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
