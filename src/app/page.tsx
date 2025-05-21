"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import { FidgetSpinner } from "./components/FidgetSpinner";
import { RectFidgetSpinner } from "./components/RectFidgetSpinner";
import { DrumSequencer } from "./components/DrumSequencer";
import { playToneHold, stopToneHold, playHarmonium, generateRandomJazzChord, playAmbientBass, playAmbientBassVariation1, playAmbientBassVariation2, playAmbientPad, generateMysteriousChord } from "./music";

const about = [
  {
    profession: "Security Leader",
    passions: "Builder | Creator | Traveler"
  }
];


// Generate a random arrangement of Jenga blocks (3 rows x 8 columns)
function generateBlocks() {
  // Use a more harmonious palette
  const colors = ["#23232a", "#3a4a5a", "#4e6e7a", "#b5c8ac"];
  const grid = Array.from({ length: 3 }, () =>
    Array.from({ length: 8 }, () => (Math.random() > 0.4 ? colors[Math.floor(Math.random() * colors.length)] : null))
  );
  return grid;
}

// Pixel font for 'awurster' (5x7 grid per letter, lowercase monospace style)
const pixelFont: Record<string, number[][]> = {
  a: [
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1],
  ],
  w: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 0, 1, 0],
  ],
  u: [
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 1, 0],
  ],
  r: [
    [0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  s: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  t: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  e: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
  ],
};

