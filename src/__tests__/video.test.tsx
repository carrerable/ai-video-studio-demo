import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SCENES, activeWord, duckGain, sceneAt, timeWords, tokens, totalFrames, wordsFor } from '../lib/video';

// The Player needs a browser layout engine; the logic under test does not.
vi.mock('@remotion/player', () => ({ Player: () => null }));
import { Demo } from '../Demo';

test('tokens(1920,1080) === 1600 (tope)', () => {
  expect(tokens(1920, 1080)).toBe(1600);
});

test('tokens(640,360) === 308', () => {
  expect(tokens(640, 360)).toBe(308);
});

test('activeWord encuentra la palabra por milisegundos', () => {
  const words = timeWords('uno dos tres', 3000);
  expect(activeWord(words, 0)).toBe(0);
  expect(activeWord(words, 1100)).toBe(1);
  expect(activeWord(words, 2999)).toBe(-1); // hueco al final del ultimo slot
  expect(activeWord(words, 2500)).toBe(2);
  expect(wordsFor('en').length).toBeGreaterThanOrEqual(40);
});

test('duracion total de las 5 escenas', () => {
  expect(SCENES).toHaveLength(5);
  expect(totalFrames(SCENES)).toBe(450);
  expect(sceneAt(SCENES, 0)).toEqual({ index: 0, local: 0 });
  expect(sceneAt(SCENES, 450 - 1).index).toBe(4);
  expect(sceneAt(SCENES, 91)).toEqual({ index: 1, local: 1 });
});

test('la musica baja bajo la voz y se recupera', () => {
  const words = timeWords('hola mundo', 2000);
  expect(duckGain(100, words)).toBeCloseTo(0.22);
  expect(duckGain(1990, words)).toBeGreaterThan(0.22); // still recovering
  expect(duckGain(2500, words)).toBe(1); // recovered
});

test('la interfaz calcula tokens y total', () => {
  render(<Demo lang="en" />);
  expect(screen.getByTestId('total')).toHaveTextContent('450 frames');
  expect(screen.getByTestId('tok-before')).toHaveTextContent('1600');
  expect(screen.getByTestId('tok-after')).toHaveTextContent('1106'); // 1080 x 768 / 750
});
