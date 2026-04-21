import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const testingLyrics = {
  "topic": "aaa",
  "sections": [
    {
      "type": "hook",
      "lines": [
        {
          "text": "[serious] Three little letters, not a word in the book,",
          "words": [
            "Three",
            "little",
            "letters,",
            "not",
            "a",
            "word",
            "in",
            "the",
            "book,"
          ]
        },
        {
          "text": "Just a placeholder name with a desperate look.",
          "words": [
            "Just",
            "a",
            "placeholder",
            "name",
            "with",
            "a",
            "desperate",
            "look."
          ]
        },
        {
          "text": "You’re the baseline of lazy, the start of the glitch,",
          "words": [
            "You’re",
            "the",
            "baseline",
            "of",
            "lazy,",
            "the",
            "start",
            "of",
            "the",
            "glitch,"
          ]
        },
        {
          "text": "A digital error that nobody’s [angry] itching to switch.",
          "words": [
            "A",
            "digital",
            "error",
            "that",
            "nobody’s",
            "itching",
            "to",
            "switch."
          ]
        }
      ],
      "stylePreset": {
        "id": "hook",
        "fontFamily": "'Bebas Neue', Impact, sans-serif",
        "color": "#facc15",
        "accentColor": "#facc15",
        "animation": "pop",
        "fontSize": 96,
        "textTransform": "uppercase"
      }
    },
    {
      "type": "verse",
      "lines": [
        {
          "text": "You aren’t a brand, you’re a keyboard malfunction,",
          "words": [
            "You",
            "aren’t",
            "a",
            "brand,",
            "you’re",
            "a",
            "keyboard",
            "malfunction,"
          ]
        },
        {
          "text": "A stuttering wreck at the grammar conjunction.",
          "words": [
            "A",
            "stuttering",
            "wreck",
            "at",
            "the",
            "grammar",
            "conjunction."
          ]
        },
        {
          "text": "You’re the scream of a toddler who can’t form a thought,",
          "words": [
            "You’re",
            "the",
            "scream",
            "of",
            "a",
            "toddler",
            "who",
            "can’t",
            "form",
            "a",
            "thought,"
          ]
        },
        {
          "text": "Or a password security team [dramatic] never bought.",
          "words": [
            "Or",
            "a",
            "password",
            "security",
            "team",
            "never",
            "bought."
          ]
        },
        {
          "text": "\"Aaa\" is the sound of a lung hitting zero,",
          "words": [
            "\"Aaa\"",
            "is",
            "the",
            "sound",
            "of",
            "a",
            "lung",
            "hitting",
            "zero,"
          ]
        },
        {
          "text": "You’re nobody’s icon, you’re [slow] nobody’s hero.",
          "words": [
            "You’re",
            "nobody’s",
            "icon,",
            "you’re",
            "nobody’s",
            "hero."
          ]
        },
        {
          "text": "Just a rhythmic void in a world full of style,",
          "words": [
            "Just",
            "a",
            "rhythmic",
            "void",
            "in",
            "a",
            "world",
            "full",
            "of",
            "style,"
          ]
        },
        {
          "text": "You’re the file I delete after staying a while.",
          "words": [
            "You’re",
            "the",
            "file",
            "I",
            "delete",
            "after",
            "staying",
            "a",
            "while."
          ]
        }
      ],
      "stylePreset": {
        "id": "verse",
        "fontFamily": "'Bebas Neue', Impact, sans-serif",
        "color": "#ffffff",
        "accentColor": "#facc15",
        "animation": "slide",
        "fontSize": 80,
        "textTransform": "uppercase"
      }
    }
  ],
  "fullText": " Three little letters, not a word in the book, Just a placeholder name with a desperate look. You’re the baseline of lazy, the start of the glitch, A digital error that nobody’s  itching to switch. You aren’t a brand, you’re a keyboard malfunction, A stuttering wreck at the grammar conjunction. You’re the scream of a toddler who can’t form a thought, Or a password security team  never bought. \"Aaa\" is the sound of a lung hitting zero, You’re nobody’s icon, you’re  nobody’s hero. Just a rhythmic void in a world full of style, You’re the file I delete after staying a while."
}

