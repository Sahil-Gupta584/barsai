import { env } from '#/env'
import {
  type LyricsDocument,
  type LyricsSection,
  LyricsGenerationError,
  STYLE_PRESETS,
} from './rap-types'

// ─── Gemini prompt ────────────────────────────────────────────────────────────

const LYRICS_PROMPT = (topic: string) => `
Write a roast rap about: "${topic}"

YOU MUST RETURN ONLY THIS EXACT JSON FORMAT - NOTHING ELSE:

{
  "hook": [
    "line 1 text here",
    "line 2 text here", 
    "line 3 text here",
    "line 4 text here"
  ],
  "verse": [
    "line 1 text here",
    "line 2 text here",
    "line 3 text here",
    "line 4 text here",
    "line 5 text here",
    "line 6 text here",
    "line 7 text here",
    "line 8 text here"
  ]
}

STYLE: Roasting/diss track - clever insults, wordplay, funny, call out flaws and stereotypes.

EXAMPLE FOR "nerd programmer":
{
  "hook": [
    "Architect of worlds, I'm the king of the code,",
    "Building the future in an incognito mode.",
    "High-level thinker with a six-figure pay,",
    "Until the compiler gets in my way."
  ],
  "verse": [
    "You call yourself a genius, a silicon god,",
    "But your GitHub activity is looking quite odd.",
    "You brag about Python and your AI stack,",
    "But you can't exit Vim and your posture is slack.",
    "Your LinkedIn says Visionary, Leader, and Pro,",
    "But your logic is spaghetti and your queries are slow.",
    "You bought a mechanical keyboard that clicks like a train,",
    "To hide the fact you've got nothing but bugs in your brain."
  ]
}

NOW WRITE THE JSON FOR "${topic}" - ONLY JSON, NO EXPLANATIONS:
`.trim()

const EMOTION_TAGS_PROMPT = (lyricsJson: string) => `
Add emotion tags to this rap. Return ONLY JSON - NO EXPLANATIONS.

SUPPORTED TAGS: [sad], [angry], [happily], [excited], [calm], [serious], [whispers], [shouts], [slow], [fast], [laughs], [sighs], [gasp], [emphasis], [dramatic]

INPUT JSON:
${lyricsJson}

Add 2-4 tags INLINE in the text. Example:
{
  "hook": [
    "[excited] First line here",
    "Second line [shouts] with tag"
  ],
  "verse": [
    "[fast] Line one",
    "Line two [emphasis] here"
  ]
}

RETURN ONLY THE JSON WITH TAGS ADDED:
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
  // Extract JSON from response (handle markdown code blocks)
  let jsonText = rawText.trim()
  
  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  
  // Find JSON object
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new LyricsGenerationError(
      `Could not find JSON in Gemini response for topic: "${topic}"`,
    )
  }

  let parsed: { hook?: string[]; verse?: string[] }
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch (err) {
    throw new LyricsGenerationError(
      `Invalid JSON in Gemini response for topic: "${topic}"`,
    )
  }

  const sections: LyricsSection[] = []

  // Parse hook
  if (parsed.hook && Array.isArray(parsed.hook)) {
    const hookLines = parsed.hook
      .filter((line) => line.trim())
      .map((line) => ({
        text: line.trim(),
        words: tokenize(line.trim()),
      }))

    if (hookLines.length > 0) {
      sections.push({
        type: 'hook',
        lines: hookLines,
        stylePreset: STYLE_PRESETS.hook,
      })
    }
  }

  // Parse verse
  if (parsed.verse && Array.isArray(parsed.verse)) {
    const verseLines = parsed.verse
      .filter((line) => line.trim())
      .map((line) => ({
        text: line.trim(),
        words: tokenize(line.trim()),
      }))

    if (verseLines.length > 0) {
      sections.push({
        type: 'verse',
        lines: verseLines,
        stylePreset: STYLE_PRESETS.verse,
      })
    }
  }

  if (sections.length === 0) {
    throw new LyricsGenerationError(
      `Could not parse any sections from Gemini response for topic: "${topic}". Expected JSON with "hook" and "verse" arrays.`,
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

  private async callGemini(prompt: string, retries = 3): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent`

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
console.log('lyrics',lyrics);

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
