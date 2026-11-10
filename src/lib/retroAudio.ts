// Web Audio API 기반 레트로 8비트 사운드 엔진
let actx: AudioContext | null = null;

export function unlockAudio() {
  if (!actx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AC) actx = new AC();
  }
  if (actx && actx.state === 'suspended') {
    actx.resume();
  }
}

export function beep(freq: number, dur = 0.1, type: OscillatorType = 'square', vol = 0.05, delay = 0) {
  try {
    unlockAudio();
    if (!actx) return;
    const t0 = actx.currentTime + delay;
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(actx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  } catch {}
}

export const SFX = {
  mv: () => beep(660, 0.04, 'square', 0.025),
  sel: () => beep(990, 0.06, 'triangle', 0.05),
  ok: () => {
    beep(784, 0.08, 'square', 0.04);
    beep(988, 0.08, 'square', 0.04, 0.08);
    beep(1319, 0.2, 'square', 0.04, 0.16);
  },
  no: () => {
    beep(220, 0.14, 'sawtooth', 0.05);
    beep(160, 0.22, 'sawtooth', 0.05, 0.12);
  },
  hit: () => {
    beep(140, 0.12, 'square', 0.07);
    beep(90, 0.15, 'triangle', 0.08, 0.05);
  },
  crit: () => {
    beep(1400, 0.05, 'triangle', 0.06);
    beep(140, 0.2, 'square', 0.08, 0.05);
  },
  bump: () => beep(80, 0.07, 'square', 0.05),
  lvl: () => {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, 'square', 0.04, i * 0.1));
  },
  ball: () => beep(520, 0.08, 'triangle', 0.07),
  catch: () => {
    [784, 988, 1175, 1568].forEach((f, i) => beep(f, 0.14, 'square', 0.04, i * 0.12));
  },
  heal: () => {
    [523, 784, 659, 1047].forEach((f, i) => beep(f, 0.16, 'triangle', 0.07, i * 0.14));
  },
  enc: () => {
    [880, 660, 880, 660, 1100].forEach((f, i) => beep(f, 0.07, 'square', 0.04, i * 0.07));
  },
  badge: () => {
    [659, 784, 988, 1319, 988, 1319].forEach((f, i) => beep(f, 0.15, 'square', 0.045, i * 0.13));
  },
};