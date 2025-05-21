// Audio/music logic extracted from page.tsx

// Store active oscillators/gains for top row notes
const activeNotes: { [idx: number]: { ctx: AudioContext, o: OscillatorNode, g: GainNode, f: BiquadFilterNode, started: number } } = {};

export function getAudioContext(): AudioContext {
    if (typeof window === 'undefined') throw new Error('No window');
    if ('AudioContext' in window) {
        return new window.AudioContext();
    } else if ('webkitAudioContext' in window) {
        // @ts-expect-error webkitAudioContext is for Safari support
        return new window.webkitAudioContext();
    }
    throw new Error('No AudioContext available');
}

export function playToneHold(freq: number, idx: number) {
    if (typeof window === 'undefined') return;
    if (activeNotes[idx]) return; // already playing
    const ctx: AudioContext = getAudioContext();
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

export function stopToneHold(idx: number) {
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
    o.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
    delete activeNotes[idx];
}

export function playAmbientBass(octaveDown: boolean = false, fifth: boolean = false) {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    let freq = 65.41;
    if (octaveDown) freq /= 2;
    if (fifth) freq *= 1.5;
    o.frequency.value = freq; // C2 or C1, or 5th
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 7);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 7);
    o.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

export function playAmbientPad(octaveDown: boolean = false, third: boolean = false) {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    // 4-part harmony: C3, E3, G3, C4 (or optionally shift up/down)
    let baseFreqs = [130.81, 164.81, 196.00, 261.63];
    if (octaveDown) baseFreqs = baseFreqs.map(f => f / 2);
    if (third) baseFreqs = baseFreqs.map(f => f * 1.26);
    const oscillators: OscillatorNode[] = [];
    const g = ctx.createGain();
    // Gentle lowpass filter for warmth, not glassy
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 0.2;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.connect(lp);
    lp.connect(ctx.destination);
    const attack = 0.4;
    const sustain = 3.5;
    const release = 2.5;
    const total = attack + sustain + release;
    baseFreqs.forEach((freq) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = freq;
        o.connect(g);
        o.start();
        o.stop(ctx.currentTime + total);
        oscillators.push(o);
    });
    g.gain.linearRampToValueAtTime(0.032, ctx.currentTime + attack);
    g.gain.linearRampToValueAtTime(0.032, ctx.currentTime + attack + sustain);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + attack + sustain + release - 0.2);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + total);
    setTimeout(() => {
        oscillators.forEach(o => o.disconnect());
        g.disconnect();
        lp.disconnect();
        if (ctx.state !== 'closed') ctx.close();
    }, (total + 0.05) * 1000);
}

export function playDrumKick(randomize: boolean = false) {
    const ctx = getAudioContext();
    // Main tone
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    // Sub bass (1 octave below)
    const sub = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o1.type = 'triangle';
    o2.type = 'sine';
    sub.type = 'sine';
    // Randomize pitch and velocity
    let baseFreq = 65.41;
    let endFreq = 44;
    let gain = 0.19;
    let subFreq = baseFreq / 2;
    if (randomize) {
        baseFreq += (Math.random() - 0.5) * 6;
        endFreq += (Math.random() - 0.5) * 3;
        gain *= 0.9 + Math.random() * 0.2;
        subFreq += (Math.random() - 0.5) * 2;
    }
    o1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    o2.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    sub.frequency.setValueAtTime(subFreq, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.44);
    o2.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.44);
    sub.frequency.exponentialRampToValueAtTime(subFreq * 0.7, ctx.currentTime + 0.44);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.44);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.62);
    o1.connect(f);
    o2.connect(f);
    sub.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    o1.start();
    o2.start();
    sub.start();
    o1.stop(ctx.currentTime + 0.65);
    o2.stop(ctx.currentTime + 0.65);
    sub.stop(ctx.currentTime + 0.65);
    o1.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

export function playDrumTomLow(randomize: boolean = false) {
    const ctx = getAudioContext();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o1.type = 'triangle';
    o2.type = 'sine';
    let baseFreq = 110;
    let endFreq = 80;
    let gain = 0.13;
    if (randomize) {
        baseFreq += (Math.random() - 0.5) * 8;
        endFreq += (Math.random() - 0.5) * 4;
        gain *= 0.9 + Math.random() * 0.2;
    }
    o1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    o2.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.18);
    o2.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.18);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(1200, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o1.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    o1.start();
    o2.start();
    o1.stop(ctx.currentTime + 0.23);
    o2.stop(ctx.currentTime + 0.23);
    o1.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

export function playDrumTomHigh(randomize: boolean = false) {
    const ctx = getAudioContext();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o1.type = 'triangle';
    o2.type = 'sine';
    let baseFreq = 196;
    let endFreq = 140;
    let gain = 0.11;
    if (randomize) {
        baseFreq += (Math.random() - 0.5) * 10;
        endFreq += (Math.random() - 0.5) * 5;
        gain *= 0.9 + Math.random() * 0.2;
    }
    o1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    o2.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.13);
    o2.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.13);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(1800, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.13);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    o1.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    o1.start();
    o2.start();
    o1.stop(ctx.currentTime + 0.17);
    o2.stop(ctx.currentTime + 0.17);
    o1.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

