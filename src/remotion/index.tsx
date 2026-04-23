import { Composition, registerRoot } from "remotion";
import { LaunchVideoComposition } from "./LaunchVideoComposition";
import { RapVideoComposition } from "./RapVideoComposition";

// Default props for Remotion Studio preview
const defaultProps = {
	lyrics: {
		topic: "preview",
		sections: [
			{
				type: "hook" as const,
				lines: [{ text: "Preview mode", words: ["Preview", "mode"] }],
				stylePreset: {
					id: "hook",
					fontFamily: "Impact",
					color: "#FFD700",
					accentColor: "#FF6B00",
					animation: "pop" as const,
					fontSize: 72,
					textTransform: "uppercase" as const,
				},
			},
		],
		fullText: "Preview mode",
	},
	wordTimestamps: [
		{ word: "Preview", startTime: 0, endTime: 1, confidence: 1 },
		{ word: "mode", startTime: 1, endTime: 2, confidence: 1 },
	],
	durationInFrames: 90,
	fps: 30,
};

const launchVideoProps = {
	appName: "BARS.AI",
	tagline: "DROP A TOPIC. GET A RAP VIDEO.",
	description:
		"Type any topic. We write the bars, voice them, and render a cinematic lyric video in seconds.",
	featureBullets: ["ANY TOPIC", "AI VOICES", "CINEMATIC CAPTIONS"],
	demoVideoSrc: 'http://localhost:3001/demo.mp4',
	audioUrl: undefined, // ElevenLabs powered - replace with synthesized audio
};

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="LaunchVideo"
				component={LaunchVideoComposition}
				durationInFrames={30 * 8}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={launchVideoProps}
			/>
			<Composition
				id="RapVideo"
				component={RapVideoComposition}
				durationInFrames={defaultProps.durationInFrames}
				fps={30}
				width={1080}
				height={1080}
				defaultProps={defaultProps}
			/>
		</>
	);
};

registerRoot(RemotionRoot);
