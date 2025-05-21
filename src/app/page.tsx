"use client";

import { useRef, useState, useEffect } from "react";
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

const about = [
  {
    profession: "Security Leader",
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
                  background: isCorner ? '#18181b' : (cell.on ? "#bdbdbd" : randomGray()),
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
      className={`flex flex-col items-center gap-2 select-none transition-shadow ${onClick ? 'cursor-pointer p-6' : ''} ${isActive ? 'ring-2 ring-[#23232a]/40 shadow-[0_0_4px_1px_#23232a]' : ''}`}
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

// Store active oscillators/gains for top row notes
const activeNotes: { [idx: number]: { ctx: AudioContext, o: OscillatorNode, g: GainNode, f: BiquadFilterNode, started: number } } = {};

function playToneHold(freq: number, idx: number) {
  if (typeof window === 'undefined') return;
  if (activeNotes[idx]) return; // already playing
  const ctx: AudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  o.type = 'sine';
  o.frequency.value = freq;
  f.type = 'lowpass';
  f.frequency.setValueAtTime(1200, ctx.currentTime);
  f.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5); // gentle sweep
  o.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  o.start();
  activeNotes[idx] = { ctx, o, g, f, started: ctx.currentTime };
}

function stopToneHold(idx: number) {
  const note = activeNotes[idx];
  if (!note) return;
  const { ctx, o, g, f, started } = note;
  const now = ctx.currentTime;
  // Ensure note plays for at least 0.5s
  const minDuration = 0.5;
  const elapsed = now - started;
  const release = 2.0; // even longer release
  const stopAt = elapsed < minDuration ? now + (minDuration - elapsed) + release : now + release;
  g.gain.cancelScheduledValues(now);
  g.gain.setValueAtTime(g.gain.value, now);
  // Use exponential ramp for a more natural fade
  g.gain.exponentialRampToValueAtTime(0.0001, stopAt);
  // Add filter sweep to soften the end
  f.frequency.cancelScheduledValues(now);
  f.frequency.setValueAtTime(f.frequency.value, now);
  f.frequency.linearRampToValueAtTime(80, stopAt);
  // Add a larger tail after fade before stopping
  o.stop(stopAt + 0.15);
  o.onended = () => ctx.close();
  delete activeNotes[idx];
}

function FidgetSpinner({ freq, isActive = false, onKeyboardTrigger, idx }: { freq: number, isActive?: boolean, onKeyboardTrigger?: () => void, idx?: number }) {
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [colorGrid, setColorGrid] = useState<string[][] | null>(null);
  const [active, setActive] = useState(false);
  const mouseNoteRef = useRef<number | null>(null);

  useEffect(() => {
    setGrid(generateRuneGrid(3));
    setColorGrid(generateColorGrid(3));
  }, []);

  useEffect(() => {
    if (isActive && onKeyboardTrigger && typeof idx === 'number') {
      setActive(true);
      // Keyboard: let note ring out, handled by playToneHold
    } else if (!isActive && typeof idx === 'number') {
      setActive(false);
    }
  }, [isActive]);

  // For mouse: play note on mouse down, release on mouse up, with long release
  function handleMouseDown() {
    if (typeof idx !== 'number') return;
    setActive(true);
    playToneHold(freq, idx);
    mouseNoteRef.current = idx;
  }
  function handleMouseUp() {
    if (typeof idx !== 'number') return;
    setActive(false);
    stopToneHold(idx);
    mouseNoteRef.current = null;
  }
  function handleMouseLeave() {
    if (typeof idx !== 'number') return;
    if (mouseNoteRef.current !== null) {
      setActive(false);
      stopToneHold(idx);
      mouseNoteRef.current = null;
    }
  }

  if (!grid || !colorGrid) {
    // Optionally render a placeholder
    return <div style={{ width: 44, height: 44 }} />;
  }

  // Each block is 16x16px, gap 2px, so total size: 3*16 + 2*2 = 52px
  return (
    <button
      className={`transition-all duration-200 outline-none focus:outline-none rounded-[2px] shadow-lg p-1 ${(active || isActive) ? 'ring-4 ring-[#d0e2d6]/40 shadow-[0_0_16px_4px_#d0e2d6]' : ''}`}
      style={{ width: 60, height: 60, display: 'inline-block', background: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-label="Fidget Spinner"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
        {grid.flatMap((row, rIdx) =>
          row.map((on, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              className="w-4 h-4 rounded-[2px]"
              style={{
                background: on ? ((active || isActive) ? FIDGET_GLOW : colorGrid[rIdx][cIdx]) : '#18181b',
                opacity: on ? 0.95 : 0.5,
                boxShadow: on && (active || isActive) ? `0 0 8px 2px ${FIDGET_GLOW}` : undefined,
                transition: 'box-shadow 0.2s, background 0.2s',
              }}
            />
          ))
        )}
      </div>
    </button>
  );
}

// Rectangular Fidget Spinner (3x4 grid, 10% larger blocks)
function RectFidgetSpinner({ type, isActive = false, onKeyboardTrigger }: { type: 'bass' | 'pad', isActive?: boolean, onKeyboardTrigger?: () => void }) {
  const [grid, setGrid] = useState<number[][] | null>(null);
  const [colorGrid, setColorGrid] = useState<string[][] | null>(null);
  const [active, setActive] = useState(false);

  // 10% larger block size
  const blockSize = 4.4; // original was 4, so 10% more
  const gridCols = 4;
  const gridRows = 3;
  const width = gridCols * blockSize * 8 + (gridCols - 1) * 4 + 16; // add some padding
  const height = gridRows * blockSize * 8 + (gridRows - 1) * 4 + 16;

  useEffect(() => {
    setGrid(Array.from({ length: gridRows }, () => Array.from({ length: gridCols }, () => (Math.random() > 0.5 ? 1 : 0))));
    setColorGrid(Array.from({ length: gridRows }, () => Array.from({ length: gridCols }, () => JENGA_COLORS[Math.floor(Math.random() * JENGA_COLORS.length)])));
  }, []);

  useEffect(() => {
    if (isActive && onKeyboardTrigger) {
      setActive(true);
      if (type === 'bass') {
        playAmbientBass();
        setTimeout(() => setActive(false), 7000);
      } else {
        playAmbientPad();
        setTimeout(() => setActive(false), 5000);
      }
    }
  }, [isActive]);

  const handleClick = () => {
    setActive(true);
    if (type === 'bass') {
      playAmbientBass();
      setTimeout(() => setActive(false), 7000);
    } else {
      playAmbientPad();
      setTimeout(() => setActive(false), 5000);
    }
  };

  // Ambient bass: long, low, soft sine or triangle, 7s
  function playAmbientBass() {
    if (typeof window === 'undefined') return;
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 65.41; // C2 (low bass)
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 7);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 7);
    o.onended = () => ctx.close();
  }
  // Ambient pad: long, rich, ethereal, 5s, multiple detuned voices, lower and softer
  function playAmbientPad() {
    if (typeof window === 'undefined') return;
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const baseFreq = 261.63; // C4, lower than before
    const detunes = [-12, -7, 0, 7, 12]; // in cents, for a lush pad
    const oscillators: OscillatorNode[] = [];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.045, ctx.currentTime); // softer pad
    g.connect(ctx.destination);
    detunes.forEach((cents, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = baseFreq;
      o.detune.value = cents;
      o.connect(g);
      o.start();
      o.stop(ctx.currentTime + 5);
      oscillators.push(o);
    });
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
    setTimeout(() => {
      oscillators.forEach(o => o.disconnect());
      g.disconnect();
      ctx.close();
    }, 5100);
  }

  if (!grid || !colorGrid) {
    return <div style={{ width, height }} />;
  }

  return (
    <button
      className={`transition-all duration-200 outline-none focus:outline-none rounded-[2px] shadow-lg p-2 ${(active || isActive) ? 'ring-4 ring-[#d0e2d6]/40 shadow-[0_0_16px_4px_#d0e2d6]' : ''}`}
      style={{ width, height, display: 'inline-block', background: 'none' }}
      onClick={handleClick}
      aria-label={type === 'bass' ? 'Ambient Bass Fidget' : 'Ambient Pad Fidget'}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gridTemplateRows: `repeat(${gridRows}, 1fr)`, gap: 4 }}>
        {grid.flatMap((row, rIdx) =>
          row.map((on, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              className="rounded-[2px]"
              style={{
                width: blockSize * 8,
                height: blockSize * 8,
                background: on ? ((active || isActive) ? FIDGET_GLOW : colorGrid[rIdx][cIdx]) : '#18181b',
                opacity: on ? 0.95 : 0.5,
                boxShadow: on && (active || isActive) ? `0 0 8px 2px ${FIDGET_GLOW}` : undefined,
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
  // Keyboard mapping: QWERT for tones, S for bass, D for pad
  const keyMap = ['q', 'w', 'e', 'r', 't', 's', 'd'];
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [rectActive, setRectActive] = useState<'bass' | 'pad' | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (keyMap.includes(key)) {
        if (['q', 'w', 'e', 'r', 't'].includes(key)) {
          const idx = keyMap.indexOf(key);
          setActiveIdx(idx);
          playToneHold(tones[idx], idx);
        } else if (key === 's') {
          setRectActive('bass');
        } else if (key === 'd') {
          setRectActive('pad');
        }
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (keyMap.includes(key)) {
        if (['q', 'w', 'e', 'r', 't'].includes(key)) {
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
      // Stop any lingering notes
      Object.keys(activeNotes).forEach(idx => stopToneHold(Number(idx)));
    };
  }, []);

  return (
    <>
      <div className="w-full flex flex-row items-center justify-center gap-6 py-10">
        {tones.map((freq, idx) => (
          <FidgetSpinner
            key={idx}
            freq={freq}
            isActive={activeIdx === idx}
            onKeyboardTrigger={() => setActiveIdx(idx)}
            idx={idx}
          />
        ))}
      </div>
      {/* New row of rectangular fidgets */}
      <div className="w-full flex flex-row items-center justify-center gap-10 pb-10">
        <RectFidgetSpinner type="bass" isActive={rectActive === 'bass'} onKeyboardTrigger={() => setRectActive('bass')} />
        <RectFidgetSpinner type="pad" isActive={rectActive === 'pad'} onKeyboardTrigger={() => setRectActive('pad')} />
      </div>
    </>
  );
}

// Harmonium sound for About section
function playHarmonium() {
  if (typeof window === 'undefined') return;
  const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  // Rich C major chord: C3, C4, E4, G4, C5
  const freqs = [130.81, 261.63, 329.63, 392.00, 523.25]; // C3, C4, E4, G4, C5
  const oscillators: OscillatorNode[] = [];
  const g = ctx.createGain();
  // Add a strong high-pass filter for airiness
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 700; // more high-pass for lighter sound
  hp.Q.value = 1.2;
  // Keep the lowpass for warmth, but after the highpass
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1200;
  lp.Q.value = 0.9;
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.connect(hp);
  hp.connect(lp);
  lp.connect(ctx.destination);
  freqs.forEach((freq, i) => {
    // Blend triangle and sine for a soft reed/oboe-like sound
    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = freq;
    o1.connect(g);
    o1.start();
    // Stop after release tail
    o1.stop(ctx.currentTime + 3.2);
    oscillators.push(o1);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq;
    o2.connect(g);
    o2.start();
    o2.stop(ctx.currentTime + 3.2);
    oscillators.push(o2);
  });
  // Soft attack and long exponential release
  const attack = 0.175; // 50% shorter than 0.35
  const sustain = 2.025; // keep sustain similar
  const release = 2.0; // 2s longer than before
  const total = attack + sustain + release;
  g.gain.linearRampToValueAtTime(0.012, ctx.currentTime + attack);
  g.gain.linearRampToValueAtTime(0.012, ctx.currentTime + attack + sustain);
  // Exponential ramp for smooth click-free release
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + attack + sustain + release - 0.2);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + total);
  setTimeout(() => {
    oscillators.forEach(o => o.disconnect());
    g.disconnect();
    hp.disconnect();
    lp.disconnect();
    ctx.close();
  }, (total + 0.05) * 1000);
}

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [openPanel, setOpenPanel] = useState<null | 'email' | 'linkedin' | 'github'>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Toggle logic for each panel
  const handleToggle = (panel: 'about' | 'email' | 'linkedin' | 'github') => {
    if (panel === 'about') {
      setShowAbout((v) => !v);
    }
    else setOpenPanel((curr) => (curr === panel ? null : panel));
  };

  // Custom onClick for HeroBlocks to play harmonium if About is not open
  const handleHeroClick = () => {
    if (!showAbout) playHarmonium();
    setShowAbout((v) => !v);
  };

  // Add keydown listener for '3' to trigger harmonium
  useEffect(() => {
    function handleHarmoniumKey(e: KeyboardEvent) {
      if (e.key === '3' && !e.repeat) {
        playHarmonium();
      }
    }
    window.addEventListener('keydown', handleHarmoniumKey);
    return () => window.removeEventListener('keydown', handleHarmoniumKey);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-[80vh] w-full relative">
        <div ref={heroRef} className="relative z-10">
          <HeroBlocks onClick={handleHeroClick} isActive={showAbout} />
        </div>
        <div className="mt-2 z-0">
          <FidgetSpinners />
        </div>
      </section>

      {/* Social/Jenga Buttons at the bottom */}
      <div className="fixed bottom-24 left-0 right-0 flex flex-row items-center justify-center gap-6 z-50">
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
        <div className="fixed left-1/2 bottom-0 z-40 animate-fade-in" style={{ transform: 'translateX(-50%) translateY(0)', minWidth: 320, maxWidth: 400 }}>
          <section className="w-full bg-[#18181b]/80 rounded-[2px] shadow-lg shadow-[#23232a]/30 border border-[#23232a] px-5 py-2 flex flex-col items-center gap-2 backdrop-blur-md" style={{ height: '60px' }}>
            {about.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-base text-gray-300 text-center font-semibold" style={{ fontSize: '0.95rem' }}>{item.profession}</span>
                <span className="text-xs text-gray-400 text-center" style={{ fontSize: '0.7rem' }}>{item.passions}</span>
              </div>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}