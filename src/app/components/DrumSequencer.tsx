import { useState, useRef, useEffect, useCallback } from "react";
import { playDrumKick, playDrumSnare, playDrumHat, playDrumTomLow, playDrumTomHigh } from "../music";

const DRUM_COLORS = [
    '#1D1D20', // off
    '#6a6a6a', // bass drum (10% brighter)
    '#9d9d9d', // snare (10% brighter)
    '#9bb8c8', // low tom (10% brighter)
    '#c6e0be', // high tom (10% brighter)
    '#f0f0f0', // hat (10% brighter)
    '#1D1D20', // off (cycle, 10% brighter)
];

export function DrumSequencer() {
    const rows = 2;
    const cols = 8;
    const blockSize = 4; // 10% smaller than 4.4
    const [steps, setSteps] = useState<number[][]>(Array.from({ length: rows }, () => Array(cols).fill(0)));
    const [playing, setPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [bpm, setBpm] = useState(112); // Default BPM is now 112
    const [swingRatio, setSwingRatio] = useState(0.7); // state for swing
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const tapTimes = useRef<number[]>([]);
    const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [randomize, setRandomize] = useState(false);
    const [rollActive, setRollActive] = useState(false);
    const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [holdActive, setHoldActive] = useState(false);
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 0=off, 1=bass, 2=snare, 3=low tom, 4=high tom, 5=hat, 6=off (cycle)
    const NUM_STATES = 7;

    // --- SWING LOGIC ---
    // const SWING_RATIO = 0.7; // 70% swing
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
            return stepIdx % 2 === 0 ? baseStepMs * (1 - swingRatio * 0.5) : baseStepMs * (1 + swingRatio * 0.5);
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
    }, [playing, bpm, rows, cols, currentStep, swingRatio]);

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
        function handleKeyDown(e: KeyboardEvent) {
            if (e.repeat) return;
            if (e.key.toLowerCase() === 'p') {
                setPlaying((p) => !p);
            } else if (e.key === ',') {
                setRandomize(true);
            } else if (e.key === '.') {
                setRollActive(true);
            } else if (e.key.toLowerCase() === 'm') {
                setSteps(generateInterestingPattern(rows, cols));
            } else if (e.key === ' ') {
                // Space: tap tempo or hold
                holdTimerRef.current = setTimeout(() => {
                    setHoldActive(true);
                    setPlaying(false);
                }, 300); // 300ms threshold for hold
            }
        }
        function handleKeyUp(e: KeyboardEvent) {
            if (e.key === '.') {
                setRollActive(false);
            } else if (e.key === ' ') {
                if (holdTimerRef.current) {
                    clearTimeout(holdTimerRef.current);
                    holdTimerRef.current = null;
                }
                if (holdActive) {
                    setHoldActive(false);
                    setPlaying(true); // resume
                } else {
                    // Tap tempo logic (only if not a hold)
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
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        };
    }, [rows, cols, holdActive]);

    useEffect(() => {
        if (holdActive) {
            if (intervalRef.current) clearTimeout(intervalRef.current);
            return;
        }
        // Calculate step duration
        const baseStepMs = 60_000 / bpm;
        // For swing: even steps normal, odd steps delayed by swing
        function getStepDuration(stepIdx: number) {
            return stepIdx % 2 === 0 ? baseStepMs * (1 - swingRatio * 0.5) : baseStepMs * (1 + swingRatio * 0.5);
        }
        let stepIdx = currentStep;
        function scheduleNextStep() {
            setCurrentStep((prev) => (prev + 1) % (rows * cols));
            stepIdx = (stepIdx + 1) % (rows * cols);
            const nextDuration = getStepDuration(stepIdx);
            if (intervalRef.current) clearTimeout(intervalRef.current);
            intervalRef.current = setTimeout(scheduleNextStep, nextDuration);
        }
        if (intervalRef.current) clearTimeout(intervalRef.current);
        intervalRef.current = setTimeout(scheduleNextStep, getStepDuration(stepIdx));
        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [playing, bpm, rows, cols, currentStep, holdActive, steps, swingRatio]);

    useEffect(() => {
        // Randomize swing ratio on mount
        setSwingRatio(0.55 + Math.random() * 0.2); // 0.55–0.75
    }, []);

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
                            const isActive = playing && currentStep === stepIdx;
                            const isSet = state > 0 && state < NUM_STATES - 1;
                            return (
                                <button
                                    key={r}
                                    className={`rounded-[2px] border border-[#23232a] transition-all duration-150 focus:outline-none ${isActive ? 'ring-4 ring-[#d0e2d6]/40' : ''}`}
                                    style={{
                                        width: blockSize * 8,
                                        height: blockSize * 8,
                                        background: isActive
                                            ? DRUM_COLORS[state]
                                            : isSet
                                                ? DRUM_COLORS[state] + 'cc'
                                                : DRUM_COLORS[0],
                                        opacity: isSet ? 0.95 : 0.5,
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
    // Curated 2x8 patterns: 0=off, 1=bass, 2=snare, 3=low tom, 4=high tom, 5=hat
    const patterns = [
        // Rock/Pop (Kick on 1, 5; Snare on 3, 7; Hats every step)
        [
            [1, 5, 0, 2, 1, 5, 0, 2],
            [5, 0, 5, 0, 5, 0, 5, 0],
        ],
        // Funk (Kick on 1, 4, 7; Snare on 3, 7; Hats every step)
        [
            [1, 5, 0, 2, 1, 5, 0, 2],
            [5, 0, 5, 0, 5, 1, 5, 0],
        ],
        // Disco (Kick on every beat, Snare on 3, 7, Hats every step)
        [
            [1, 5, 1, 2, 1, 5, 1, 2],
            [5, 0, 5, 0, 5, 0, 5, 0],
        ],
        // Hip-Hop (Sparse hats, syncopated kick/snare)
        [
            [1, 0, 0, 2, 0, 1, 0, 2],
            [0, 5, 0, 0, 5, 0, 5, 0],
        ],
        // Reggaeton/Dembow
        [
            [1, 0, 2, 0, 1, 0, 2, 0],
            [5, 0, 5, 0, 5, 0, 5, 0],
        ],
        // Four-on-the-floor (Kick every step, snare on 3, 7, hats every step)
        [
            [1, 5, 1, 2, 1, 5, 1, 2],
            [5, 0, 5, 0, 5, 0, 5, 0],
        ],
        // Tom groove (Toms on 3, 4, 7, 8)
        [
            [1, 3, 3, 4, 1, 3, 3, 4],
            [5, 0, 5, 0, 5, 0, 5, 0],
        ],
        // Syncopated (Kick/snare interplay, hats on offbeats)
        [
            [1, 0, 2, 5, 1, 0, 2, 5],
            [5, 1, 5, 0, 5, 1, 5, 0],
        ],
    ];
    // Pick a random pattern
    const base = patterns[Math.floor(Math.random() * patterns.length)].map(row => [...row]);
    // Optionally, add a little randomization: 10% chance to add a hat or tom to a random cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.10 && base[r][c] === 0) {
                base[r][c] = Math.random() < 0.5 ? 5 : (Math.random() < 0.5 ? 3 : 4);
            }
        }
    }
    return base;
} 