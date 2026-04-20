export const Route = createFileRoute('/')({
  component: App,
})

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

const WORDS = ["ANYTHING", "CRYPTO", "YOUR EX", "A MANGO", "ELON MUSK", "YOUR MOM", "THE MOON", "MONDAYS"];

const GlitchText = ({ text, className = "" }) => {
  return (
    <span className={`relative inline-block ${className}`} data-text={text}>
      <span className="glitch-layer" aria-hidden="true">{text}</span>
      <span className="glitch-layer2" aria-hidden="true">{text}</span>
      {text}
    </span>
  );
};

const FloatingParticle = ({ style }) => (
  <div className="absolute w-px bg-yellow-400 opacity-20 animate-pulse" style={style} />
);

export default function App() {
  const [topic, setTopic] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setIsTransitioning(false);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: -0.3 - Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSubmit = () => {
    if (!topic.trim()) return;
    sessionStorage.setItem('rippy_pending_topic', topic.trim());
    navigate({ to: '/rap' });
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

        * { box-sizing: border-box; }
        body { background: #000; }

        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-mono-custom { font-family: 'Space Mono', monospace; }

        .glitch-layer {
          position: absolute; top: 0; left: 0;
          color: #ff0055; clip-path: inset(0 0 70% 0);
          animation: glitch1 3s infinite;
          pointer-events: none;
        }
        .glitch-layer2 {
          position: absolute; top: 0; left: 0;
          color: #00ffcc; clip-path: inset(70% 0 0 0);
          animation: glitch2 3s infinite;
          pointer-events: none;
        }

        @keyframes glitch1 {
          0%,94%,100% { transform: translate(0); opacity: 0; }
          95% { transform: translate(-3px, 1px); opacity: 1; }
          97% { transform: translate(3px, -1px); opacity: 1; }
        }
        @keyframes glitch2 {
          0%,94%,100% { transform: translate(0); opacity: 0; }
          96% { transform: translate(2px, 2px); opacity: 1; }
          98% { transform: translate(-2px, -1px); opacity: 1; }
        }

        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .scanline {
          position: fixed; left: 0; width: 100%;
          height: 2px; background: rgba(250,204,21,0.08);
          animation: scanline 6s linear infinite;
          pointer-events: none; z-index: 50;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeSlideUp 0.8s ease forwards; }
        .fade-in-2 { animation: fadeSlideUp 0.8s 0.2s ease forwards; opacity: 0; }
        .fade-in-3 { animation: fadeSlideUp 0.8s 0.4s ease forwards; opacity: 0; }
        .fade-in-4 { animation: fadeSlideUp 0.8s 0.6s ease forwards; opacity: 0; }

        .word-swap {
          transition: opacity 0.3s, transform 0.3s;
          display: inline-block;
        }
        .word-swap.out { opacity: 0; transform: translateY(-8px); }

        .input-bar {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(250,204,21,0.3);
          color: white;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-bar:focus {
          outline: none;
          border-color: rgba(250,204,21,0.9);
          box-shadow: 0 0 0 2px rgba(250,204,21,0.15);
        }
        .input-bar::placeholder { color: rgba(255,255,255,0.25); }

        .cta-btn {
          background: #facc15;
          color: #000;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.1em;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(250,204,21,0.4); }
        .cta-btn:active { transform: scale(0.97); }
        .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .pill {
          border: 1px solid rgba(250,204,21,0.25);
          color: rgba(250,204,21,0.7);
          font-size: 11px;
          letter-spacing: 0.15em;
        }

        .step-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.2s, background 0.2s;
        }
        .step-card:hover {
          border-color: rgba(250,204,21,0.25);
          background: rgba(250,204,21,0.03);
        }

        .ticker {
          white-space: nowrap;
          animation: ticker 20s linear infinite;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 256px;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(250,204,21,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Scanline effect */}
      <div className="scanline" />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-50" />

      {/* Noise overlay */}
      <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />

      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(250,204,21,0.07) 0%, transparent 70%)" }} />

      {/* Content */}
      <div className="relative z-10">

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-5 fade-in">
          <div className="font-display text-xl tracking-widest text-yellow-400">BARS.AI</div>
          <div className="flex items-center gap-6 text-xs tracking-widest text-white/30 font-mono-custom">
            <span className="hidden md:block">HOW IT WORKS</span>
            <span className="hidden md:block">EXAMPLES</span>
            <button className="pill px-4 py-2 rounded-sm hover:bg-yellow-400/10 transition-colors">
              GET EARLY ACCESS
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-10 pb-20">

          <div className="pill px-4 py-2 rounded-sm mb-8 fade-in inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
            POWERED BY ELEVENLABS
          </div>

          <h1 className="font-display  leading-none tracking-wider fade-in-2">
            <GlitchText text="DROP A" className="text-white" />
            <br />
            <span className="text-yellow-400">
              <GlitchText text="RAP VIDEO" />
            </span>
            <br />
            <span className="text-white/20 tracking-[0.3em] block mt-2 font-mono-custom font-bold">
              ABOUT
            </span>
            <span
              className={`word-swap text-white ${isTransitioning ? "out" : ""}`}
              style={{ display: "block" }}
            >
              <GlitchText text={WORDS[wordIndex]} />
            </span>
          </h1>

          <p className="mt-8 text-white/40 text-sm md:text-base max-w-md leading-relaxed fade-in-3 font-mono-custom">
            Type any topic. We write the bars, voice them, and render a cinematic lyric video — in seconds.
          </p>

          {/* Input */}
          <div className="mt-12 w-full max-w-xl fade-in-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. my landlord, quantum physics, tacos..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="input-bar flex-1 px-5 py-4 text-sm font-mono-custom rounded-sm"
              />
              <button
                onClick={handleSubmit}
                disabled={!topic.trim()}
                className="cta-btn px-8 py-4 text-xl rounded-sm whitespace-nowrap"
              >
                GENERATE →
              </button>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-3 text-white/25 text-xs font-mono-custom fade-in-4">
            <div className="flex -space-x-2">
              {["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4"].map((c,i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-black/50"
                  style={{ background: c }} />
              ))}
            </div>
            <span>1,200+ videos generated this week</span>
          </div>
        </section>

        {/* Ticker */}
        <div className="border-y border-white/5 py-3 overflow-hidden bg-yellow-400/5 mb-24">
          <div className="ticker flex gap-12 text-yellow-400/50 text-xs tracking-[0.3em] font-display text-lg">
            {Array(6).fill(null).map((_,i) => (
              <span key={i} className="flex gap-12">
                <span>AI LYRICS</span>
                <span className="text-white/20">✦</span>
                <span>ELEVENLABS VOICE</span>
                <span className="text-white/20">✦</span>
                <span>CINEMATIC CAPTIONS</span>
                <span className="text-white/20">✦</span>
                <span>ANY TOPIC</span>
                <span className="text-white/20">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-yellow-400/50 text-xs tracking-[0.3em] font-mono-custom mb-3">THE PROCESS</p>
            <h2 className="font-display text-6xl md:text-8xl tracking-wider text-white">
              HOW IT <span className="text-yellow-400">WORKS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                title: "YOU DROP THE TOPIC",
                desc: "Literally anything. Your dog, geopolitics, a sandwich. We don't judge.",
                icon: "✍️",
              },
              {
                num: "02",
                title: "AI WRITES THE BARS",
                desc: "AI generates fire lyrics with flow, rhyme scheme, and actual punchlines.",
                icon: "🤖",
              },
              {
                num: "03",
                title: "ELEVENLABS SPITS IT",
                desc: "A hyper-realistic AI voice delivers the rap with real cadence and energy.",
                icon: "🎤",
              },
              {
                num: "04",
                title: "CAPTIONS GO HARD",
                desc: "Lyrics appear word-by-word synced to the audio. Legendary edit vibes.",
                icon: "🎬",
              },
              {
                num: "05",
                title: "DOWNLOAD & SHARE",
                desc: "Your video is ready in seconds. Post it. Watch people lose their minds.",
                icon: "🚀",
              },
              {
                num: "06",
                title: "GO VIRAL",
                desc: "Totally optional. But also completely inevitable.",
                icon: "🔥",
              },
            ].map((step) => (
              <div key={step.num} className="step-card rounded-sm p-6 group">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="font-display text-yellow-400/40 text-5xl mb-2 group-hover:text-yellow-400/60 transition-colors">
                  {step.num}
                </div>
                <h3 className="font-display text-xl tracking-wider text-white mb-2">{step.title}</h3>
                <p className="text-white/35 text-xs leading-relaxed font-mono-custom">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preview section */}
        <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-yellow-400/50 text-xs tracking-[0.3em] font-mono-custom mb-3">THE OUTPUT</p>
            <h2 className="font-display text-6xl md:text-8xl tracking-wider text-white">
              WHAT YOU <span className="text-yellow-400">GET</span>
            </h2>
          </div>

          {/* Fake video preview */}
          <div className="relative max-w-2xl mx-auto rounded-sm overflow-hidden border border-white/10"
            style={{ aspectRatio: "16/9", background: "#0a0a0a" }}>
            {/* Background */}
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #000 70%)" }} />

            {/* Animated bars */}
            <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 px-8 pb-2 opacity-30">
              {Array(40).fill(null).map((_, i) => (
                <div key={i} className="flex-1 bg-yellow-400 rounded-t-sm"
                  style={{
                    height: `${20 + Math.sin(i * 0.8) * 15 + Math.cos(i * 0.5) * 10}px`,
                    animation: `loadBlink ${0.5 + (i % 5) * 0.15}s infinite`,
                    animationDelay: `${i * 0.05}s`
                  }} />
              ))}
            </div>

            {/* Lyric display */}
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <div className="font-display text-white/10 text-xs tracking-[0.4em] mb-6">NOW PLAYING</div>
              <LyricDemo />
            </div>

            {/* Corner labels */}
            <div className="absolute top-3 left-3 text-white/20 text-xs font-mono-custom tracking-widest">BARS.AI</div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white/20 text-xs font-mono-custom">LIVE PREVIEW</span>
            </div>
          </div>

          <p className="text-center text-white/25 text-xs font-mono-custom mt-4 tracking-widest">
            CAPTIONS SYNC WORD-BY-WORD TO THE AUDIO
          </p>
        </section>

        {/* CTA bottom */}
        <section className="px-6 py-24 text-center border-t border-white/5"
          style={{ background: "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(250,204,21,0.05) 0%, transparent 70%)" }}>
          <p className="text-yellow-400/50 text-xs tracking-[0.3em] font-mono-custom mb-4">READY?</p>
          <h2 className="font-display text-7xl md:text-[10rem] leading-none tracking-wider text-white mb-8">
            START<br /><span className="text-yellow-400">RAPPING</span>
          </h2>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="input-bar flex-1 px-4 py-3 text-sm font-mono-custom rounded-sm"
            />
            <button className="cta-btn px-6 py-3 text-lg rounded-sm">
              JOIN
            </button>
          </div>
          <p className="mt-4 text-white/15 text-xs font-mono-custom">
            Early access. No spam. Pure bars.
          </p>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-lg tracking-widest text-yellow-400/50">BARS.AI</div>
          <p className="text-white/15 text-xs font-mono-custom tracking-widest">
            BUILT WITH ELEVENLABS × FFMPEG
          </p>
          <p className="text-white/15 text-xs font-mono-custom">© 2025 BARS.AI</p>
        </footer>
      </div>
    </div>
  );
}

const LYRICS = [
  ["They said", "pick a topic,"],
  ["I said", "hold my mic —"],
  ["BARS.AI", "going live"],
  ["every", "single night 🔥"],
];

function LyricDemo() {
  const [line, setLine] = useState(0);
  const [word, setWord] = useState(0);
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    const currentLine = LYRICS[line];
    if (word < currentLine.length) {
      const t = setTimeout(() => {
        setVisible((v) => [...v, currentLine[word]]);
        setWord((w) => w + 1);
      }, 400);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        const next = (line + 1) % LYRICS.length;
        setLine(next);
        setWord(0);
        setVisible([]);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [line, word]);

  return (
    <div className="text-center px-8">
      <div className="font-display text-3xl md:text-5xl text-white tracking-wider leading-tight min-h-[3rem]">
        {visible.map((w, i) => (
          <span key={`${line}-${i}`} className="inline-block mx-1"
            style={{ animation: "fadeSlideUp 0.2s ease forwards" }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}