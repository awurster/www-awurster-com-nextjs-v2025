'use client';
import React, { useRef, useEffect } from 'react';

// === Easily changeable color variables ===
const BG_COLOR = '#18181b';
const PIXEL_COLOR = '#444745'; // awurster box background pixel color
const PIXEL_SIZE = 6; // px, matches awurster box
const NUM_PIXELS = 40; // number of floating "raindrop" pixels
const ACTIVE_PIXELS = 7; // number of pixels moving at once

// === Subtle Floating Raindrop Pixel Background Canvas ===
export default function ArtDecoBackground({ movementLevel = 0, bpm = 120, onReady }: { movementLevel?: number, bpm?: number, onReady?: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const movement = useRef(movementLevel);
    const animationRef = useRef<number | null>(null);
    const pixelPositions = useRef<{ x: number, y: number, phase: number }[]>([]);

    // Allow parent to bump movement (if needed, you can expose a ref or context for this)
    useEffect(() => {
        if (onReady) {
            onReady();
        }
    }, [onReady]);

    // Generate random pixel positions
    function generatePixelPositions(width: number, height: number) {
        const arr = [];
        for (let i = 0; i < NUM_PIXELS; i++) {
            arr.push({
                x: Math.random() * width,
                y: Math.random() * height,
                phase: Math.random() * Math.PI * 2,
            });
        }
        return arr;
    }

    useEffect(() => {
        let running = true;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let t = 0;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
            }
            pixelPositions.current = generatePixelPositions(width, height);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            if (!running || !ctx) return;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, width, height);

            // Movement intensity
            movement.current = Math.max(movement.current * 0.985, 0.1); // decay
            const intensity = Math.min(movement.current, 10);
            t += 0.008 + 0.012 * intensity;

            // Beat phase for tempo sync
            const beatPhase = (t * bpm) / 60;
            // Which pixels are active? Cycle through them in time with the beat
            const activeStart = Math.floor(beatPhase) % NUM_PIXELS;
            const activeIndices = [];
            for (let i = 0; i < ACTIVE_PIXELS; i++) {
                activeIndices.push((activeStart + i * 3) % NUM_PIXELS);
            }

            // Draw sparse floating pixels
            for (let i = 0; i < pixelPositions.current.length; i++) {
                const { x, y, phase } = pixelPositions.current[i];
                // Is this pixel active?
                const isActive = activeIndices.includes(i);
                // Gentle float
                const floatRadius = isActive ? (2.2 + 1.2 * Math.sin(phase)) : 0.3;
                const floatSpeed = 0.18 + 0.07 * Math.cos(phase);
                const angle = t * floatSpeed + phase;
                const ox = Math.cos(angle) * floatRadius * intensity * 0.22;
                const oy = Math.sin(angle) * floatRadius * intensity * 0.22;
                ctx.fillStyle = PIXEL_COLOR;
                ctx.globalAlpha = isActive ? (0.28 + 0.09 * Math.abs(Math.sin(phase + t * 0.5))) : 0.13;
                ctx.fillRect(x + ox, y + oy, PIXEL_SIZE, PIXEL_SIZE);
                ctx.globalAlpha = 1;
            }
            animationRef.current = requestAnimationFrame(draw);
        }
        draw();
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
} 