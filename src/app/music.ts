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
    o.onended = () => ctx.close();
    delete activeNotes[idx];
}

export function playAmbientBass() {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
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

export function playAmbientPad() {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    const baseFreq = 261.63; // C4, lower than before
    const detunes = [-12, -7, 0, 7, 12]; // in cents, for a lush pad
    const oscillators: OscillatorNode[] = [];
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.045, ctx.currentTime); // softer pad
    g.connect(ctx.destination);
    detunes.forEach((cents) => {
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
    o1.onended = () => ctx.close();
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
    o1.onended = () => ctx.close();
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
    o1.onended = () => ctx.close();
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
    o.onended = () => ctx.close();
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
    noise.onended = () => ctx.close();
}

export function playHarmonium() {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
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
    freqs.forEach((freq) => {
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