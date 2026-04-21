import fs from 'node:fs'
import path from 'node:path'

const BEATS_DIR = path.resolve(process.cwd(), 'public', 'beats')

export function getBeat(): Buffer | null {
  const p = path.join(BEATS_DIR, 'hook.mp3')
  if (!fs.existsSync(p)) {
    console.warn('public/beats/hook.mp3 not found — skipping background music')
    return null
  }
  return fs.readFileSync(p)
}
