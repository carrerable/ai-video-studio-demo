export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export interface Scene { id: string; durationInFrames: number; bg: string; title: { en: string; es: string }; zoom: number }
export interface Word { word: string; startMs: number; endMs: number }

export const SCENES: Scene[] = [
  { id: 's1', durationInFrames: 90, bg: '#0e0e10', title: { en: 'Script first', es: 'Guion primero' }, zoom: 1.08 },
  { id: 's2', durationInFrames: 90, bg: '#e8572a', title: { en: 'Plan approved', es: 'Plan aprobado' }, zoom: 1.12 },
  { id: 's3', durationInFrames: 90, bg: '#17171a', title: { en: 'Render', es: 'Render' }, zoom: 1.05 },
  { id: 's4', durationInFrames: 90, bg: '#8b6cf0', title: { en: 'Word by word', es: 'Palabra por palabra' }, zoom: 1.15 },
  { id: 's5', durationInFrames: 90, bg: '#b53d18', title: { en: 'One command', es: 'Un solo comando' }, zoom: 1.1 },
];

/** Spreads the words of a text evenly over `totalMs` (each word lasts 60% of its slot, leaving room for the music to recover). */
export function timeWords(text: string, totalMs: number): Word[] {
  const parts = text.split(/\s+/).filter(Boolean);
  const slot = totalMs / parts.length;
  return parts.map((word, i) => ({ word, startMs: Math.round(i * slot), endMs: Math.round(i * slot + slot * 0.6) }));
}

const TEXT = {
  en: 'Welcome to the studio where every video is a small program. We write the script first, approve the plan, and only then render the footage. Subtitles follow each word, music ducks under the voice, and one command rebuilds everything again.',
  es: 'Bienvenido al estudio donde cada video es un pequeño programa. Primero escribimos el guion, aprobamos el plan y solo después generamos las imágenes. Los subtítulos siguen cada palabra, la música baja bajo la voz y un solo comando reconstruye todo de nuevo.',
};
export const totalFrames = (scenes: Scene[]): number => scenes.reduce((a, s) => a + s.durationInFrames, 0);
export const wordsFor = (lang: 'en' | 'es', scenes: Scene[] = SCENES): Word[] => timeWords(TEXT[lang], (totalFrames(scenes) / FPS) * 1000);

/** Index of the word being spoken at `ms`, or -1 between words. */
export function activeWord(words: Word[], ms: number): number {
  return words.findIndex((w) => ms >= w.startMs && ms < w.endMs);
}

/** Which scene (and frame inside it) a global frame belongs to. */
export function sceneAt(scenes: Scene[], frame: number): { index: number; local: number } {
  let start = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame < start + scenes[i].durationInFrames) return { index: i, local: frame - start };
    start += scenes[i].durationInFrames;
  }
  return { index: scenes.length - 1, local: scenes[scenes.length - 1].durationInFrames };
}

/** Rough cost of showing an image to a model: width x height / 750, capped at 1,600 tokens. */
export const tokens = (w: number, h: number): number => Math.min(Math.ceil((w * h) / 750), 1600);

/** Music gain: ducked while a word is (almost) being spoken, with a short attack and release. */
export function duckGain(ms: number, words: Word[], opts = { base: 1, ducked: 0.22, attackMs: 120, releaseMs: 350 }): number {
  let g = opts.base;
  for (const w of words) {
    let k = 0;
    if (ms >= w.startMs && ms <= w.endMs) k = 1;
    else if (ms < w.startMs && ms >= w.startMs - opts.attackMs) k = 1 - (w.startMs - ms) / opts.attackMs;
    else if (ms > w.endMs && ms <= w.endMs + opts.releaseMs) k = 1 - (ms - w.endMs) / opts.releaseMs;
    g = Math.min(g, opts.base - k * (opts.base - opts.ducked));
  }
  return g;
}
