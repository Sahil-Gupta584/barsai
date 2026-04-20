import { Composition, registerRoot } from 'remotion'
import { RapVideoComposition } from './RapVideoComposition'

// Default props for Remotion Studio preview
const defaultProps = {
  lyrics: {
    topic: 'preview',
    sections: [
      {
        type: 'hook' as const,
        lines: [{ text: 'Preview mode', words: ['Preview', 'mode'] }],
        stylePreset: {
          id: 'hook',
          fontFamily: 'Impact',
          color: '#FFD700',
          accentColor: '#FF6B00',
          animation: 'pop' as const,
          fontSize: 72,
          textTransform: 'uppercase' as const,
        },
      },
    ],
    fullText: 'Preview mode',
  },
  wordTimestamps: [
    { word: 'Preview', startTime: 0, endTime: 1, confidence: 1 },
    { word: 'mode', startTime: 1, endTime: 2, confidence: 1 },
  ],
  durationInFrames: 90,
  fps: 30,
}

export const RemotionRoot = () => {
  return (
    <Composition
      id="RapVideo"
      component={RapVideoComposition}
      durationInFrames={defaultProps.durationInFrames}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={defaultProps}
    />
  )
}

registerRoot(RemotionRoot)
