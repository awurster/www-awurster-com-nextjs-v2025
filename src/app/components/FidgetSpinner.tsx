import { useRef, useState, useEffect } from "react";
import { playToneHold, stopToneHold } from "../music";

const FIDGET_GLOW = '#d0e2d6';
const JENGA_COLORS = ["#23232a", "#35353f", "#18181b", "#2a2a33"];

function generateRuneGrid(size = 3) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => (Math.random() > 0.5 ? 1 : 0))
    );
}
function generateColorGrid(size = 3) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => JENGA_COLORS[Math.floor(Math.random() * JENGA_COLORS.length)])
    );
}

export function FidgetSpinner({ freq, isActive = false, onKeyboardTrigger, idx, mobile = false }: { freq: number, isActive?: boolean, onKeyboardTrigger?: () => void, idx?: number, mobile?: boolean }) {
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
        } else if (!isActive && typeof idx === 'number') {
            setActive(false);
        }
    }, [isActive, idx, onKeyboardTrigger]);

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
        return <div style={{ width: mobile ? 44 : 60, height: mobile ? 44 : 60 }} />;
    }

    return (
        <button
            className={`transition-all duration-200 outline-none focus:outline-none rounded-[2px] shadow-lg ${mobile ? 'p-0' : 'p-1'} ${(active || isActive) ? 'ring-4 ring-[#d0e2d6]/40 shadow-[0_0_16px_4px_#d0e2d6]' : ''}`}
            style={{ width: mobile ? 44 : 60, height: mobile ? 44 : 60, display: 'inline-block', background: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            aria-label="Fidget Spinner"
        >
            <div className="grid grid-cols-3 grid-rows-3" style={{ gap: mobile ? 1 : 2 }}>
                {grid.flatMap((row, rIdx) =>
                    row.map((on, cIdx) => (
                        <div
                            key={rIdx + '-' + cIdx}
                            className="rounded-[2px]"
                            style={{
                                width: mobile ? 12 : 16,
                                height: mobile ? 12 : 16,
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