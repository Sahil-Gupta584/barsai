import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	interpolate,
	OffthreadVideo,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

// ElevenLabs Integration Note:
// To generate audio for the launch video with ElevenLabs TTS,
// call the ElevenLabs API at the server level and pass the resulting
// audio URL via the `audioUrl` prop. The component will automatically
// play the audio when provided.

const { fontFamily: displayFont } = loadBebasNeue();
const { fontFamily: monoFont } = loadSpaceMono();

export interface LaunchVideoProps {
	appName: string;
	tagline: string;
	description: string;
	featureBullets: string[];
	demoVideoSrc?: string;
	audioUrl?: string; // ElevenLabs synthesized audio for the launch video
}

const palette = {
	bg: "#050505",
	panel: "rgba(255,255,255,0.05)",
	panelBorder: "rgba(255,255,255,0.10)",
	yellow: "#facc15",
	softYellow: "rgba(250,204,21,0.25)",
	text: "#f8fafc",
	muted: "rgba(248,250,252,0.58)",
	grid: "rgba(250,204,21,0.05)",
};

const fpsForTiming = 30;
const introDuration = fpsForTiming * 3;
const messageDuration = fpsForTiming * 5;
const demoDuration = fpsForTiming * 7;

const featureLayout = [
	{ top: 0, left: 0.11 },      // First card - top left area
	{ top: 0.30, left: 0.58 },   // Second card - middle right
	{ top: 0.60, left: 0.12 },   // Third card - bottom left
];

const range = (count: number) =>
	Array.from({ length: count }, (_, index) => index);

const Background = ({ frame }: { frame: number }) => {
	const drift = frame * 0.45;

	return (
		<AbsoluteFill style={{ backgroundColor: palette.bg, overflow: "hidden" }}>
			<div
				style={{
					position: "absolute",
					inset: -240,
					background:
						"radial-gradient(circle at 20% 20%, rgba(250,204,21,0.18), transparent 22%), radial-gradient(circle at 80% 30%, rgba(250,204,21,0.14), transparent 24%), radial-gradient(circle at 50% 78%, rgba(255,255,255,0.08), transparent 18%)",
					transform: `translateY(${Math.sin(frame * 0.02) * 18}px)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `
						linear-gradient(${palette.grid} 1px, transparent 1px),
						linear-gradient(90deg, ${palette.grid} 1px, transparent 1px)
					`,
					backgroundSize: "64px 64px",
					transform: `translate(${-drift}px, ${drift * 0.35}px)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.68) 100%)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
					opacity: 0.2,
				}}
			/>
		</AbsoluteFill>
	);
};

