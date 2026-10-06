// Generates tiny synthesized sound effects as WAV files.
const fs = require('fs');
const path = require('path');
const RATE = 22050;
const out = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(out, { recursive: true });

function wav(name, notes) {
  // notes: [{f, d, v?}] sequential sine tones with fade envelope
  const samples = [];
  for (const n of notes) {
    const len = Math.floor(RATE * n.d);
    for (let i = 0; i < len; i++) {
      const t = i / RATE;
      const env = Math.min(1, i / (RATE * 0.005)) * Math.pow(1 - i / len, 1.5);
      const f = n.slide ? n.f + (n.slide - n.f) * (i / len) : n.f;
      samples.push(Math.sin(2 * Math.PI * f * t) * env * (n.v ?? 0.5));
    }
  }
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(out, name + '.wav'), Buffer.concat([h, data]));
}

wav('pick', [{ f: 700, slide: 1000, d: 0.09 }]);
wav('drop', [{ f: 520, d: 0.07 }, { f: 780, d: 0.11 }]);
wav('error', [{ f: 220, slide: 150, d: 0.18, v: 0.45 }]);
wav('complete', [{ f: 660, d: 0.09 }, { f: 880, d: 0.09 }, { f: 1100, d: 0.16 }]);
wav('win', [{ f: 523, d: 0.12 }, { f: 659, d: 0.12 }, { f: 784, d: 0.12 }, { f: 1047, d: 0.3 }]);
console.log('done');