export const testingAudioResult = {
  "wordTimestamps": [
    {
      "word": "[serious]",
      "startTime": 0,
      "endTime": 0.237,
      "confidence": 1
    },
    {
      "word": "Three",
      "startTime": 0.25,
      "endTime": 0.315,
      "confidence": 1
    },
    {
      "word": "little",
      "startTime": 0.349,
      "endTime": 0.553,
      "confidence": 1
    },
    {
      "word": "letters,",
      "startTime": 0.613,
      "endTime": 1.433,
      "confidence": 1
    },
    {
      "word": "not",
      "startTime": 1.473,
      "endTime": 1.593,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 1.673,
      "endTime": 1.753,
      "confidence": 1
    },
    {
      "word": "word",
      "startTime": 1.817,
      "endTime": 2.073,
      "confidence": 1
    },
    {
      "word": "in",
      "startTime": 2.1,
      "endTime": 2.154,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 2.174,
      "endTime": 2.234,
      "confidence": 1
    },
    {
      "word": "book,",
      "startTime": 2.298,
      "endTime": 2.954,
      "confidence": 1
    },
    {
      "word": "Just",
      "startTime": 3.002,
      "endTime": 3.194,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 3.234,
      "endTime": 3.274,
      "confidence": 1
    },
    {
      "word": "placeholder",
      "startTime": 3.327,
      "endTime": 3.91,
      "confidence": 1
    },
    {
      "word": "name",
      "startTime": 3.99,
      "endTime": 4.31,
      "confidence": 1
    },
    {
      "word": "with",
      "startTime": 4.374,
      "endTime": 4.63,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 4.67,
      "endTime": 4.71,
      "confidence": 1
    },
    {
      "word": "desperate",
      "startTime": 4.766,
      "endTime": 5.27,
      "confidence": 1
    },
    {
      "word": "look.",
      "startTime": 5.334,
      "endTime": 6.11,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 6.24,
      "endTime": 6.711,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 6.731,
      "endTime": 6.791,
      "confidence": 1
    },
    {
      "word": "baseline",
      "startTime": 6.871,
      "endTime": 7.511,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 7.538,
      "endTime": 7.592,
      "confidence": 1
    },
    {
      "word": "lazy,",
      "startTime": 7.688,
      "endTime": 8.392,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 8.432,
      "endTime": 8.552,
      "confidence": 1
    },
    {
      "word": "start",
      "startTime": 8.619,
      "endTime": 8.954,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 8.981,
      "endTime": 9.035,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 9.055,
      "endTime": 9.115,
      "confidence": 1
    },
    {
      "word": "glitch,",
      "startTime": 9.172,
      "endTime": 9.594,
      "confidence": 1
    },
    {
      "word": "A",
      "startTime": 9.794,
      "endTime": 9.994,
      "confidence": 1
    },
    {
      "word": "digital",
      "startTime": 10.054,
      "endTime": 10.474,
      "confidence": 1
    },
    {
      "word": "error",
      "startTime": 10.541,
      "endTime": 10.876,
      "confidence": 1
    },
    {
      "word": "that",
      "startTime": 10.94,
      "endTime": 11.196,
      "confidence": 1
    },
    {
      "word": "nobody’s",
      "startTime": 11.253,
      "endTime": 11.835,
      "confidence": 1
    },
    {
      "word": "[angry]",
      "startTime": 11.867,
      "endTime": 12.09,
      "confidence": 1
    },
    {
      "word": "itching",
      "startTime": 12.098,
      "endTime": 12.154,
      "confidence": 1
    },
    {
      "word": "to",
      "startTime": 12.181,
      "endTime": 12.235,
      "confidence": 1
    },
    {
      "word": "switch.",
      "startTime": 12.304,
      "endTime": 13.038,
      "confidence": 1
    },
    {
      "word": "You",
      "startTime": 13.178,
      "endTime": 13.598,
      "confidence": 1
    },
    {
      "word": "aren’t",
      "startTime": 13.63,
      "endTime": 13.838,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 13.958,
      "endTime": 14.078,
      "confidence": 1
    },
    {
      "word": "brand,",
      "startTime": 14.118,
      "endTime": 14.638,
      "confidence": 1
    },
    {
      "word": "you’re",
      "startTime": 14.658,
      "endTime": 14.799,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 14.839,
      "endTime": 14.879,
      "confidence": 1
    },
    {
      "word": "keyboard",
      "startTime": 14.941,
      "endTime": 15.437,
      "confidence": 1
    },
    {
      "word": "malfunction,",
      "startTime": 15.49,
      "endTime": 16.553,
      "confidence": 1
    },
    {
      "word": "A",
      "startTime": 16.593,
      "endTime": 16.633,
      "confidence": 1
    },
    {
      "word": "stuttering",
      "startTime": 16.683,
      "endTime": 17.192,
      "confidence": 1
    },
    {
      "word": "wreck",
      "startTime": 17.245,
      "endTime": 17.51,
      "confidence": 1
    },
    {
      "word": "at",
      "startTime": 17.59,
      "endTime": 17.75,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 17.77,
      "endTime": 17.83,
      "confidence": 1
    },
    {
      "word": "grammar",
      "startTime": 17.88,
      "endTime": 18.23,
      "confidence": 1
    },
    {
      "word": "conjunction.",
      "startTime": 18.283,
      "endTime": 19.186,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 19.406,
      "endTime": 20.147,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 20.167,
      "endTime": 20.227,
      "confidence": 1
    },
    {
      "word": "scream",
      "startTime": 20.296,
      "endTime": 20.71,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 20.763,
      "endTime": 20.869,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 21.009,
      "endTime": 21.149,
      "confidence": 1
    },
    {
      "word": "toddler",
      "startTime": 21.184,
      "endTime": 21.429,
      "confidence": 1
    },
    {
      "word": "who",
      "startTime": 21.469,
      "endTime": 21.589,
      "confidence": 1
    },
    {
      "word": "can’t",
      "startTime": 21.649,
      "endTime": 21.989,
      "confidence": 1
    },
    {
      "word": "form",
      "startTime": 22.021,
      "endTime": 22.149,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 22.249,
      "endTime": 22.349,
      "confidence": 1
    },
    {
      "word": "thought,",
      "startTime": 22.374,
      "endTime": 22.869,
      "confidence": 1
    },
    {
      "word": "Or",
      "startTime": 23.002,
      "endTime": 23.268,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 23.308,
      "endTime": 23.348,
      "confidence": 1
    },
    {
      "word": "password",
      "startTime": 23.41,
      "endTime": 23.906,
      "confidence": 1
    },
    {
      "word": "security",
      "startTime": 23.968,
      "endTime": 24.464,
      "confidence": 1
    },
    {
      "word": "team",
      "startTime": 24.528,
      "endTime": 24.784,
      "confidence": 1
    },
    {
      "word": "[dramatic]",
      "startTime": 25.024,
      "endTime": 25.393,
      "confidence": 1
    },
    {
      "word": "never",
      "startTime": 25.398,
      "endTime": 25.423,
      "confidence": 1
    },
    {
      "word": "bought.",
      "startTime": 25.48,
      "endTime": 26.142,
      "confidence": 1
    },
    {
      "word": "\"Aaa\"",
      "startTime": 26.502,
      "endTime": 27.342,
      "confidence": 1
    },
    {
      "word": "is",
      "startTime": 27.422,
      "endTime": 27.582,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 27.622,
      "endTime": 27.742,
      "confidence": 1
    },
    {
      "word": "sound",
      "startTime": 27.795,
      "endTime": 28.06,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 28.087,
      "endTime": 28.141,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 28.181,
      "endTime": 28.221,
      "confidence": 1
    },
    {
      "word": "lung",
      "startTime": 28.301,
      "endTime": 28.621,
      "confidence": 1
    },
    {
      "word": "hitting",
      "startTime": 28.661,
      "endTime": 28.941,
      "confidence": 1
    },
    {
      "word": "zero,",
      "startTime": 29.053,
      "endTime": 29.821,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 29.901,
      "endTime": 30.222,
      "confidence": 1
    },
    {
      "word": "nobody’s",
      "startTime": 30.279,
      "endTime": 30.701,
      "confidence": 1
    },
    {
      "word": "icon,",
      "startTime": 30.813,
      "endTime": 31.501,
      "confidence": 1
    },
    {
      "word": "you’re",
      "startTime": 31.541,
      "endTime": 31.742,
      "confidence": 1
    },
    {
      "word": "[slow]",
      "startTime": 31.782,
      "endTime": 32.142,
      "confidence": 1
    },
    {
      "word": "nobody’s",
      "startTime": 32.165,
      "endTime": 32.383,
      "confidence": 1
    },
    {
      "word": "hero.",
      "startTime": 32.463,
      "endTime": 33.183,
      "confidence": 1
    },
    {
      "word": "Just",
      "startTime": 33.327,
      "endTime": 33.903,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 33.983,
      "endTime": 34.063,
      "confidence": 1
    },
    {
      "word": "rhythmic",
      "startTime": 34.116,
      "endTime": 34.54,
      "confidence": 1
    },
    {
      "word": "void",
      "startTime": 34.62,
      "endTime": 34.94,
      "confidence": 1
    },
    {
      "word": "in",
      "startTime": 34.967,
      "endTime": 35.021,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 35.061,
      "endTime": 35.101,
      "confidence": 1
    },
    {
      "word": "world",
      "startTime": 35.168,
      "endTime": 35.503,
      "confidence": 1
    },
    {
      "word": "full",
      "startTime": 35.551,
      "endTime": 35.743,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 35.77,
      "endTime": 35.824,
      "confidence": 1
    },
    {
      "word": "style,",
      "startTime": 35.904,
      "endTime": 36.624,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 36.684,
      "endTime": 36.945,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 36.965,
      "endTime": 37.025,
      "confidence": 1
    },
    {
      "word": "file",
      "startTime": 37.105,
      "endTime": 37.425,
      "confidence": 1
    },
    {
      "word": "I",
      "startTime": 37.465,
      "endTime": 37.505,
      "confidence": 1
    },
    {
      "word": "delete",
      "startTime": 37.574,
      "endTime": 37.988,
      "confidence": 1
    },
    {
      "word": "after",
      "startTime": 38.055,
      "endTime": 38.39,
      "confidence": 1
    },
    {
      "word": "staying",
      "startTime": 38.44,
      "endTime": 38.79,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 38.89,
      "endTime": 38.99,
      "confidence": 1
    },
    {
      "word": "while.",
      "startTime": 39.023,
      "endTime": 39.508,
      "confidence": 1
    }
  ],
  "durationSeconds": 39.508
}