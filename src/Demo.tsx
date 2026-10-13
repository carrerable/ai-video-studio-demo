import { useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import type { Lang } from './i18n';
import { Shell } from './ui/Shell';
import { Frame } from './ui/Frame';
import { Clip } from './video/Clip';
import { FPS, HEIGHT, SCENES, WIDTH, duckGain, tokens, totalFrames, wordsFor, type Scene } from './lib/video';

const T = {
  en: {
    eyebrow: 'Case study / editing as code', title: 'AI video studio: editing as code',
    lead: 'A vertical video is a set of data: scenes, zooms, titles and a transcript. Change the data and the same clip renders again.',
    scenes: 'Scene editor', titleL: 'Title', secs: 'Seconds', zoom: 'Zoom', total: 'Total', duck: 'Music ducking envelope', duckNote: 'Music drops under each spoken word and recovers after it.',
    tok: 'Image token calculator', w: 'Width (px)', h: 'Height (px)', crop: 'Keep % of the frame', before: 'Full frame', after: 'After cropping', sheet: 'Measured on a real contact sheet: 2,400 tokens before cropping, 1,540 after (about 35% less).', cap: 'Cost is width x height / 750, capped at 1,600 tokens.',
  },
  es: {
    eyebrow: 'Caso de estudio / edición como código', title: 'Estudio de video con IA: edición como código',
    lead: 'Un video vertical es un conjunto de datos: escenas, zooms, títulos y una transcripción. Cambia los datos y el mismo clip se vuelve a renderizar.',
    scenes: 'Editor de escenas', titleL: 'Título', secs: 'Segundos', zoom: 'Zoom', total: 'Total', duck: 'Envolvente de ducking de música', duckNote: 'La música baja bajo cada palabra hablada y se recupera después.',
    tok: 'Calculadora de tokens de imagen', w: 'Ancho (px)', h: 'Alto (px)', crop: 'Conservar % del cuadro', before: 'Cuadro completo', after: 'Tras recortar', sheet: 'Medido en una hoja de contactos real: 2,400 tokens sin recortar, 1,540 recortada (cerca de 35% menos).', cap: 'El costo es ancho x alto / 750, con tope de 1,600 tokens.',
  },
};

export function Demo({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [scenes, setScenes] = useState<Scene[]>(SCENES);
  const [dim, setDim] = useState({ w: 1080, h: 1920, keep: 40 });
  const words = useMemo(() => wordsFor(lang, scenes), [lang, scenes]);
  const frames = totalFrames(scenes);
  const update = (i: number, patch: Partial<Scene>) => setScenes(scenes.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const total = (frames / FPS) * 1000;
  const pts = Array.from({ length: 121 }, (_, i) => { const ms = (i / 120) * total; return `${(i / 120) * 600},${60 - duckGain(ms, words) * 50}`; }).join(' ');
  const cropped = Math.max(1, Math.round(dim.h * (dim.keep / 100)));

  return (
    <Shell lang={lang} eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <Frame tl={`${WIDTH}x${HEIGHT} / ${FPS} fps`} tr={`${frames} frames`}>
        <div className="row" style={{ alignItems: 'flex-start', gap: 'var(--s-6)' }}>
          <div style={{ width: 270, maxWidth: '100%' }}>
            <Player component={Clip} inputProps={{ scenes, words, lang }} durationInFrames={frames} fps={FPS} compositionWidth={WIDTH} compositionHeight={HEIGHT} style={{ width: 270 }} controls loop />
          </div>
          <div style={{ flex: '1 1 18rem', minWidth: 0 }}>
            <h2>{t.scenes}</h2>
            {scenes.map((s, i) => (
              <div key={s.id} className="row" style={{ marginBottom: 'var(--s-2)' }}>
                <label>{t.titleL} {i + 1}<input value={s.title[lang]} onChange={(e) => update(i, { title: { ...s.title, [lang]: e.target.value } })} style={{ width: '11rem' }} /></label>
                <label>{t.secs}<input type="number" min={1} max={10} step={0.5} value={s.durationInFrames / FPS} onChange={(e) => update(i, { durationInFrames: Math.max(FPS, Math.round(Number(e.target.value) * FPS)) })} style={{ width: '5rem' }} /></label>
                <label>{t.zoom}<input type="number" min={1} max={1.5} step={0.01} value={s.zoom} onChange={(e) => update(i, { zoom: Number(e.target.value) })} style={{ width: '5rem' }} /></label>
              </div>
            ))}
            <p className="mono" data-testid="total">{t.total}: {frames} frames / {(frames / FPS).toFixed(1)} s</p>
          </div>
        </div>
      </Frame>

      <Frame tl="AUDIO">
        <h2>{t.duck}</h2>
        <svg viewBox="0 0 600 70" role="img" aria-label={t.duck} style={{ width: '100%' }}>
          <polyline points={pts} fill="none" stroke="var(--c-coral)" strokeWidth="2" />
          <line x1="0" y1="60" x2="600" y2="60" stroke="var(--line)" />
        </svg>
        <p className="note">{t.duckNote}</p>
      </Frame>

      <Frame tl="TOKENS">
        <h2>{t.tok}</h2>
        <div className="row">
          <label>{t.w}<input type="number" min={1} value={dim.w} onChange={(e) => setDim({ ...dim, w: Number(e.target.value) })} style={{ width: '7rem' }} /></label>
          <label>{t.h}<input type="number" min={1} value={dim.h} onChange={(e) => setDim({ ...dim, h: Number(e.target.value) })} style={{ width: '7rem' }} /></label>
          <label>{t.crop}<input type="number" min={10} max={100} value={dim.keep} onChange={(e) => setDim({ ...dim, keep: Number(e.target.value) })} style={{ width: '6rem' }} /></label>
        </div>
        <div className="grid" style={{ marginTop: 'var(--s-3)' }}>
          <div className="card"><div className="num" data-testid="tok-before">{tokens(dim.w, dim.h)}</div><div className="label">{t.before}</div></div>
          <div className="card"><div className="num" data-testid="tok-after">{tokens(dim.w, cropped)}</div><div className="label">{t.after}</div></div>
        </div>
        <p className="note" style={{ marginTop: 'var(--s-3)' }}>{t.cap} {t.sheet}</p>
      </Frame>
    </Shell>
  );
}