export function playDrumSnare(randomize: boolean = false) {
    const ctx = getAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    let baseFreq = 220;
    let endFreq = 110;
    let gain = 0.18;
    if (randomize) {
        baseFreq += (Math.random() - 0.5) * 12;
        endFreq += (Math.random() - 0.5) * 6;
        gain *= 0.9 + Math.random() * 0.2;
    }
    o.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.13);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.19);
    o.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

export function playDrumHat(randomize: boolean = false) {
    const ctx = getAudioContext();
    // Even softer, more 'wooshy', reversed, less metallic
    const duration = 0.32;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Fill with white noise, then reverse for a 'reversed' feel
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    // Reverse the buffer for a reversed envelope
    data.reverse();
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const g = ctx.createGain();
    let gain = 0.055;
    if (randomize) {
        gain *= 0.9 + Math.random() * 0.2;
    }
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;
    hp.Q.value = 0.6;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3500;
    lp.Q.value = 0.5;
    noise.connect(hp);
    hp.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);
    noise.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

// Helper to generate a simple, classic Wurlitzer-style chord for C, F, or G
export function generateSimpleWurlyChord(root: 'C' | 'F' | 'G'): number[] {
    // Frequencies for C3–C5
    const C = 130.81; // C3
    const D = 146.83; // D3
    const E = 164.81; // E3
    const F = 174.61; // F3
    const G = 196.00; // G3
    const A = 220.00; // A3
    const Bb = 233.08; // Bb3
    const B = 246.94; // B3
    const Eb = 155.56; // Eb3
    // Chord sets for each root
    const chordsC = [
        [C * 2, E * 2, G * 2], // C major
        [C * 2, E * 2, G * 2, B * 2], // Cmaj7
        [C * 2, E * 2, G * 2, A * 2], // C6
        [C * 2, E * 2, G * 2, D * 2], // Cadd9
        [C * 2, E * 2, G * 2, Bb * 2], // C7
        [C * 2, Eb * 2, G * 2, Bb * 2], // Cmin7
    ];
    const chordsF = [
        [F * 2, A * 2, C * 2], // F major
        [F * 2, A * 2, C * 2, E * 2], // Fmaj7
        [F * 2, A * 2, C * 2, D * 2], // F6/9
        [F * 2, A * 2, C * 2, G * 2], // Fadd9
        [F * 2, A * 2, C * 2, Eb * 2], // F7
        [F * 2, 207.65 * 2, C * 2, Eb * 2], // Fmin7 (Ab = 207.65)
    ];
    const chordsG = [
        [G * 2, B * 2, D * 2], // G major
        [G * 2, B * 2, D * 2, F * 2], // G7
        [G * 2, B * 2, D * 2, E * 2], // G6
        [G * 2, B * 2, D * 2, A * 2], // Gadd9
        [G * 2, Bb * 2, D * 2, F * 2], // Gmin7
    ];
    let set: number[][] = chordsC;
    if (root === 'F') set = chordsF;
    if (root === 'G') set = chordsG;
    return set[Math.floor(Math.random() * set.length)];
}

// Wurlitzer-style harmonium: sine/triangle blend, single lowpass filter, soft pad envelope
export function playHarmonium(chord?: number[], gainMultiplier: number = 1.0) {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    // Use provided chord or default to C major
    const freqs = chord && chord.length ? chord : [130.81, 164.81, 196.00];
    const oscillators: OscillatorNode[] = [];
    const g = ctx.createGain();
    // Single lowpass filter for warmth
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.Q.value = 0.2;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.connect(lp);
    lp.connect(ctx.destination);
    // Sine/triangle blend for each note
    freqs.forEach((freq) => {
        // Triangle
        const o1 = ctx.createOscillator();
        o1.type = 'triangle';
        o1.frequency.value = freq;
        o1.connect(g);
        o1.start();
        o1.stop(ctx.currentTime + 2.8);
        oscillators.push(o1);
        // Sine
        const o2 = ctx.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = freq;
        o2.connect(g);
        o2.start();
        o2.stop(ctx.currentTime + 2.8);
        oscillators.push(o2);
    });
    // Soft pad envelope
    const attack = 0.18;
    const sustain = 1.4;
    const release = 1.2;
    const total = attack + sustain + release;
    const maxGain = 0.014 * gainMultiplier;
    g.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + attack);
    g.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + attack + sustain);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + attack + sustain + release - 0.2);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + total);
    setTimeout(() => {
        oscillators.forEach(o => o.disconnect());
        g.disconnect();
        lp.disconnect();
        if (ctx.state !== 'closed') ctx.close();
    }, (total + 0.05) * 1000);
}

