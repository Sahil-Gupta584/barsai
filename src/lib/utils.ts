import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const testingLyrics =   {
    "topic": "nerd programmer",
    "sections": [
      {
        "type": "hook",
        "lines": [
          {
            "text": "[serious] Stack Overflow hero with a basement-dweller glow,",
            "words": [
              "[serious]",
              "Stack",
              "Overflow",
              "hero",
              "with",
              "a",
              "basement-dweller",
              "glow,"
            ]
          },
          {
            "text": "Writing lines of garbage that you never let show.",
            "words": [
              "Writing",
              "lines",
              "of",
              "garbage",
              "that",
              "you",
              "never",
              "let",
              "show."
            ]
          },
          {
            "text": "You’re a master of syntax but a slave to the screen,",
            "words": [
              "You’re",
              "a",
              "master",
              "of",
              "syntax",
              "but",
              "a",
              "slave",
              "to",
              "the",
              "screen,"
            ]
          },
          {
            "text": "The [sad] saddest dev profile that the world’s ever seen.",
            "words": [
              "The",
              "[sad]",
              "saddest",
              "dev",
              "profile",
              "that",
              "the",
              "world’s",
              "ever",
              "seen."
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
            "text": "[fast] You’re typing out scripts while your social life dies,",
            "words": [
              "[fast]",
              "You’re",
              "typing",
              "out",
              "scripts",
              "while",
              "your",
              "social",
              "life",
              "dies,"
            ]
          },
          {
            "text": "With the blue light reflecting in your hollowed-out eyes.",
            "words": [
              "With",
              "the",
              "blue",
              "light",
              "reflecting",
              "in",
              "your",
              "hollowed-out",
              "eyes."
            ]
          },
          {
            "text": "You brag about Rust and your complex array,",
            "words": [
              "You",
              "brag",
              "about",
              "Rust",
              "and",
              "your",
              "complex",
              "array,"
            ]
          },
          {
            "text": "But you haven't touched grass since the light of the day.",
            "words": [
              "But",
              "you",
              "haven't",
              "touched",
              "grass",
              "since",
              "the",
              "light",
              "of",
              "the",
              "day."
            ]
          },
          {
            "text": "[angry] Your commit history is mostly just \"fix,\"",
            "words": [
              "[angry]",
              "Your",
              "commit",
              "history",
              "is",
              "mostly",
              "just",
              "\"fix,\""
            ]
          },
          {
            "text": "You’re failing at life with your developer tricks.",
            "words": [
              "You’re",
              "failing",
              "at",
              "life",
              "with",
              "your",
              "developer",
              "tricks."
            ]
          },
          {
            "text": "You think you’re elite 'cause you parse through the JSON,",
            "words": [
              "You",
              "think",
              "you’re",
              "elite",
              "'cause",
              "you",
              "parse",
              "through",
              "the",
              "JSON,"
            ]
          },
          {
            "text": "But you’re lonely as hell with your [whispers] headphones left on.",
            "words": [
              "But",
              "you’re",
              "lonely",
              "as",
              "hell",
              "with",
              "your",
              "[whispers]",
              "headphones",
              "left",
              "on."
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
    "fullText": " Stack Overflow hero with a basement-dweller glow, Writing lines of garbage that you never let show. You’re a master of syntax but a slave to the screen, The  saddest dev profile that the world’s ever seen.  You’re typing out scripts while your social life dies, With the blue light reflecting in your hollowed-out eyes. You brag about Rust and your complex array, But you haven't touched grass since the light of the day.  Your commit history is mostly just \"fix,\" You’re failing at life with your developer tricks. You think you’re elite 'cause you parse through the JSON, But you’re lonely as hell with your  headphones left on."
  }

export const testingAudioResult = {
  "wordTimestamps": [
    {
      "word": "serious",
      "startTime": 0,
      "endTime": 0.476,
      "confidence": 1
    },
    {
      "word": "Stack",
      "startTime": 0.556,
      "endTime": 0.956,
      "confidence": 1
    },
    {
      "word": "Overflow",
      "startTime": 1.018,
      "endTime": 1.514,
      "confidence": 1
    },
    {
      "word": "hero",
      "startTime": 1.594,
      "endTime": 1.914,
      "confidence": 1
    },
    {
      "word": "with",
      "startTime": 1.994,
      "endTime": 2.314,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 2.354,
      "endTime": 2.394,
      "confidence": 1
    },
    {
      "word": "basement-dweller",
      "startTime": 2.456,
      "endTime": 3.352,
      "confidence": 1
    },
    {
      "word": "glow,",
      "startTime": 3.448,
      "endTime": 4.152,
      "confidence": 1
    },
    {
      "word": "Writing",
      "startTime": 4.272,
      "endTime": 5.112,
      "confidence": 1
    },
    {
      "word": "lines",
      "startTime": 5.165,
      "endTime": 5.43,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 5.456,
      "endTime": 5.508,
      "confidence": 1
    },
    {
      "word": "garbage",
      "startTime": 5.578,
      "endTime": 6.068,
      "confidence": 1
    },
    {
      "word": "that",
      "startTime": 6.132,
      "endTime": 6.388,
      "confidence": 1
    },
    {
      "word": "you",
      "startTime": 6.428,
      "endTime": 6.548,
      "confidence": 1
    },
    {
      "word": "never",
      "startTime": 6.614,
      "endTime": 6.944,
      "confidence": 1
    },
    {
      "word": "let",
      "startTime": 7.004,
      "endTime": 7.184,
      "confidence": 1
    },
    {
      "word": "show.",
      "startTime": 7.264,
      "endTime": 7.824,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 8.044,
      "endTime": 8.863,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 8.903,
      "endTime": 8.943,
      "confidence": 1
    },
    {
      "word": "master",
      "startTime": 9.034,
      "endTime": 9.58,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 9.606,
      "endTime": 9.658,
      "confidence": 1
    },
    {
      "word": "syntax",
      "startTime": 9.772,
      "endTime": 10.456,
      "confidence": 1
    },
    {
      "word": "but",
      "startTime": 10.556,
      "endTime": 10.856,
      "confidence": 1
    },
    {
      "word": "a",
      "startTime": 10.896,
      "endTime": 10.936,
      "confidence": 1
    },
    {
      "word": "slave",
      "startTime": 11.042,
      "endTime": 11.572,
      "confidence": 1
    },
    {
      "word": "to",
      "startTime": 11.678,
      "endTime": 11.89,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 11.91,
      "endTime": 11.97,
      "confidence": 1
    },
    {
      "word": "screen,",
      "startTime": 12.038,
      "endTime": 13.326,
      "confidence": 1
    },
    {
      "word": "The",
      "startTime": 13.366,
      "endTime": 13.486,
      "confidence": 1
    },
    {
      "word": "sad",
      "startTime": 13.606,
      "endTime": 13.966,
      "confidence": 1
    },
    {
      "word": "saddest",
      "startTime": 14.106,
      "endTime": 14.766,
      "confidence": 1
    },
    {
      "word": "dev",
      "startTime": 14.886,
      "endTime": 15.246,
      "confidence": 1
    },
    {
      "word": "profile",
      "startTime": 15.316,
      "endTime": 15.806,
      "confidence": 1
    },
    {
      "word": "that",
      "startTime": 15.886,
      "endTime": 16.206,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 16.226,
      "endTime": 16.286,
      "confidence": 1
    },
    {
      "word": "world’s",
      "startTime": 16.352,
      "endTime": 16.762,
      "confidence": 1
    },
    {
      "word": "ever",
      "startTime": 16.874,
      "endTime": 17.322,
      "confidence": 1
    },
    {
      "word": "seen.",
      "startTime": 17.402,
      "endTime": 17.802,
      "confidence": 1
    },
    {
      "word": "fast",
      "startTime": 17.93,
      "endTime": 18.442,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 18.462,
      "endTime": 18.6,
      "confidence": 1
    },
    {
      "word": "typing",
      "startTime": 18.657,
      "endTime": 18.999,
      "confidence": 1
    },
    {
      "word": "out",
      "startTime": 19.039,
      "endTime": 19.159,
      "confidence": 1
    },
    {
      "word": "scripts",
      "startTime": 19.219,
      "endTime": 19.639,
      "confidence": 1
    },
    {
      "word": "while",
      "startTime": 19.705,
      "endTime": 20.035,
      "confidence": 1
    },
    {
      "word": "your",
      "startTime": 20.051,
      "endTime": 20.115,
      "confidence": 1
    },
    {
      "word": "social",
      "startTime": 20.183,
      "endTime": 20.591,
      "confidence": 1
    },
    {
      "word": "life",
      "startTime": 20.639,
      "endTime": 20.831,
      "confidence": 1
    },
    {
      "word": "dies,",
      "startTime": 20.943,
      "endTime": 22.111,
      "confidence": 1
    },
    {
      "word": "With",
      "startTime": 22.143,
      "endTime": 22.271,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 22.311,
      "endTime": 22.431,
      "confidence": 1
    },
    {
      "word": "blue",
      "startTime": 22.479,
      "endTime": 22.671,
      "confidence": 1
    },
    {
      "word": "light",
      "startTime": 22.711,
      "endTime": 22.911,
      "confidence": 1
    },
    {
      "word": "reflecting",
      "startTime": 22.961,
      "endTime": 23.461,
      "confidence": 1
    },
    {
      "word": "in",
      "startTime": 23.514,
      "endTime": 23.62,
      "confidence": 1
    },
    {
      "word": "your",
      "startTime": 23.652,
      "endTime": 23.78,
      "confidence": 1
    },
    {
      "word": "hollowed-out",
      "startTime": 23.837,
      "endTime": 24.419,
      "confidence": 1
    },
    {
      "word": "eyes.",
      "startTime": 24.531,
      "endTime": 25.219,
      "confidence": 1
    },
    {
      "word": "You",
      "startTime": 25.439,
      "endTime": 26.099,
      "confidence": 1
    },
    {
      "word": "brag",
      "startTime": 26.179,
      "endTime": 26.499,
      "confidence": 1
    },
    {
      "word": "about",
      "startTime": 26.539,
      "endTime": 26.739,
      "confidence": 1
    },
    {
      "word": "Rust",
      "startTime": 26.835,
      "endTime": 27.219,
      "confidence": 1
    },
    {
      "word": "and",
      "startTime": 27.279,
      "endTime": 27.459,
      "confidence": 1
    },
    {
      "word": "your",
      "startTime": 27.491,
      "endTime": 27.619,
      "confidence": 1
    },
    {
      "word": "complex",
      "startTime": 27.699,
      "endTime": 28.259,
      "confidence": 1
    },
    {
      "word": "array,",
      "startTime": 28.325,
      "endTime": 29.375,
      "confidence": 1
    },
    {
      "word": "But",
      "startTime": 29.415,
      "endTime": 29.535,
      "confidence": 1
    },
    {
      "word": "you",
      "startTime": 29.575,
      "endTime": 29.695,
      "confidence": 1
    },
    {
      "word": "haven't",
      "startTime": 29.735,
      "endTime": 30.015,
      "confidence": 1
    },
    {
      "word": "touched",
      "startTime": 30.065,
      "endTime": 30.415,
      "confidence": 1
    },
    {
      "word": "grass",
      "startTime": 30.495,
      "endTime": 30.895,
      "confidence": 1
    },
    {
      "word": "since",
      "startTime": 30.975,
      "endTime": 31.375,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 31.395,
      "endTime": 31.455,
      "confidence": 1
    },
    {
      "word": "light",
      "startTime": 31.508,
      "endTime": 31.773,
      "confidence": 1
    },
    {
      "word": "of",
      "startTime": 31.853,
      "endTime": 32.013,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 32.033,
      "endTime": 32.093,
      "confidence": 1
    },
    {
      "word": "day.",
      "startTime": 32.173,
      "endTime": 32.493,
      "confidence": 1
    },
    {
      "word": "angry",
      "startTime": 32.653,
      "endTime": 33.453,
      "confidence": 1
    },
    {
      "word": "Your",
      "startTime": 33.485,
      "endTime": 33.613,
      "confidence": 1
    },
    {
      "word": "commit",
      "startTime": 33.658,
      "endTime": 33.928,
      "confidence": 1
    },
    {
      "word": "history",
      "startTime": 33.978,
      "endTime": 34.328,
      "confidence": 1
    },
    {
      "word": "is",
      "startTime": 34.434,
      "endTime": 34.646,
      "confidence": 1
    },
    {
      "word": "mostly",
      "startTime": 34.726,
      "endTime": 35.206,
      "confidence": 1
    },
    {
      "word": "just",
      "startTime": 35.318,
      "endTime": 35.766,
      "confidence": 1
    },
    {
      "word": "\"fix,\"",
      "startTime": 35.926,
      "endTime": 36.484,
      "confidence": 1
    },
    {
      "word": "You’re",
      "startTime": 36.584,
      "endTime": 36.962,
      "confidence": 1
    },
    {
      "word": "failing",
      "startTime": 37.012,
      "endTime": 37.362,
      "confidence": 1
    },
    {
      "word": "at",
      "startTime": 37.415,
      "endTime": 37.521,
      "confidence": 1
    },
    {
      "word": "life",
      "startTime": 37.585,
      "endTime": 37.841,
      "confidence": 1
    },
    {
      "word": "with",
      "startTime": 37.921,
      "endTime": 38.241,
      "confidence": 1
    },
    {
      "word": "your",
      "startTime": 38.273,
      "endTime": 38.401,
      "confidence": 1
    },
    {
      "word": "developer",
      "startTime": 38.449,
      "endTime": 38.881,
      "confidence": 1
    },
    {
      "word": "tricks.",
      "startTime": 38.949,
      "endTime": 39.597,
      "confidence": 1
    },
    {
      "word": "You",
      "startTime": 39.777,
      "endTime": 40.317,
      "confidence": 1
    },
    {
      "word": "think",
      "startTime": 40.37,
      "endTime": 40.635,
      "confidence": 1
    },
    {
      "word": "you’re",
      "startTime": 40.655,
      "endTime": 40.793,
      "confidence": 1
    },
    {
      "word": "elite",
      "startTime": 40.886,
      "endTime": 41.351,
      "confidence": 1
    },
    {
      "word": "'cause",
      "startTime": 41.471,
      "endTime": 41.671,
      "confidence": 1
    },
    {
      "word": "you",
      "startTime": 41.711,
      "endTime": 41.831,
      "confidence": 1
    },
    {
      "word": "parse",
      "startTime": 41.897,
      "endTime": 42.227,
      "confidence": 1
    },
    {
      "word": "through",
      "startTime": 42.257,
      "endTime": 42.467,
      "confidence": 1
    },
    {
      "word": "the",
      "startTime": 42.487,
      "endTime": 42.547,
      "confidence": 1
    },
    {
      "word": "JSON,",
      "startTime": 42.691,
      "endTime": 44.067,
      "confidence": 1
    },
    {
      "word": "But",
      "startTime": 44.107,
      "endTime": 44.227,
      "confidence": 1
    },
    {
      "word": "you’re",
      "startTime": 44.267,
      "endTime": 44.465,
      "confidence": 1
    },
    {
      "word": "lonely",
      "startTime": 44.522,
      "endTime": 44.864,
      "confidence": 1
    },
    {
      "word": "as",
      "startTime": 44.917,
      "endTime": 45.023,
      "confidence": 1
    },
    {
      "word": "hell",
      "startTime": 45.103,
      "endTime": 45.423,
      "confidence": 1
    },
    {
      "word": "with",
      "startTime": 45.487,
      "endTime": 45.743,
      "confidence": 1
    },
    {
      "word": "your",
      "startTime": 45.791,
      "endTime": 45.983,
      "confidence": 1
    },
    {
      "word": "whispers",
      "startTime": 46.045,
      "endTime": 46.541,
      "confidence": 1
    },
    {
      "word": "headphones",
      "startTime": 46.599,
      "endTime": 47.179,
      "confidence": 1
    },
    {
      "word": "left",
      "startTime": 47.259,
      "endTime": 47.579,
      "confidence": 1
    },
    {
      "word": "on.",
      "startTime": 47.685,
      "endTime": 48.137,
      "confidence": 1
    }
  ],
  "durationInSeconds": 48.137,
  "firstFewWords": [
    "serious",
    "Stack",
    "Overflow",
    "hero",
    "with",
    "a",
    "basement-dweller",
    "glow,",
    "Writing",
    "lines"
  ]
}