const IntroScene = ({ appName }: { appName: string }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const logoSpring = spring({
		fps,
		frame,
		config: {
			damping: 14,
			stiffness: 120,
			mass: 0.7,
		},
	});
	const wordmarkProgress = spring({
		fps,
		frame: Math.max(0, frame - 16),
		config: {
			damping: 16,
			stiffness: 110,
		},
	});
	const lineWidth = interpolate(frame, [0, 24, 60], [0, 200, 520], {
		easing: Easing.out(Easing.cubic),
		extrapolateRight: "clamp",
	});
	const flashOpacity = interpolate(frame, [0, 6, 18, 32], [0, 0.85, 0.22, 0], {
		extrapolateRight: "clamp",
	});

	const opacity = interpolate(
		frame,
		[0, 15, introDuration - 15, introDuration],
		[0, 1, 1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	const slideY = interpolate(
		frame,
		[0, 20, introDuration - 20, introDuration],
		[20, 0, 0, -20],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	return (
		<AbsoluteFill
			style={{
				alignItems: "center",
				justifyContent: "center",
				opacity,
				transform: `translateY(${slideY}px)`,
			}}
		>
			<div
				style={{
					position: "absolute",
					width: 620,
					height: 620,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(250,204,21,0.16) 0%, transparent 68%)",
					transform: `scale(${1 + logoSpring * 0.14})`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: lineWidth,
					height: 2,
					top: "50%",
					background: `linear-gradient(90deg, transparent, ${palette.yellow}, transparent)`,
					boxShadow: `0 0 24px ${palette.softYellow}`,
				}}
			/>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 28,
					transform: `translateY(${interpolate(frame, [0, 30], [32, 0], {
						extrapolateRight: "clamp",
					})}px)`,
					opacity: interpolate(frame, [0, 12, 30], [0, 1, 1], {
						extrapolateRight: "clamp",
					}),
				}}
			>
				<div
					style={{
						width: 168,
						height: 168,
						borderRadius: 40,
						border: `1px solid ${palette.panelBorder}`,
						background:
							"linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
						boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						transform: `scale(${logoSpring}) rotate(${interpolate(
							frame,
							[0, 40],
							[-10, 0],
							{
								extrapolateRight: "clamp",
							},
						)}deg)`,
					}}
				>
					<Img src="http://localhost:3001/favicon.ico" style={{ width: 104, height: 104 }} />
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						style={{
							fontFamily: monoFont,
							fontSize: 22,
							letterSpacing: 12,
							color: palette.muted,
							marginBottom: 10,
							transform: `translateX(${interpolate(frame, [0, 32], [-28, 0], {
								extrapolateRight: "clamp",
							})}px)`,
							opacity: wordmarkProgress,
						}}
					>
						AI RAP VIDEO STUDIO
					</div>
					<div
						style={{
							fontFamily: displayFont,
							fontSize: 176,
							lineHeight: 0.88,
							letterSpacing: 8,
							color: palette.text,
							textShadow: "0 10px 30px rgba(0,0,0,0.35)",
							transform: `translateX(${interpolate(frame, [0, 36], [46, 0], {
								extrapolateRight: "clamp",
							})}px) scale(${0.92 + wordmarkProgress * 0.08})`,
							opacity: wordmarkProgress,
						}}
					>
						{appName}
					</div>
				</div>
			</div>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `rgba(255,255,255,${flashOpacity})`,
					mixBlendMode: "overlay",
				}}
			/>
		</AbsoluteFill>
	);
};

