import { useState, useEffect } from "react";
import { playAmbientBass, playAmbientPad } from "../music";

const JENGA_COLORS = ["#23232a", "#35353f", "#18181b", "#2a2a33"];
const FIDGET_GLOW = '#d0e2d6';

export function RectFidgetSpinner({ type, isActive = false, onKeyboardTrigger, mobile = false }: { type: 'bass' | 'pad', isActive?: boolean, onKeyboardTrigger?: () => void, mobile?: boolean }) {
    const [grid, setGrid] = useState<number[][] | null>(null);
    const [colorGrid, setColorGrid] = useState<string[][] | null>(null);
    const [active, setActive] = useState(false);

    const blockSize = mobile ? 3.2 : 4.4;
    const gridCols = 4;
    const gridRows = 3;
    const width = gridCols * blockSize * 8 + (gridCols - 1) * (mobile ? 2 : 4) + (mobile ? 8 : 16);
    const height = gridRows * blockSize * 8 + (gridRows - 1) * (mobile ? 2 : 4) + (mobile ? 8 : 16);

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
    }, [isActive, onKeyboardTrigger, type]);

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

    if (!grid || !colorGrid) {
        return <div style={{ width, height }} />;
    }

    return (
        <button
            className={`transition-all duration-200 outline-none focus:outline-none rounded-[2px] shadow-lg ${mobile ? 'p-0' : 'p-2'} ${(active || isActive) ? 'ring-4 ring-[#d0e2d6]/40 shadow-[0_0_16px_4px_#d0e2d6]' : ''}`}
            style={{ width, height, display: 'inline-block', background: 'none' }}
            onClick={handleClick}
            aria-label={type === 'bass' ? 'Ambient Bass Fidget' : 'Ambient Pad Fidget'}
        >
            <div className="grid" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gridTemplateRows: `repeat(${gridRows}, 1fr)`, gap: mobile ? 2 : 4 }}>
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