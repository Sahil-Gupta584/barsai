import { env } from '#/env'
import {
  type LyricsDocument,
  type LyricsSection,
  LyricsGenerationError,
  STYLE_PRESETS,
} from './rap-types'
import { testingLyrics } from './utils'

// ─── Gemini prompt ────────────────────────────────────────────────────────────

const LYRICS_PROMPT = (topic: string) => `
Write a roast rap about: "${topic}"

CRITICAL: Output ONLY the markdown below. NO thinking process. NO explanations.

## Hook
Line 1 text here
Line 2 text here
Line 3 text here
Line 4 text here

## Verse
Line 1 text here
Line 2 text here
Line 3 text here
Line 4 text here
Line 5 text here
Line 6 text here
Line 7 text here
Line 8 text here

STYLE: complementing-to-roast.

EXAMPLE OUTPUT:
## Hook
Genius at night, legend in the code
Master of logic on this lonely road
They call you smart, yeah you carry the load
But damn bro, when’s the last time you showered?  

## Verse
You built that feature in record time, respect
Fixed three crashes before the team even checked
Your logic so clean, it deserves an award
But your room smells like socks and old Discord
You know every framework, every design pattern
While your plants died from total abandonment
Queen of algorithms, king of the late grind
But your sleep schedule? Straight up undefined  
`.trim()

const EMOTION_TAGS_PROMPT = (lyrics: string) => `
Add emotion tags to this rap. Return in the SAME markdown format.

SUPPORTED TAGS: [sad], [angry], [happily], [excited], [calm], [serious], [whispers], [shouts], [slow], [fast], [laughs], [sighs], [gasp], [emphasis], [dramatic], [BOOM]

Add 2-5 tags INLINE in the text. Use [BOOM] for major punchlines or transitions.

EXAMPLE:
## Hook
[excited] First line here
Second line [shouts] with tag

## Verse
[fast] Line one
Line two [emphasis] here

INPUT:
${lyrics}

OUTPUT (with tags added):
`.trim()

// ─── Parser ───────────────────────────────────────────────────────────────────

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
  console.log('Parsing raw text:', rawText.substring(0, 200))

  const sections: LyricsSection[] = []

  // Extract Hook section (## Hook or ## hook)
  const hookMatch = rawText.match(/##\s*Hook\s*\n([\s\S]*?)(?=##|$)/i)
  if (hookMatch) {
    const hookText = hookMatch[1].trim()
    const hookLines = hookText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('*'))
      .map((line) => ({
        text: line,
        words: tokenize(line),
      }))

    if (hookLines.length > 0) {
      sections.push({
        type: 'hook',
        lines: hookLines,
        stylePreset: STYLE_PRESETS.hook,
      })
      console.log('Parsed hook:', hookLines.length, 'lines')
    }
  }

  // Extract Verse section (## Verse or ## verse)
  const verseMatch = rawText.match(/##\s*Verse\s*\n([\s\S]*?)(?=##|$)/i)
  if (verseMatch) {
    const verseText = verseMatch[1].trim()
    const verseLines = verseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('*'))
      .map((line) => ({
        text: line,
        words: tokenize(line),
      }))

    if (verseLines.length > 0) {
      sections.push({
        type: 'verse',
        lines: verseLines,
        stylePreset: STYLE_PRESETS.verse,
      })
      console.log('Parsed verse:', verseLines.length, 'lines')
    }
  }

  if (sections.length === 0) {
    throw new LyricsGenerationError(
      `Could not parse any sections from Gemini response for topic: "${topic}". Expected markdown with ## Hook and ## Verse headers.`,
    )
  }

  const fullText = sections
    .flatMap((s) => s.lines)
    .map((l) => l.text)
    .join(' ')

  if (!fullText.trim()) {
    throw new LyricsGenerationError('Generated lyrics are empty')
  }

  console.log('Successfully parsed:', { sections: sections.length, hookLines: sections[0]?.lines.length, verseLines: sections[1]?.lines.length })

  return { topic, sections, fullText }
}

// ─── Service ──────────────────────────────────────────────────────────────────

class LyricsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async callGemini(prompt: string, retries = 3): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent`

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1024,
      },
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'x-goog-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          // Retry on 503 or 429 (rate limit)
          if ((res.status === 503 || res.status === 429) && attempt < retries) {
            const delay = attempt * 1000 // 1s, 2s, 3s
            console.log(`Gemini API ${res.status}, retrying in ${delay}ms... (attempt ${attempt}/${retries})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
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

        return rawText
      } catch (error) {
        if (attempt === retries) throw error
        // Network errors - retry
        const delay = attempt * 1000
        console.log(`Gemini API error, retrying in ${delay}ms... (attempt ${attempt}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new LyricsGenerationError('Gemini API failed after retries')
  }

  async generateLyrics(topic: string): Promise<LyricsDocument> {
    // return testingLyrics
    const sanitizedTopic = topic.trim().slice(0, 200)

    // Step 1: Generate base lyrics as JSON
    const rawLyrics = await this.callGemini(LYRICS_PROMPT(sanitizedTopic))
    console.log('Raw lyrics JSON:', rawLyrics)

    // Step 2: Add emotion tags (pass the JSON)
    const lyricsWithTags = await this.callGemini(EMOTION_TAGS_PROMPT(rawLyrics))
    console.log('Lyrics with tags JSON:', lyricsWithTags)

    // Parse the JSON response
    const lyrics = parseLyricsFromGemini(lyricsWithTags, sanitizedTopic)
    console.log('Parsed sections:', lyrics.sections.length)

    return lyrics
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
