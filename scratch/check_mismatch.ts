import { testingLyrics, testingAudioResult } from './src/lib/utils'

const lines = testingLyrics.sections.flatMap(s => s.lines)
const wordsInLyrics = lines.flatMap(l => l.words).filter(w => !/^\[.*\]$/.test(w))
const timestamps = testingAudioResult.wordTimestamps.filter(w => !/^\[.*\]$/.test(w.word))

console.log('Words in lyrics:', wordsInLyrics.length)
console.log('Timestamps:', timestamps.length)

if (wordsInLyrics.length !== timestamps.length) {
    console.log('MISMATCH FOUND!')
    for (let i = 0; i < Math.max(wordsInLyrics.length, timestamps.length); i++) {
        if (wordsInLyrics[i] !== timestamps[i]?.word) {
            console.log(`Mismatch at index ${i}: Lyric="${wordsInLyrics[i]}", Timestamp="${timestamps[i]?.word}"`)
            break
        }
    }
} else {
    console.log('Counts match.')
}
