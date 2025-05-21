"use client";

import { useRef, useState, useEffect } from "react";
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

const about = [
  {
    profession: "Cyber Security Leader",
    passions: "Builder | Creator | Traveler"
  }
];


// Generate a random arrangement of Jenga blocks (3 rows x 8 columns)
function generateBlocks() {
  const colors = ["#23232a", "#35353f", "#18181b", "#2a2a33"];
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

// Helper to get a random darker grayscale color
function randomGray() {
  const v = Math.floor(Math.random() * 40) + 80; // 80-120 for darker gray
  return `rgb(${v},${v},${v})`;
}

function PixelName({ name }: { name: string }) {
  // Each letter is a 5x7 grid, 1px gap between letters
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
  const grid: { on: boolean; key: string }[][] = Array.from({ length: paddedRows }, (_, r) =>
    Array.from({ length: paddedCols }, (_, c) => {
      // If in the padding, always off
      if (
        r < pad ||
        r >= pad + rows ||
        c < pad ||
        c >= pad + cols
      ) {
        return { on: false, key: `pad-${r}-${c}` };
      }
      // Otherwise, map to the original grid
      const letterIdx = Math.floor((c - pad) / 6); // 5 pixels + 1 gap
      const inGap = (c - pad) % 6 === 5;
      if (inGap) return { on: false, key: `gap-${r}-${c}` };
      const px = (c - pad) % 6;
      const on = !!letters[letterIdx]?.[r - pad]?.[px];
      return { on, key: `${letterIdx}-${r - pad}-${px}` };
    })
  );
  return (
    <div className="flex flex-col items-center mt-2">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="flex flex-row" style={{ marginBottom: gap }}>
          {row.map((cell) => (
            <div
              key={cell.key}
              style={{
                width: size,
                height: size,
                marginRight: gap,
                background: cell.on ? "#bdbdbd" : randomGray(),
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HeroBlocks({ onClick, isActive }: { onClick?: () => void; isActive?: boolean }) {
  const [blocks, setBlocks] = useState<Array<Array<string | null>> | null>(null);

  useEffect(() => {
    setBlocks(generateBlocks());
  }, []);

  if (!blocks) {
    // Optionally render a placeholder while waiting for client-side render
    return <div className="w-[272px] h-[104px]" />;
  }

  return (
    <div
      className={`flex flex-col items-center gap-2 select-none transition-shadow ${onClick ? 'cursor-pointer' : ''} ${isActive ? 'ring-4 ring-[#23232a]/60 shadow-[0_0_16px_4px_#23232a]' : ''}`}
      onClick={onClick}
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
      <PixelName name="awurster" />
    </div>
  );
}

const JENGA_COLORS = ["#23232a", "#35353f", "#18181b", "#2a2a33"];
const FIDGET_GLOW = '#d0e2d6';

function generateRuneGrid(size = 3) {
  // 3x3 grid, random fill, bias toward sparsity
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => (Math.random() > 0.5 ? 1 : 0))
  );
}

function generateColorGrid(size = 3) {
  // For each cell, pick a random Jenga color
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => JENGA_COLORS[Math.floor(Math.random() * JENGA_COLORS.length)])
  );
}

function playTone(freq: number) {
  if (typeof window === 'undefined') return;
  const ctx: AudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  o.start();
  o.stop(ctx.currentTime + 0.25);
  o.onended = () => ctx.close();
}

function FidgetSpinner({ freq }: { freq: number }) {
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [colorGrid, setColorGrid] = useState<string[][] | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setGrid(generateRuneGrid(3));
    setColorGrid(generateColorGrid(3));
  }, []);

  const handleClick = () => {
    setActive(true);
    playTone(freq);
    setTimeout(() => setActive(false), 300);
  };

  if (!grid || !colorGrid) {
    // Optionally render a placeholder
    return <div style={{ width: 44, height: 44 }} />;
  }

  // Each block is 16x16px, gap 2px, so total size: 3*16 + 2*2 = 52px
  return (
    <button
      className={`transition-all duration-200 outline-none focus:outline-none rounded-xl shadow-lg p-1 ${active ? 'ring-4 ring-[#d0e2d6]/40 shadow-[0_0_16px_4px_#d0e2d6]' : ''}`}
      style={{ width: 60, height: 60, display: 'inline-block', background: 'none' }}
      onClick={handleClick}
      aria-label="Fidget Spinner"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
        {grid.flatMap((row, rIdx) =>
          row.map((on, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              className="w-4 h-4 rounded-[2px]"
              style={{
                background: on ? (active ? FIDGET_GLOW : colorGrid[rIdx][cIdx]) : '#18181b',
                opacity: on ? 0.95 : 0.5,
                boxShadow: on && active ? `0 0 8px 2px ${FIDGET_GLOW}` : undefined,
                transition: 'box-shadow 0.2s, background 0.2s',
              }}
            />
          ))
        )}
      </div>
    </button>
  );
}

function FidgetSpinners() {
  // 5 unique tones (C4, D4, E4, G4, A4)
  const tones = [261.63, 293.66, 329.63, 392.00, 440.00];
  return (
    <div className="w-full flex flex-row items-center justify-center gap-6 py-10">
      {tones.map((freq, idx) => (
        <FidgetSpinner key={idx} freq={freq} />
      ))}
    </div>
  );
}

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [openPanel, setOpenPanel] = useState<null | 'email' | 'linkedin' | 'github'>(null);

  // Toggle logic for each panel
  const handleToggle = (panel: 'about' | 'email' | 'linkedin' | 'github') => {
    if (panel === 'about') setShowAbout((v) => !v);
    else setOpenPanel((curr) => (curr === panel ? null : panel));
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-[80vh] w-full">
        <HeroBlocks onClick={() => setShowAbout((v) => !v)} isActive={showAbout} />
        {/* About Panel directly below awurster panel, toggled by click */}
        {showAbout && (
          <section className="w-full max-w-xs bg-[#18181b]/80 rounded-[2px] shadow-lg shadow-[#23232a]/30 border border-[#23232a] px-5 py-3 flex flex-col items-center gap-2 mt-4 mb-1 backdrop-blur-md animate-fade-in">
            {about.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-base text-gray-300 text-center font-semibold">{item.profession}</span>
                <span className="text-xs text-gray-400 text-center">{item.passions}</span>
              </div>
            ))}
          </section>
        )}
        {/* Fidget Spinners directly below awurster panel, pushed down if About is open */}
        <div className="mt-2">
          <FidgetSpinners />
        </div>
      </section>

      {/* Social/Jenga Buttons at the bottom */}
      <div className="fixed bottom-8 left-0 right-0 flex flex-row items-center justify-center gap-6 z-50">
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
    </main>
  );
}