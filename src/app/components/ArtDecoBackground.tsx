'use client';
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

// === Easily changeable color variables ===
const BG_COLOR = '#18181b';
const PIXEL_COLORS = ['#444745', '#3a4a5a', '#4e6e7a', '#b5c8ac']; // harmonious palette
const PIXEL_SIZE = 6; // px, matches awurster box
const MAX_PIXELS = 40; // max number of dots
const MOVE_INTERVAL_MIN = 2.0; // seconds
const MOVE_INTERVAL_MAX = 4.0; // seconds
const MOVE_STEP = 1.5; // px per frame (slow)
const DOT_ALPHA = 0.22; // fixed alpha
const START_DOTS = 7;

function randomColor() {
    return PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)];
}

function randomGridPos(width: number, height: number) {
    const cols = Math.floor(width / PIXEL_SIZE);
    const rows = Math.floor(height / PIXEL_SIZE);
    return {
        x: Math.floor(Math.random() * cols) * PIXEL_SIZE,
        y: Math.floor(Math.random() * rows) * PIXEL_SIZE,
    };
}

function randomInterval() {
    return MOVE_INTERVAL_MIN + Math.random() * (MOVE_INTERVAL_MAX - MOVE_INTERVAL_MIN);
}

function randomGridNeighbor(dot: { x: number, y: number }, width: number, height: number) {
    const moves = [
        { dx: PIXEL_SIZE, dy: 0 },
        { dx: -PIXEL_SIZE, dy: 0 },
        { dx: 0, dy: PIXEL_SIZE },
        { dx: 0, dy: -PIXEL_SIZE },
    ];
    // Only allow moves that stay in bounds
    const valid = moves.filter(({ dx, dy }) => {
        const nx = dot.x + dx;
        const ny = dot.y + dy;
        return nx >= 0 && nx < width && ny >= 0 && ny < height;
    });
    if (valid.length === 0) return { x: dot.x, y: dot.y };
    const move = valid[Math.floor(Math.random() * valid.length)];
    return { x: dot.x + move.dx, y: dot.y + move.dy };
}

const ArtDecoBackground = forwardRef(function ArtDecoBackground(
    { movementLevel = 0, bpm = 120, onReady }: { movementLevel?: number, bpm?: number, onReady?: () => void },
    ref
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dots = useRef<{
        x: number;
        y: number;
        color: string;
        phase: number; // phase offset in beats
    }[]>([]);
    const dotCount = useRef(START_DOTS);
    const animationRef = useRef<number | null>(null);
    const widthRef = useRef(0);
    const heightRef = useRef(0);
    const beatRef = useRef(0);
    const lastBeatTimeRef = useRef(performance.now());

    // Expose addDot to parent
    useImperativeHandle(ref, () => ({
        addDot: () => {
            if (dotCount.current < MAX_PIXELS) {
                dotCount.current++;
            }
        },
        getDotCount: () => dotCount.current,
    }), []);

    // Generate initial dots
    function initDots(width: number, height: number, count: number) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            const pos = randomGridPos(width, height);
            arr.push({
                x: pos.x,
                y: pos.y,
                color: randomColor(),
                phase: Math.floor(Math.random() * 8), // random phase offset (0-7 beats)
            });
        }
        return arr;
    }

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        let running = true;
        let width = window.innerWidth;
        let height = window.innerHeight;
        widthRef.current = width;
        heightRef.current = height;
        // Set canvas element's width and height attributes
        if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
        }
        dots.current = initDots(width, height, dotCount.current);

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            widthRef.current = width;
            heightRef.current = height;
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
            }
            dots.current = initDots(width, height, dotCount.current);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            if (!running || !ctx) return;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, width, height);

            // Add more dots if dotCount increased
            while (dots.current.length < dotCount.current) {
                const pos = randomGridPos(width, height);
                dots.current.push({
                    x: pos.x,
                    y: pos.y,
                    color: randomColor(),
                    phase: Math.floor(Math.random() * 8),
                });
            }

            // Draw dots
            for (let dot of dots.current) {
                ctx.fillStyle = dot.color;
                ctx.globalAlpha = DOT_ALPHA;
                ctx.fillRect(dot.x, dot.y, PIXEL_SIZE, PIXEL_SIZE);
                ctx.globalAlpha = 1;
            }
        }

        draw();
        // Beat-based movement
        function animate() {
            if (!running) return;
            const now = performance.now();
            const beatInterval = 60 / bpm * 1000; // ms
            const lastBeatTime = lastBeatTimeRef.current;
            if (now - lastBeatTime >= beatInterval) {
                beatRef.current++;
                lastBeatTimeRef.current = now;
                // On each beat, move dots whose phase matches the current beat
                for (let i = 0; i < dots.current.length; i++) {
                    const dot = dots.current[i];
                    if (beatRef.current % 8 === dot.phase) { // 8-beat cycle
                        const newTarget = randomGridNeighbor(dot, widthRef.current, heightRef.current);
                        dot.x = newTarget.x;
                        dot.y = newTarget.y;
                        dot.color = randomColor();
                    }
                }
            }
            draw(); // Always draw, even if no dots moved
            animationRef.current = requestAnimationFrame(animate);
        }
        draw(); // Draw once immediately after setup
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            running = false;
            window.removeEventListener('resize', resize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [bpm]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
                transition: 'background 0.5s',
            }}
            aria-hidden="true"
        />
    );
});

export default ArtDecoBackground; 