// Helper to generate a random jazzy chord (5-8 notes) based on C scales, but more compact and lower voicing
export function generateRandomJazzChord(): number[] {
    // C major scale: C D E F G A B
    const scale = [
        65.41, // C2
        73.42, // D2
        82.41, // E2
        87.31, // F2
        98.00, // G2
        110.00, // A2
        123.47, // B2
        130.81, // C3
        146.83, // D3
        164.81, // E3
        174.61, // F3
        196.00, // G3
        220.00, // A3
        246.94, // B3
        261.63, // C4
        293.66, // D4
        329.63, // E4
        349.23, // F4
        392.00, // G4
        440.00, // A4
        493.88, // B4
        523.25, // C5
    ];
    // Chord formulas (as scale degrees)
    const chordTypes = [
        [0, 2, 4, 6, 9, 11], // Cmaj13
        [1, 3, 5, 7, 10, 12], // Dm13
        [4, 6, 8, 10, 13, 15], // G13
        [3, 5, 7, 9, 12, 14], // Fmaj9
        [0, 2, 5, 7, 9, 11, 14], // Cmaj9(13)
        [2, 4, 6, 8, 11, 13, 16], // Em11
        [1, 3, 6, 8, 10, 12, 15], // Dm11
        [0, 4, 7, 9, 12, 16], // Cmaj7(9,13)
    ];
    // Pick a random chord type
    const type = chordTypes[Math.floor(Math.random() * chordTypes.length)];
    // Pick a random root octave offset (0 or 1)
    const octave = Math.random() > 0.5 ? 0 : 7;
    // Build the chord
    let chord = type.map(i => scale[(i + octave) % scale.length]);
    // Add a few random color tones
    while (chord.length < 8 && Math.random() > 0.5) {
        const extra = scale[Math.floor(Math.random() * scale.length)];
        if (!chord.includes(extra)) chord.push(extra);
    }
    // Make voicing more compact: keep all notes within 1.5 octaves of the root
    const root = chord[0];
    chord = chord.filter(f => f >= root && f <= root * Math.pow(2, 1.5));
    // Remove any notes above C5
    chord = chord.filter(f => f <= 523.25);
    // Sort for left/right hand feel: low, mid, high
    chord.sort((a, b) => a - b);
    return chord;
}

export function playAmbientBassVariation1(octaveDown: boolean = false) {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.value = octaveDown ? 98 / 2 : 98; // G2 or G1
    f.type = 'lowpass';
    f.frequency.setValueAtTime(1800, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.2);
    g.gain.setValueAtTime(0.13, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
    o.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 2.6);
    o.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

export function playAmbientBassVariation2(octaveDown: boolean = false) {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.value = octaveDown ? 49 / 2 : 49; // A1 or A0
    o2.frequency.value = octaveDown ? 49.5 / 2 : 49.5;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(200, ctx.currentTime + 4.5);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 5.5);
    o1.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    o1.start();
    o2.start();
    o1.stop(ctx.currentTime + 5.6);
    o2.stop(ctx.currentTime + 5.6);
    o1.onended = () => { if (ctx.state !== 'closed') ctx.close(); };
}

// Helper to generate a clear, C-based alternate chord (all share C and G)
export function generateAlternateCChord(): number[] {
    // Frequencies for C3–C5
    const C = 130.81; // C3
    const D = 146.83; // D3
    const E = 164.81; // E3
    const G = 196.00; // G3
    const A = 220.00; // A3
    const Bb = 233.08; // Bb3
    const B = 246.94; // B3
    const Eb = 155.56; // Eb3
    // Chord formulas (all include C and G)
    const chords = [
        [C, E, G, B, D],        // Cmaj9
        [C, E, G, A, D],        // C6/9
        [C, E, G, Bb],          // C7
        [C, E, G, D],           // Cadd9
        [C, E, G, B],           // Cmaj7
        [C, Eb, G, Bb, D],      // Cmin9
    ];
    // Pick a random chord
    return chords[Math.floor(Math.random() * chords.length)];
}

