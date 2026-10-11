/**
 * Web Audio API gentle notification chime for live order status transitions.
 */
export function playStatusChime(type: 'preparing' | 'ready' | 'completed' = 'ready') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    if (type === 'preparing') {
      osc1.frequency.setValueAtTime(440, now); // A4
      osc2.frequency.setValueAtTime(554.37, now + 0.12); // C#5
    } else if (type === 'ready') {
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
    } else {
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
    }

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.25);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Non-blocking in case of audio restrictions
  }
}
