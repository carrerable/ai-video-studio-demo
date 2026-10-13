# AI video studio — editing as code

> Public mini-demo with fictional data. The full product is private; access on request: carrerabernal@gmail.com

## Live demo

https://carrerable.github.io/ai-video-studio-demo/

## What it demonstrates

- A 1080x1920, 30 fps vertical clip described as data (5 scenes with title, zoom and duration) and rendered live with the Remotion Player.
- Word-by-word subtitles driven by a fictional transcript with per-word timestamps.
- A music "ducking" envelope: the gain drops under each spoken word and recovers after it.
- An image-token calculator (width x height / 750, capped at 1,600) and the measured effect of cropping a contact sheet to its useful area (2,400 to 1,540 tokens).

## What is fictional and what is real

The scenes, the transcript and the numbers typed into the calculator are fictional, and there is no audio and no rendering to a file. The workflow and the token figures come from a real, private project. The code is written from scratch.

## License note about Remotion

This demo uses [Remotion](https://www.remotion.dev/) (`remotion` and `@remotion/player`, version 4). Remotion is source-available and free only for individuals, non-profits and small companies; companies above its size threshold need a paid license. Check the current terms at https://www.remotion.dev/license before reusing this code commercially. The license of this repository (MIT) covers only my own code, not Remotion.

## Run locally

```bash
npm ci && npm run dev
```

Add `?lang=es` for Spanish.

## Tests

```bash
npm test
```

## How it was built

Code written with Claude Code under my specs and code review; I designed the behavior, wrote the acceptance tests and verified the result.

## Case study

https://carrerable.github.io/en/projects/ai-video-production/

## License

MIT (own code). See the Remotion note above.