// Helper to generate a mysterious/ambiguous chord (not tied to C major), but more compact and lower voicing
export function generateMysteriousChord(): number[] {
    // Modal roots: F#, Eb, G, Bb, D, Ab, etc.
    const roots = [
        92.50, // F#2
        77.78, // Eb2
        98.00, // G2
        116.54, // Bb2
        146.83, // D3
        103.83, // G#2/Ab2
        130.81, // C3 (sometimes allow C)
    ];
    const root = roots[Math.floor(Math.random() * roots.length)];
    // Quartal, sus, cluster, or modal intervals (in semitones)
    const formulas = [
        [0, 5, 10, 17, 24], // stacked 4ths
        [0, 7, 10, 14, 21], // sus, 5ths, 7ths
        [0, 2, 6, 11, 14, 18], // clusters
        [0, 4, 11, 14, 18], // major 3rd + tritone + 6th
        [0, 3, 7, 10, 14, 17], // minor, 7th, 9th, 11th
        [0, 6, 13, 19], // whole tone
        [0, 5, 9, 14, 19], // quartal + 6th
    ];
    const formula = formulas[Math.floor(Math.random() * formulas.length)];
    // Build chord
    let chord = formula.map(semi => root * Math.pow(2, semi / 12));
    // Optionally add a random color tone
    if (Math.random() > 0.5) {
        chord.push(root * Math.pow(2, (Math.floor(Math.random() * 24) + 1) / 12));
    }
    // Make voicing more compact: keep all notes within 1.5 octaves of the root
    chord = chord.filter(f => f >= root && f <= root * Math.pow(2, 1.5));
    // Remove any notes above C5
    chord = chord.filter(f => f <= 523.25);
    // Sort for left/right hand feel
    chord.sort((a, b) => a - b);
    return chord;
}

// Helper to generate a Tomorrow Never Knows-style chord: C and G plus unpredictable, colorful notes
export function generateTomorrowNeverKnowsChord(): number[] {
    // Frequencies for C3–C6
    const C = 130.81; // C3
    const G = 196.00; // G3
    const Fsharp = 185.00; // F#3
    const Bb = 233.08; // Bb3
    const D = 293.66; // D4
    const Eb = 311.13; // Eb4
    const A = 220.00; // A3
    const B = 246.94; // B3
    const pool = [Fsharp, Bb, D, Eb, A, B, 329.63, 392.00, 523.25]; // add E4, G4, C5 for more color
    // Always include C and G
    let chord = [C, G];
    // Add 3–5 random notes from the pool
    const numExtras = 3 + Math.floor(Math.random() * 3); // 3–5
    const extras = [];
    const used = new Set([C, G]);
    while (extras.length < numExtras) {
        const n = pool[Math.floor(Math.random() * pool.length)];
        if (!used.has(n)) {
            extras.push(n);
            used.add(n);
        }
    }
    chord = chord.concat(extras);
    // Sort and dedupe
    chord = Array.from(new Set(chord)).sort((a, b) => a - b);
    return chord;
}

// Helper to generate a TNK-style filler chord rooted on F or G
export function generateFillerHarmoniumChord(root: 'F' | 'G'): number[] {
    // Frequencies for C3–C6
    const F = 174.61; // F3
    const C = 130.81; // C3
    const G = 196.00; // G3
    const D = 293.66; // D4
    // Root and fifth
    let base: number[] = [];
    let pool: number[] = [];
    if (root === 'F') {
        base = [F, C];
        pool = [G, 220.00, 233.08, 246.94, 261.63, 293.66, 311.13, 329.63, 349.23, 392.00, 440.00, 523.25];
    } else {
        base = [G, D];
        pool = [220.00, 233.08, 246.94, 261.63, 293.66, 311.13, 329.63, 349.23, 392.00, 440.00, 523.25];
    }
    // Add 3–5 random notes from the pool
    const numExtras = 3 + Math.floor(Math.random() * 3); // 3–5
    const extras = [];
    const used = new Set(base);
    while (extras.length < numExtras) {
        const n = pool[Math.floor(Math.random() * pool.length)];
        if (!used.has(n)) {
            extras.push(n);
            used.add(n);
        }
    }
    let chord = base.concat(extras);
    chord = Array.from(new Set(chord)).sort((a, b) => a - b);
    return chord;
}

// Harmonium key usage:
//   1 = generateFillerHarmoniumChord('F')
//   2 = generateTomorrowNeverKnowsChord()
//   3 = generateTomorrowNeverKnowsChord()
//   4 = generateTomorrowNeverKnowsChord()
//   5 = generateFillerHarmoniumChord('G') 