function PixelName({ name, highlight = false }: { name: string, highlight?: boolean }) {
  // Each letter is a 5x7 grid, 1px gap between letters
  const letterPalette = [
    "#18181b", // 5% darker
    "#23232a", // base
    "#35353f", // base
    "#44444a", // 5% lighter
  ];
  // Blend #23232a (grey) with #b5c8ac (green) at 10%: result is #262a28
  const subtleGreenGrey = "#444745";
  const letters = name.toLowerCase().split("").map((char) => pixelFont[char]);
  const rows = 7;
  const cols = letters.length * 5 + (letters.length - 1);
  // Add 4 unused blocks on all sides
  const pad = 4;
  const paddedRows = rows + pad * 2;
  const paddedCols = cols + pad * 2;
  // Calculate pixel size so the grid matches the width of 8 jenga blocks (8*32px + 7*1px gap = 263px)
  // Make the blocks a touch bigger by adding a few px to totalWidth
  const totalWidth = 8 * 32 + 7 * 1 + 8; // 271px (add 8px for a touch bigger)
  const size = Math.floor((totalWidth - (paddedCols - 1)) / paddedCols); // px, size of each pixel
  const gap = 1; // px, gap between pixels
  // Precompute the grid for deterministic rendering
  const grid: { on: boolean; key: string; color: string }[][] = Array.from({ length: paddedRows }, (_, r) =>
    Array.from({ length: paddedCols }, (_, c) => {
      // If in the padding, always off
      if (
        r < pad ||
        r >= pad + rows ||
        c < pad ||
        c >= pad + cols
      ) {
        return { on: false, key: `pad-${r}-${c}`, color: subtleGreenGrey };
      }
      // Otherwise, map to the original grid
      const letterIdx = Math.floor((c - pad) / 6); // 5 pixels + 1 gap
      const inGap = (c - pad) % 6 === 5;
      if (inGap) return { on: false, key: `gap-${r}-${c}`, color: subtleGreenGrey };
      const px = (c - pad) % 6;
      const on = !!letters[letterIdx]?.[r - pad]?.[px];
      // Use only dark greys for on pixels, subtle green-tinted grey for off
      const color = on ? letterPalette[(letterIdx + r + px) % letterPalette.length] : subtleGreenGrey;
      return { on, key: `${letterIdx}-${r - pad}-${px}`, color };
    })
  );
  return (
    <div className={`flex flex-col items-center mt-2 transition-all duration-200 ${highlight ? 'ring-2 ring-[#b5c8ac]/40' : ''}`}
      style={highlight ? { boxShadow: '0 0 0 4px rgba(72, 81, 69, 1)', borderRadius: 6 } : {}}>
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="flex flex-row" style={{ marginBottom: gap }}>
          {row.map((cell, colIdx) => {
            // Make the four corners slightly darker for a rounded look
            const isCorner =
              (rowIdx === 0 && colIdx === 0) ||
              (rowIdx === 0 && colIdx === grid[0].length - 1) ||
              (rowIdx === grid.length - 1 && colIdx === 0) ||
              (rowIdx === grid.length - 1 && colIdx === grid[0].length - 1);
            return (
              <div
                key={cell.key}
                style={{
                  width: size,
                  height: size,
                  marginRight: gap,
                  background: isCorner ? subtleGreenGrey : cell.color,
                  borderRadius: 1,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HeroBlocks({ onClick, isActive, soundIsPlaying, harmoniumActive }: { onClick?: () => void; isActive?: boolean, soundIsPlaying?: boolean, harmoniumActive?: boolean }) {
  const [blocks, setBlocks] = useState<Array<Array<string | null>> | null>(null);
  const [pixelRefreshKey, setPixelRefreshKey] = useState(0);

  useEffect(() => {
    setBlocks(generateBlocks());
  }, [pixelRefreshKey]);

  if (!blocks) {
    // Optionally render a placeholder while waiting for client-side render
    return <div className="w-[272px] h-[104px]" />;
  }

  return (
    <div
      className={`flex flex-col items-center gap-2 select-none transition-shadow ${onClick ? 'cursor-pointer p-6' : ''} rounded-[4px] ${(soundIsPlaying || harmoniumActive) ? 'ring-6 ring-[#b5c8ac]/60' : ''}`}
      onClick={() => {
        if (onClick) onClick();
        setPixelRefreshKey((k) => k + 1);
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-pressed={isActive}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      style={onClick ? { outline: 'none' } : {}}
      title={onClick ? 'Show About' : undefined}
    >
      {/* Jenga block grid */}
      <div className="grid grid-cols-8 grid-rows-3 gap-1">
        {blocks.map((row, rowIdx) =>
          row.map((color, colIdx) =>
            color ? (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="w-8 h-8"
                style={{ background: color, borderRadius: "2px" }}
              />
            ) : (
              <div key={`${rowIdx}-${colIdx}`} className="w-8 h-8 bg-transparent" />
            )
          )
        )}
      </div>
      {/* Pixelated name below blocks */}
      <PixelName name="awurster" highlight={soundIsPlaying || harmoniumActive} />
    </div>
  );
}

// Add a simple useIsMobile hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 640);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

type FidgetSpinnersProps = { triggerSoundActive: () => void };
function FidgetSpinners({ triggerSoundActive }: FidgetSpinnersProps) {
  const isMobile = useIsMobile();
  const tones = useMemo(() => [261.63, 293.66, 329.63, 392.00, 440.00], []);
  const keyMap = useMemo(() => ['q', 'w', 'e', 'r', 't', 's', 'd'], []);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [rectActive, setRectActive] = useState<'bass' | 'pad' | null>(null);
  const keyPressTimestamps = useRef<{ [key: string]: number[] }>({});
  const octaveShiftNext = useRef<{ [key: string]: number }>({}); // -1 for down, +1 for up

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (keyMap.includes(key)) {
        // --- Octave shift logic: 3 presses within 4s triggers, randomly up or down ---
        const now = Date.now();
        if (!keyPressTimestamps.current[key]) keyPressTimestamps.current[key] = [];
        keyPressTimestamps.current[key].push(now);
        // Keep only last 3
        keyPressTimestamps.current[key] = keyPressTimestamps.current[key].filter(t => now - t < 4000);
        if (
          keyPressTimestamps.current[key].length === 3
        ) {
          octaveShiftNext.current[key] = Math.random() < 0.5 ? -1 : 1; // -1 = down, +1 = up
          keyPressTimestamps.current[key] = [];
        }
        // ---
        if (["q", "w", "e", "r", "t"].includes(key)) {
          const idx = keyMap.indexOf(key);
          const octaveShift = octaveShiftNext.current[key] || 0;
          playToneHold(tones[idx] * (octaveShift === -1 ? 0.5 : octaveShift === 1 ? 2 : 1), idx);
          if (octaveShift) octaveShiftNext.current[key] = 0;
          setActiveIdx(idx);
        } else if (key === "s") {
          const octaveShift = octaveShiftNext.current[key] || 0;
          if (e.getModifierState("Shift") && e.code === "ShiftLeft") {
            playAmbientBassVariation1(octaveShift === -1);
          } else if (e.getModifierState("Shift") && e.code === "ShiftRight") {
            playAmbientBassVariation2(octaveShift === -1);
          } else {
            playAmbientBass(octaveShift === -1);
          }
          if (octaveShift) octaveShiftNext.current[key] = 0;
          setRectActive("bass");
        } else if (key === "d") {
          const octaveShift = octaveShiftNext.current[key] || 0;
          const third = e.getModifierState("Shift");
          playAmbientPad(octaveShift === -1, third);
          if (octaveShift) octaveShiftNext.current[key] = 0;
          setRectActive("pad");
        }
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (keyMap.includes(key)) {
        if (["q", "w", "e", "r", "t"].includes(key)) {
          const idx = keyMap.indexOf(key);
          setActiveIdx(null);
          stopToneHold(idx);
        } else if (key === 's' || key === 'd') {
          setRectActive(null);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      Object.keys({ ...tones }).forEach(idx => stopToneHold(Number(idx)));
    };
  }, [keyMap, tones]);

  return (
    <>
      <div className={`w-full flex flex-row items-center justify-center ${isMobile ? 'gap-2 py-4' : 'gap-6 py-10'}`}>
        {tones.map((freq, idx) => (
          <FidgetSpinner
            key={idx}
            freq={freq}
            isActive={activeIdx === idx}
            onKeyboardTrigger={() => {
              setActiveIdx(idx);
              triggerSoundActive();
            }}
            idx={idx}
            mobile={isMobile}
          />
        ))}
      </div>
      <div className={`w-full flex flex-row items-center justify-center ${isMobile ? 'gap-2 pb-4' : 'gap-10 pb-10'}`}>
        <RectFidgetSpinner type="bass" isActive={rectActive === 'bass'} onKeyboardTrigger={() => {
          setRectActive('bass');
          triggerSoundActive();
        }} mobile={isMobile} />
        <RectFidgetSpinner type="pad" isActive={rectActive === 'pad'} onKeyboardTrigger={() => {
          setRectActive('pad');
          triggerSoundActive();
        }} mobile={isMobile} />
      </div>
      <DrumSequencer />
    </>
  );
}

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [openPanel, setOpenPanel] = useState<null | 'email' | 'linkedin' | 'github'>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [soundIsPlaying, setSoundIsPlaying] = useState(false);
  const [activeHarmoniumIdx, setActiveHarmoniumIdx] = useState<number | null>(null);

  // --- Harmonium jazz chords easter egg ---
  const jazzChordsRef = useRef<number[][]>([]);
  useEffect(() => {
    // Generate 4 random jazz chords on mount
    jazzChordsRef.current = [
      generateRandomJazzChord(), // 1
      generateMysteriousChord(), // 2
      generateRandomJazzChord(), // 3
      generateMysteriousChord(), // 4
    ];
  }, []);

  // Custom onClick for HeroBlocks to play harmonium if About is not open
  const handleHeroClick = () => {
    playHarmonium();
    if (!showAbout) {
      setShowAbout(true);
    }
  };

  // --- Sound playing tracking ---
  // Helper to set soundIsPlaying true for a short time when any sound is triggered
  function triggerSoundActive() {
    setSoundIsPlaying(true);
    clearTimeout((triggerSoundActive as { _timeout?: ReturnType<typeof setTimeout> })._timeout);
    (triggerSoundActive as { _timeout?: ReturnType<typeof setTimeout> })._timeout = setTimeout(() => setSoundIsPlaying(false), 3500);
  }

  // Add keydown listener for '1'-'5' to trigger harmonium chords
  useEffect(() => {
    function handleHarmoniumKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key === '3') {
        playHarmonium(); // default C major
        setActiveHarmoniumIdx(2);
      } else if (["1", "2", "4", "5"].includes(e.key)) {
        const idx = { "1": 0, "2": 1, "4": 3, "5": 4 }[e.key as "1" | "2" | "4" | "5"];
        playHarmonium(jazzChordsRef.current[idx]);
        setActiveHarmoniumIdx(idx);
      }
    }
    function handleHarmoniumKeyUp(e: KeyboardEvent) {
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        setActiveHarmoniumIdx(null);
      }
    }
    window.addEventListener('keydown', handleHarmoniumKey);
    window.addEventListener('keyup', handleHarmoniumKeyUp);
    return () => {
      window.removeEventListener('keydown', handleHarmoniumKey);
      window.removeEventListener('keyup', handleHarmoniumKeyUp);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground">
      {/* Hero Section */}
      <section className={`flex flex-col items-center justify-center h-[80vh] w-full relative ${isMobile ? 'mt-20' : 'mt-0'}`}>
        <div ref={heroRef} className="relative z-10">
          <HeroBlocks onClick={handleHeroClick} isActive={showAbout} soundIsPlaying={soundIsPlaying} harmoniumActive={activeHarmoniumIdx !== null} />
        </div>
        <div className="mt-2 z-0">
          <FidgetSpinners triggerSoundActive={triggerSoundActive} />
        </div>
      </section>

      {/* Social/Jenga Buttons and About Panel at the bottom */}
      <div className={`w-full flex flex-col items-center justify-end ${isMobile ? 'static mt-6 mb-4' : 'fixed bottom-0 left-0 right-0'} z-50`}>
        {/* Social Icons Row */}
        <div className="flex flex-row items-center justify-center gap-6">
          {/* Email Accordion */}
          <div className="relative flex flex-col items-center">
            {/* Panel slides out above the button */}
            <div
              className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-all duration-300 ${openPanel === 'email' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
              style={{ minWidth: 220 }}
            >
              <section className="flex flex-col items-center gap-2 bg-[#18181b]/80 rounded-[2px] shadow-2xl shadow-[#23232a]/40 border border-[#23232a] p-6 backdrop-blur-md">
                <h2 className="text-lg font-semibold text-foreground">Email</h2>
                <span className="select-all text-gray-400 text-sm">
                  <span>{"www"}</span>
                  <span className="hidden">[at]</span>
                  <span className="mx-1">@</span>
                  <span>{"awurster"}</span>
                  <span className="hidden">[dot]</span>
                  <span className="mx-1">.</span>
                  <span>{"com"}</span>
                </span>
              </section>
            </div>
            <button
              className={`w-12 h-12 flex items-center justify-center rounded-[2px] shadow-lg transition-all duration-200 border border-[#35353f] bg-[#23232a] hover:bg-[#35353f] ${openPanel === 'email' ? 'ring-4 ring-[#23232a]/60 shadow-[0_0_16px_4px_#23232a]' : ''}`}
              onClick={() => setOpenPanel(openPanel === 'email' ? null : 'email')}
              aria-label="Email"
            >
              <FaEnvelope className="text-[#bdbdbd] text-2xl" />
            </button>
          </div>
          {/* LinkedIn Accordion */}
          <div className="relative flex flex-col items-center">
            <div
              className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-all duration-300 ${openPanel === 'linkedin' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
              style={{ minWidth: 220 }}
            >
              <section className="flex flex-col items-center gap-2 bg-[#18181b]/80 rounded-[2px] shadow-2xl shadow-[#23232a]/40 border border-[#23232a] p-6 backdrop-blur-md">
                <h2 className="text-lg font-semibold text-foreground">LinkedIn</h2>
                <a href="https://www.linkedin.com/in/awurster-sec/" target="_blank" rel="noopener noreferrer" className="text-[#7fffd4] hover:underline text-sm">@awurster-sec</a>
              </section>
            </div>
            <button
              className={`w-12 h-12 flex items-center justify-center rounded-[2px] shadow-lg transition-all duration-200 border border-[#35353f] bg-[#23232a] hover:bg-[#35353f] ${openPanel === 'linkedin' ? 'ring-4 ring-[#23232a]/60 shadow-[0_0_16px_4px_#23232a]' : ''}`}
              onClick={() => setOpenPanel(openPanel === 'linkedin' ? null : 'linkedin')}
              aria-label="LinkedIn"
            >
              <FaLinkedin className="text-[#bdbdbd] text-2xl" />
            </button>
          </div>
          {/* GitHub Accordion */}
          <div className="relative flex flex-col items-center">
            <div
              className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-all duration-300 ${openPanel === 'github' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
              style={{ minWidth: 220 }}
            >
              <section className="flex flex-col items-center gap-2 bg-[#18181b]/80 rounded-[2px] shadow-2xl shadow-[#23232a]/40 border border-[#23232a] p-6 backdrop-blur-md">
                <h2 className="text-lg font-semibold text-foreground">GitHub</h2>
                <a href="https://github.com/awurster" target="_blank" rel="noopener noreferrer" className="text-[#7fffd4] hover:underline text-sm">@awurster</a>
              </section>
            </div>
            <button
              className={`w-12 h-12 flex items-center justify-center rounded-[2px] shadow-lg transition-all duration-200 border border-[#35353f] bg-[#23232a] hover:bg-[#35353f] ${openPanel === 'github' ? 'ring-4 ring-[#23232a]/60 shadow-[0_0_16px_4px_#23232a]' : ''}`}
              onClick={() => setOpenPanel(openPanel === 'github' ? null : 'github')}
              aria-label="GitHub"
            >
              <FaGithub className="text-[#bdbdbd] text-2xl" />
            </button>
          </div>
        </div>
        {/* About Panel below social icons */}
        {showAbout && (
          <div className="w-full flex justify-center animate-fade-in mt-10 mb-8">
            <section className="w-full max-w-[400px] min-w-[320px] bg-[#18181b]/80 rounded-[2px] shadow-lg shadow-[#23232a]/30 border border-[#23232a] px-5 py-2 flex flex-col items-center gap-2 backdrop-blur-md" style={{ height: '60px' }}>
              {about.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-base text-gray-300 text-center font-semibold" style={{ fontSize: '0.95rem' }}>{item.profession}</span>
                  <span className="text-xs text-gray-400 text-center" style={{ fontSize: '0.7rem' }}>{item.passions}</span>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}