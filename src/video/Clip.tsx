import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FPS, activeWord, sceneAt, type Scene, type Word } from '../lib/video';

export interface ClipProps { scenes: Scene[]; words: Word[]; lang: 'en' | 'es' }

/** A 1080x1920 clip described as data: scenes with a zoom, a title and word-by-word subtitles. */
export function Clip({ scenes, words, lang }: ClipProps) {
  const frame = useCurrentFrame();
  const { index, local } = sceneAt(scenes, frame);
  const scene = scenes[index];
  const scale = interpolate(local, [0, scene.durationInFrames], [1, scene.zoom], { extrapolateRight: 'clamp' });
  const ms = (frame / FPS) * 1000;
  const active = activeWord(words, ms);
  const from = Math.max(0, (active === -1 ? words.findIndex((w) => w.startMs > ms) - 1 : active) - 3);
  const shown = words.slice(from, from + 7);
  const light = scene.bg === '#e8572a' || scene.bg === '#8b6cf0';
  return (
    <AbsoluteFill style={{ background: scene.bg, color: light ? '#0e0e10' : '#f4efe6', fontFamily: 'Archivo, Arial, sans-serif', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{ fontSize: 150, fontWeight: 800, textTransform: 'uppercase', lineHeight: 0.92, letterSpacing: -4, textAlign: 'center' }}>{scene.title[lang]}</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 280, textAlign: 'center', fontSize: 64, fontWeight: 800, lineHeight: 1.25 }}>
        {shown.map((w, i) => (
          <span key={from + i} style={{ margin: '0 10px', opacity: from + i === active ? 1 : 0.55, textDecoration: from + i === active ? 'underline' : 'none' }}>{w.word}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 70, left: 70, fontFamily: 'IBM Plex Mono, monospace', fontSize: 34, opacity: 0.8 }}>REC {String(Math.floor(frame / FPS)).padStart(2, '0')}s / scene {index + 1}</div>
    </AbsoluteFill>
  );
}
