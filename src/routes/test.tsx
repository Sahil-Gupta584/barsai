import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ClientRenderer } from '#/lib/client-renderer'
import { testingLyrics, testingAudioResult } from '#/lib/utils'

export const Route = createFileRoute('/test')({
  component: TestPage,
})

export function TestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ClientRenderer | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'rendering' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Use the actual audio file that exists
  const audioSrc = '/videos/4e29ebac-0e13-4afe-bee2-c558f12e1ba7-audio.mp3'
  // Beat file doesn't exist yet - can add later
  const beatSrc = undefined

  // Initialize renderer when canvas is ready
  useEffect(() => {
    if (!canvasRef.current) return

    setStatus('loading')
    
    try {
      const renderer = new ClientRenderer(canvasRef.current, {
        lyrics: testingLyrics,
        wordTimestamps: testingAudioResult.wordTimestamps,
        audioSrc,
        beatSrc,
      }, { showDebug: true })
      
      rendererRef.current = renderer
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize renderer')
      setStatus('error')
    }

    return () => {
      rendererRef.current?.destroy()
    }
  }, [audioSrc])

  // Listen for render complete event
  useEffect(() => {
    const handleComplete = (e: Event) => {
      const blob = (e as CustomEvent).detail as Blob
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      setStatus('done')
      setProgress(100)
    }

    window.addEventListener('videoRenderComplete', handleComplete)
    return () => window.removeEventListener('videoRenderComplete', handleComplete)
  }, [])

  const startRender = useCallback(async () => {
    if (!rendererRef.current) {
      console.error('Renderer not initialized')
      return
    }

    console.log('Starting render...')
    setStatus('rendering')
    setProgress(0)
    setError(null)
    setVideoUrl(null)

    try {
      console.log('Calling startRecording...')
      await rendererRef.current.startRecording((progress) => {
        console.log('Progress:', progress.toFixed(1) + '%')
        setProgress(progress)
      })
      console.log('startRecording returned')
    } catch (err) {
      console.error('Render failed:', err)
      setError(err instanceof Error ? err.message : 'Render failed')
      setStatus('error')
    }
  }, [])

  const stopRender = useCallback(() => {
    rendererRef.current?.stopRecording()
  }, [])

  const downloadVideo = useCallback(() => {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = 'rap-video.webm'
    a.click()
  }, [videoUrl])

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-2'>Client-Side Video Renderer</h1>
        <p className='text-gray-400 mb-8'>
          Testing canvas-based rendering with MediaRecorder (replaces server-side Remotion)
        </p>

        <div className='grid gap-8'>
          {/* Canvas Preview */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>Preview (1080x1080)</h2>
            <div className='border-2 border-yellow-400 rounded-lg overflow-hidden inline-block'>
              <canvas
                ref={canvasRef}
                style={{
                  width: '540px',
                  height: '540px',
                  display: 'block',
                }}
              />
            </div>
            {status === 'loading' && (
              <p className='text-yellow-400 mt-2'>Loading renderer...</p>
            )}
          </div>

          {/* Controls */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>Video Export Controls</h2>

            {error && (
              <div className='mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm'>
                {error}
              </div>
            )}

            {status === 'rendering' && (
              <div className='mb-4'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
                  <span className='text-red-400'>Rendering video...</span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className='bg-yellow-400 h-2 rounded-full transition-all'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className='text-sm text-gray-400 mt-1'>
                  Video will auto-stop when complete (~40 seconds)
                </p>
              </div>
            )}

            <div className='flex gap-4'>
              {status === 'idle' && (
                <button
                  onClick={startRender}
                  className='px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors'
                >
                  Render Video
                </button>
              )}

              {status === 'rendering' && (
                <button
                  onClick={stopRender}
                  className='px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors'
                >
                  Stop
                </button>
              )}

              {status === 'done' && videoUrl && (
                <>
                  <button
                    onClick={downloadVideo}
                    className='px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors'
                  >
                    Download Video
                  </button>
                  <button
                    onClick={() => setStatus('idle')}
                    className='px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors'
                  >
                    New Render
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Video Preview */}
          {status === 'done' && videoUrl && (
            <div className='bg-gray-800 rounded-lg p-6'>
              <h2 className='text-xl font-semibold mb-4'>Recorded Video</h2>
              <video
                src={videoUrl}
                controls
                className='w-full max-w-2xl rounded-lg bg-black'
                playsInline
              />
            </div>
          )}

          {/* Info */}
          <div className='bg-gray-800 rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>How It Works</h2>
            <ul className='text-sm text-gray-400 space-y-2'>
              <li>• Canvas renders at 30fps synced to audio timestamps</li>
              <li>• Web Audio API captures BOTH voiceover AND beat audio</li>
              <li>• MediaRecorder combines canvas video + audio stream</li>
              <li>• Output is WebM (VP9 codec) with audio included</li>
              <li>• Works entirely in browser - no server rendering needed</li>
              <li>• Can be deployed to Vercel without any backend changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}