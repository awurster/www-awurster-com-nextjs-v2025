import { useState, useRef, useEffect, useCallback } from "react";
import { playDrumKick, playDrumSnare, playDrumHat, playDrumTomLow, playDrumTomHigh } from "../music";

const DRUM_COLORS = [
    '#18181b', // off
    '#23232a', // bass drum (dark grey)
    '#88898c', // snare (medium grey)
    '#8ba5b4', // low tom (olive/earthy)
    '#b5c8ac', // high tom (soft purple)
    '#e6e6e6', // hat (very light grey)
    '#23232a', // off (cycle)
];

export function DrumSequencer() {
    const rows = 2;
    const cols = 8;
    const blockSize = 4; // 10% smaller than 4.4
    const [steps, setSteps] = useState<number[][]>(Array.from({ length: rows }, () => Array(cols).fill(0)));
    const [playing, setPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [bpm, setBpm] = useState(112); // Default BPM is now 112
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const tapTimes = useRef<number[]>([]);
    const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [randomize, setRandomize] = useState(false);
    const [rollActive, setRollActive] = useState(false);
    const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 0=off, 1=bass, 2=snare, 3=low tom, 4=high tom, 5=hat, 6=off (cycle)
    const NUM_STATES = 7;

    // --- SWING LOGIC ---
    const SWING_RATIO = 0.7; // 70% swing
    // ---

    const playDrum = useCallback((row: number, type: number, randomize: boolean = false) => {
        if (type === 1) playDrumKick(randomize);
        else if (type === 2) playDrumSnare(randomize);
        else if (type === 3) playDrumTomLow(randomize);
        else if (type === 4) playDrumTomHigh(randomize);
        else if (type === 5) playDrumHat(randomize);
    }, []);

    useEffect(() => {
        if (!playing) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        // Calculate step duration
        const baseStepMs = 60_000 / bpm;
        // For swing: even steps normal, odd steps delayed by swing
        function getStepDuration(stepIdx: number) {
            return stepIdx % 2 === 0 ? baseStepMs * (1 - SWING_RATIO * 0.5) : baseStepMs * (1 + SWING_RATIO * 0.5);
        }
        let stepIdx = currentStep;
        function scheduleNextStep() {
            setCurrentStep((prev) => (prev + 1) % (rows * cols));
            stepIdx = (stepIdx + 1) % (rows * cols);
            const nextDuration = getStepDuration(stepIdx);
            intervalRef.current = setTimeout(scheduleNextStep, nextDuration);
        }
        intervalRef.current = setTimeout(scheduleNextStep, getStepDuration(stepIdx));
        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [playing, bpm, rows, cols, currentStep]);

    // Drum roll/glitch repeat logic (quarter-step repeat, in time)
    useEffect(() => {
        if (!rollActive) {
            if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
            return;
        }
        // Quarter-step duration (16th note): step duration / 4
        const baseStepMs = 60_000 / bpm;
        const rollInterval = baseStepMs / 4;
        rollIntervalRef.current = setInterval(() => {
            const r = Math.floor(currentStep / cols);
            const c = currentStep % cols;
            const type = steps[r][c];
            if (type > 0 && type < NUM_STATES - 1) playDrum(r, type, randomize);
        }, rollInterval);
        return () => {
            if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        };
    }, [rollActive, currentStep, steps, cols, playDrum, randomize, bpm]);

    useEffect(() => {
        if (!playing) return;
        const r = Math.floor(currentStep / cols);
        const c = currentStep % cols;
        const type = steps[r][c];
        if (type > 0 && type < NUM_STATES - 1) playDrum(r, type, randomize);
        if (randomize) setRandomize(false); // momentary
    }, [currentStep, playing, steps, cols, playDrum, randomize]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key.toLowerCase() === 'p') {
                setPlaying((p) => !p);
            } else if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                if (tapTimeout.current) clearTimeout(tapTimeout.current);
                tapTimes.current.push(now);
                if (tapTimes.current.length > 1) {
                    const times = tapTimes.current.slice(-6);
                    const intervals = times.slice(1).map((t, i) => t - times[i]);
                    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                    if (intervals.length >= 1 && avg > 0) {
                        const newBpm = Math.round(60_000 / avg);
                        setBpm(Math.max(40, Math.min(300, newBpm)));
                    }
                }
                tapTimeout.current = setTimeout(() => {
                    tapTimes.current = [];
                }, 2000);
            } else if (e.key === ',' || e.key === '.') {
                setRandomize(true);
            } else if (e.key.toLowerCase() === 'm') {
                // Generate an interesting pattern
                setSteps(generateInterestingPattern(rows, cols));
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [rows, cols, NUM_STATES]);

    function cycleStep(r: number, c: number) {
        setSteps((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = (next[r][c] + 1) % NUM_STATES;
            return next;
        });
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-2 pb-10">
            <div className="flex flex-row items-center justify-center gap-2">
                {Array.from({ length: cols }).map((_, c) => (
                    <div key={c} className="flex flex-col gap-2">
                        {Array.from({ length: rows }).map((_, r) => {
                            const stepIdx = r * cols + c;
                            const state = steps[r][c];
                            const isActive = playing && currentStep === stepIdx && state > 0 && state < NUM_STATES - 1;
                            const isSet = state > 0 && state < NUM_STATES - 1;
                            return (
                                <button
                                    key={r}
                                    className={`rounded-[2px] border border-[#23232a] transition-all duration-150 focus:outline-none ${isActive ? 'ring-4 ring-[#d0e2d6]/60 shadow-[0_0_12px_2px_#d0e2d6]' : ''}`}
                                    style={{
                                        width: blockSize * 8,
                                        height: blockSize * 8,
                                        background: isActive
                                            ? DRUM_COLORS[state]
                                            : isSet
                                                ? DRUM_COLORS[state] + 'cc'
                                                : DRUM_COLORS[0],
                                        opacity: isSet ? 0.95 : 0.5,
                                        boxShadow: isActive ? `0 0 8px 2px ${DRUM_COLORS[state]}` : undefined,
                                    }}
                                    onClick={() => cycleStep(r, c)}
                                    tabIndex={0}
                                    aria-label={`Drum step ${c + 1}, row ${r + 1}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper to generate an interesting pattern
function generateInterestingPattern(rows: number, cols: number) {
    // Example: polyrhythmic/symmetric pattern
    // - Bass drum on every 4th step
    // - Snare on every 6th step
    // - Toms on alternating steps
    // - Hats on every 3rd step
    const pattern = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (idx % 4 === 0) pattern[r][c] = 1; // bass
            else if (idx % 6 === 2) pattern[r][c] = 2; // snare
            else if (idx % 8 === 3) pattern[r][c] = 3; // low tom
            else if (idx % 8 === 7) pattern[r][c] = 4; // high tom
            else if (idx % 3 === 1) pattern[r][c] = 5; // hat
            else pattern[r][c] = 0;
        }
    }
    return pattern;
} 