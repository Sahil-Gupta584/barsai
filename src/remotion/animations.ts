import { interpolate } from 'remotion'
import type { AnimationType } from '#/lib/rap-types'

export interface AnimationStyle {
  transform?: string
  opacity?: number
  textShadow?: string
  filter?: string
}

/**
 * Returns CSS-in-JS style for a word animation at a given progress (0–1).
 * Progress is computed from the word's time window relative to current frame.
 */
export function getWordAnimationStyle(
  animationType: AnimationType,
  progress: number,
): AnimationStyle {
  const p = Math.max(0, Math.min(1, progress))

  switch (animationType) {
    case 'pop': {
      const scale = interpolate(p, [0, 0.3, 0.7, 1], [0, 1.3, 0.95, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      const opacity = interpolate(p, [0, 0.15, 1], [0, 1, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      return { transform: `scale(${scale})`, opacity }
    }

    case 'slide': {
      const translateY = interpolate(p, [0, 1], [50, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      const opacity = interpolate(p, [0, 0.3, 1], [0, 1, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      return { transform: `translateY(${translateY}px)`, opacity }
    }

    case 'shake': {
      let translateX = 0
      if (p < 0.15) {
        translateX = interpolate(p, [0, 0.15], [0, -10], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      } else if (p < 0.35) {
        translateX = interpolate(p, [0.15, 0.35], [-10, 10], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      } else if (p < 0.5) {
        translateX = interpolate(p, [0.35, 0.5], [10, -5], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      } else {
        translateX = interpolate(p, [0.5, 0.7], [-5, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
      const opacity = interpolate(p, [0, 0.1, 1], [0, 1, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      return { transform: `translateX(${translateX}px)`, opacity }
    }

    case 'glow': {
      const glowRadius = interpolate(p, [0, 0.4, 0.7, 1], [0, 25, 15, 12], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      const opacity = interpolate(p, [0, 0.2, 1], [0, 1, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      return {
        textShadow: `0 0 ${glowRadius}px currentColor, 0 0 ${glowRadius * 2}px currentColor`,
        opacity,
      }
    }

    default:
      return { opacity: p > 0 ? 1 : 0 }
  }
}