const MessageScene = ({
	appName,
	tagline,
	description,
	featureBullets,
}: LaunchVideoProps) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const opacity = interpolate(
		frame,
		[0, 15, messageDuration - 15, messageDuration],
		[0, 1, 1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	const slideY = interpolate(
		frame,
		[0, 20, messageDuration - 20, messageDuration],
		[20, 0, 0, -20],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	return (
		<AbsoluteFill
			style={{
				padding: "140px 110px",
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				opacity,
				transform: `translateY(${slideY}px)`,
			}}
		>
			<div
				style={{
					width: 940,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: monoFont,
						fontSize: 24,
						letterSpacing: 10,
						color: palette.yellow,
						opacity: interpolate(frame, [0, 14], [0, 1], {
							extrapolateRight: "clamp",
						}),
					}}
				>
					LAUNCH VIDEO
				</div>
				<div
					style={{
						marginTop: 18,
						fontFamily: displayFont,
						fontSize: 174,
						lineHeight: 0.84,
						letterSpacing: 5,
						color: palette.text,
						transform: `translateY(${interpolate(frame, [0, 24], [44, 0], {
							easing: Easing.out(Easing.cubic),
							extrapolateRight: "clamp",
						})}px)`,
						opacity: interpolate(frame, [0, 14, 28], [0, 0.85, 1], {
							extrapolateRight: "clamp",
						}),
					}}
				>
					{tagline}
				</div>
				<div
					style={{
						marginTop: 30,
						maxWidth: 780,
						fontFamily: monoFont,
						fontSize: 34,
						lineHeight: 1.5,
						color: palette.muted,
						opacity: interpolate(frame, [10, 30], [0, 1], {
							extrapolateRight: "clamp",
						}),
						transform: `translateY(${interpolate(frame, [10, 34], [22, 0], {
							extrapolateRight: "clamp",
						})}px)`,
					}}
				>
					{description}
				</div>
				<div
					style={{
						marginTop: 42,
						display: "flex",
						gap: 18,
					}}
				>
					<div
						style={{
							padding: "18px 26px",
							border: `1px solid ${palette.softYellow}`,
							background: "rgba(250,204,21,0.08)",
							fontFamily: monoFont,
							fontSize: 22,
							letterSpacing: 6,
							color: palette.text,
						}}
					>
						{appName}
					</div>
					<div
						style={{
							padding: "18px 26px",
							border: `1px solid ${palette.panelBorder}`,
							background: palette.panel,
							fontFamily: monoFont,
							fontSize: 22,
							letterSpacing: 6,
							color: palette.muted,
						}}
					>
						POWERED BY ELEVENLABS
					</div>
				</div>
			</div>
			<div
				style={{
					position: "relative",
					width: 560,
					height: 560,
					flexShrink: 0,
				}}
			>
				{featureBullets.slice(0, 3).map((feature, index) => {
					const cardProgress = spring({
						fps,
						frame: Math.max(0, frame - index * 8),
						config: {
							damping: 14,
							stiffness: 90,
						},
					});
					const layout = featureLayout[index] ?? {
						top: 0.15 + index * 0.28,
						left: 0.1,
					};
					// Alternate slight rotation for visual interest
					const rotation = index === 0 ? -3 : index === 1 ? 2 : -2;
					return (
						<div
							key={feature}
							style={{
								position: "absolute",
								top: `${layout.top * 100}%`,
								left: `${layout.left * 100}%`,
								width: 260,
								padding: "22px 24px",
								border: `1px solid ${palette.panelBorder}`,
								background:
									"linear-gradient(155deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))",
								boxShadow: "0 16px 40px rgba(0,0,0,0.38)",
								transform: `translateY(${(1 - cardProgress) * 32}px) rotate(${rotation}deg) scale(${0.92 + cardProgress * 0.08})`,
								opacity: cardProgress,
							}}
						>
							<div
								style={{
									fontFamily: monoFont,
									fontSize: 18,
									letterSpacing: 4,
									color: palette.yellow,
									marginBottom: 12,
								}}
							>
								0{index + 1}
							</div>
							<div
								style={{
									fontFamily: displayFont,
									fontSize: 56,
									lineHeight: 0.95,
									letterSpacing: 1,
									color: palette.text,
								}}
							>
								{feature}
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

const DemoPlaceholder = ({ frame }: { frame: number }) => {
	const scan = interpolate(frame % 90, [0, 45, 90], [0, 1, 0]);

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				background:
					"linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `linear-gradient(180deg, transparent 0%, rgba(250,204,21,${scan * 0.12}) 48%, transparent 100%)`,
				}}
			/>
			<div
				style={{
					fontFamily: displayFont,
					fontSize: 116,
					letterSpacing: 4,
					color: palette.text,
					textAlign: "center",
				}}
			>
				APP DEMO
			</div>
			<div
				style={{
					marginTop: 20,
					fontFamily: monoFont,
					fontSize: 28,
					letterSpacing: 5,
					color: palette.muted,
					textAlign: "center",
				}}
			>
				DROP YOUR SCREEN RECORDING HERE
			</div>
		</div>
	);
};

const DemoScene = ({
	tagline,
	demoVideoSrc,
}: Pick<LaunchVideoProps, "tagline" | "demoVideoSrc">) => {
	const frame = useCurrentFrame();
	const panelLift = interpolate(frame, [0, 18], [42, 0], {
		extrapolateRight: "clamp",
	});

	const opacity = interpolate(
		frame,
		[0, 15, demoDuration - 15, demoDuration],
		[0, 1, 1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	const slideY = interpolate(
		frame,
		[0, 20, demoDuration - 20, demoDuration],
		[20, 0, 0, -20],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }
	);

	return (
		<AbsoluteFill
			style={{
				padding: "96px 90px 90px",
				display: "flex",
				flexDirection: "column",
				opacity,
				transform: `translateY(${slideY}px)`,
			}}
		>
			<div
				style={{
					fontFamily: monoFont,
					fontSize: 24,
					letterSpacing: 9,
					color: palette.yellow,
					marginBottom: 18,
					opacity: interpolate(frame, [0, 10], [0, 1], {
						extrapolateRight: "clamp",
					}),
				}}
			>
				PRODUCT WALKTHROUGH
			</div>
			<div
				style={{
					fontFamily: displayFont,
					fontSize: 144,
					lineHeight: 0.86,
					letterSpacing: 4,
					color: palette.text,
					maxWidth: 1100,
					marginBottom: 44,
					transform: `translateY(${panelLift}px)`,
					opacity: interpolate(frame, [0, 14, 28], [0, 0.8, 1], {
						extrapolateRight: "clamp",
					}),
				}}
			>
				{tagline}
			</div>
			<div
				style={{
					flex: 1,
					display: "flex",
					gap: 30,
					alignItems: "stretch",
				}}
			>
				<div
					style={{
						flex: 1,
						borderRadius: 36,
						border: `1px solid ${palette.panelBorder}`,
						background: "#090909",
						overflow: "hidden",
						boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
						position: "relative",
					}}
				>
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 62,
							zIndex: 3,
							display: "flex",
							alignItems: "center",
							padding: "0 26px",
							gap: 10,
							background: "rgba(0,0,0,0.45)",
							backdropFilter: "blur(12px)",
						}}
					>
						{range(3).map((index) => (
							<div
								key={index}
								style={{
									width: 12,
									height: 12,
									borderRadius: "50%",
									background:
										index === 0
											? "#fb7185"
											: index === 1
												? "#facc15"
												: "#4ade80",
								}}
							/>
						))}
						<div
							style={{
								marginLeft: 14,
								fontFamily: monoFont,
								fontSize: 18,
								letterSpacing: 4,
								color: "rgba(248,250,252,0.72)",
							}}
						>
							BARS.AI DEMO
						</div>
					</div>
					<div style={{ position: "absolute", inset: 0, paddingTop: 62 }}>
						{demoVideoSrc ? (
							<OffthreadVideo
								src={demoVideoSrc}
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						) : (
							<DemoPlaceholder frame={frame} />
						)}
					</div>
				</div>
				<div
					style={{
						width: 340,
						borderRadius: 30,
						border: `1px solid ${palette.panelBorder}`,
						background: palette.panel,
						padding: "34px 28px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div>
						<div
							style={{
								fontFamily: monoFont,
								fontSize: 18,
								letterSpacing: 4,
								color: palette.yellow,
							}}
						>
							SCENE NOTES
						</div>
						<div
							style={{
								marginTop: 18,
								fontFamily: monoFont,
								fontSize: 25,
								lineHeight: 1.7,
								color: palette.muted,
							}}
						>
							Use this block for your recorded product walkthrough. The
							composition already frames it as the main reveal.
						</div>
					</div>
					<div
						style={{
							paddingTop: 26,
							borderTop: `1px solid ${palette.panelBorder}`,
							fontFamily: displayFont,
							fontSize: 62,
							lineHeight: 0.95,
							color: palette.text,
						}}
					>
						REPLACE THE PLACEHOLDER WITH YOUR APP RECORDING
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const LaunchVideoComposition = (props: LaunchVideoProps) => {
	return (
		<AbsoluteFill>
			<Background frame={useCurrentFrame()} />
			<Sequence from={0} durationInFrames={introDuration}>
				<IntroScene appName={props.appName} />
			</Sequence>
			<Sequence from={introDuration} durationInFrames={messageDuration}>
				<MessageScene {...props} />
			</Sequence>
			{/* <Sequence
				from={introDuration + messageDuration}
				durationInFrames={demoDuration}
			>
				<DemoScene tagline={props.tagline} demoVideoSrc={props.demoVideoSrc} />
			</Sequence> */}
			{props.audioUrl && (
				<Audio src={props.audioUrl} />
			)}
		</AbsoluteFill>
	);
};
