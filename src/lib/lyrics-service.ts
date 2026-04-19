import { env } from '#/env'
import {
  type LyricsDocument,
  type LyricsLine,
  type LyricsSection,
  type SectionType,
  LyricsGenerationError,
  STYLE_PRESETS,
} from './rap-types'

// ─── Gemini prompt ────────────────────────────────────────────────────────────

const LYRICS_PROMPT = (topic: string) => `
You are a rap lyric writer. Write a short, energetic rap about: "${topic}"

Rules:
- Use EXACTLY these section labels on their own line: [Hook], [Verse 1], [Verse 2], [Bridge], [Outro]
- Include at least [Hook] and [Verse 1]
- Each section should have 4–8 lines
- Keep it fun, punchy, and rhythmic
- Total length: 16–32 lines
- Do NOT include any explanation, just the lyrics

Example format:
[Hook]
Line one here
Line two here

[Verse 1]
Line one here
Line two here
`.trim()

// ─── Parser ───────────────────────────────────────────────────────────────────

const SECTION_REGEX = /^\[(Hook|Verse\s*\d*|Bridge|Outro)\]$/i

function extractSectionType(label: string): SectionType {
  const lower = label.toLowerCase()
  if (lower.includes('hook')) return 'hook'
  if (lower.includes('verse')) return 'verse'
  if (lower.includes('bridge')) return 'bridge'
  if (lower.includes('outro')) return 'outro'
  return 'verse'
}

function tokenize(line: string): string[] {
  return line
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
}

export function parseLyricsFromGemini(
  rawText: string,
  topic: string,
): LyricsDocument {
  const lines = rawText.split('\n')
  const sections: LyricsSection[] = []
  let currentSection: { type: SectionType; lines: LyricsLine[] } | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const match = trimmed.match(/^\[(.+)\]$/)
    if (match && SECTION_REGEX.test(trimmed)) {
      if (currentSection && currentSection.lines.length > 0) {
        sections.push({
          ...currentSection,
          stylePreset: STYLE_PRESETS[currentSection.type],
        })
      }
      currentSection = {
        type: extractSectionType(match[1]),
        lines: [],
      }
    } else if (currentSection) {
      currentSection.lines.push({
        text: trimmed,
        words: tokenize(trimmed),
      })
    }
  }

  // push last section
  if (currentSection && currentSection.lines.length > 0) {
    sections.push({
      ...currentSection,
      stylePreset: STYLE_PRESETS[currentSection.type],
    })
  }

  if (sections.length === 0) {
    throw new LyricsGenerationError(
      `Could not parse any sections from Gemini response for topic: "${topic}"`,
    )
  }

  const fullText = sections
    .flatMap((s) => s.lines)
    .map((l) => l.text)
    .join(' ')

  if (!fullText.trim()) {
    throw new LyricsGenerationError('Generated lyrics are empty')
  }

  return { topic, sections, fullText }
}

// ─── Service ──────────────────────────────────────────────────────────────────

class LyricsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateLyrics(topic: string): Promise<LyricsDocument> {
    const sanitizedTopic = topic.trim().slice(0, 200)

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

    const body = {
      contents: [
        {
          parts: [{ text: LYRICS_PROMPT(sanitizedTopic) }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1024,
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new LyricsGenerationError(
        `Gemini API error: ${res.status} ${res.statusText}`,
      )
    }

    const data = await res.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
      }>
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (!rawText.trim()) {
      throw new LyricsGenerationError('Gemini returned empty response')
    }

    return parseLyricsFromGemini(rawText, sanitizedTopic)
  }
}

// Lazy singleton — instantiated on first use so env is loaded
let _instance: LyricsService | null = null

export function getLyricsService(): LyricsService {
  if (!_instance) {
    _instance = new LyricsService(env.GEMINI_API_KEY)
  }
  return _instance
}
