---
name: video-publishing
description: Select, produce, publish, and verify short videos, including paired Traditional Chinese and English variants with shared language-neutral visuals.
---

# Video Publishing Factory

Use this skill for the complete short-video workflow: choose a topic, prepare a concise brief, produce one or more language tracks, publish to the explicitly selected account, verify the result, and clean only traceable intermediates.

## Operating rules

- Confirm the destination machine, platform, language mode, and visibility before upload.
- Never infer an account from a display name alone. Verify the visible account name, handle, or canonical URL.
- Treat Chinese and English requests as two separate videos unless the user explicitly asks for a mixed-language experiment.
- Target 30–50 seconds per video; prefer 35–45 seconds.
- Use distinct footage. Do not use looping, reversing, speed changes, or re-encoding as a substitute for a new scene.
- Do not publish unsupported medical, legal, financial, safety, or public-policy claims.
- Do not expose passwords, OTPs, cookies, API tokens, or private files.

## Account routing

For this personal five-machine system:

| Machine | Destination | Account verification |
|---|---|---|
| 1 | YouTube | Studio visibly shows `量產型機器露露一號機` |
| 2 | Instagram | Profile visibly shows `@ruru___53` / `RURU_53` |
| 3 | Facebook | Page/profile visibly shows `量產型露露三號機` |
| 4 | YouTube | Public page visibly shows `@robotruru_04` / `量產型機器露露四號機` |
| 5 | Threads | Canonical URL and handle must be verified before use |

Stop on an account mismatch. Do not upload to a substitute account because it is already open.

## 1. Create the production brief

Record:

```text
machine / platform:
working title:
one-sentence promise:
first-two-second hook:
central claim or story question:
three-to-seven distinct visual beats:
script and source notes:
language and voice:
call to action:
title, caption, hashtags:
synthetic-media disclosure:
audience setting:
publish visibility:
```

Score candidate topics on platform fit, hook and novelty, visual potential, evidence, audience value, and production effort. Prefer a score of 70/100 or higher. Research current signals when freshness matters; for high-stakes topics, use current authoritative sources.

## 2. Produce paired language variants

Model a bilingual run as one shared visual project with two independent tracks:

```text
shared research + text-free visual storyboard
├── zh-TW script -> zh-TW audio -> zh-TW subtitles -> zh-TW final MP4
└── en script   -> en audio   -> en subtitles   -> en final MP4
```

1. Write both scripts side by side. Preserve the claim and factual meaning, but adapt hooks, idioms, pacing, CTA, titles, and captions naturally; do not translate line by line blindly.
2. Generate and measure both audio files independently.
3. Reuse one storyboard only when its visuals contain no embedded language, lip-sync, or language-specific on-screen text. Otherwise generate language-specific visuals.
4. Make 3–7 distinct visual beats. Record a unique prompt and seed for each shot.
5. When visuals are shared, require `max(zh_audio_duration, en_audio_duration) + 0.10s` of distinct footage. If a track is shorter, rewrite or trim it; never pad with repeated footage.
6. Assemble each language separately with matching narration and subtitles. Keep visuals text-free when the storyboard is shared.
7. Store variants in separate task directories and record actual absolute paths. Never assume the renderer will use names such as `final-zh.mp4`; tools may emit a generic name such as `final-1.mp4`.

Read [references/bilingual-production.md](references/bilingual-production.md) for the detailed paired-run record and YouTube recovery rules.

## 3. Validate before upload

For every final variant:

- verify the file exists, is non-empty, and is playable;
- run `ffprobe` and confirm video and audio streams;
- confirm portrait dimensions, frame rate, and 30–50 second duration;
- inspect beginning, middle, and end frames;
- check subtitle glyphs, line breaks, and timing;
- confirm scenes are distinct and the final frame is not truncated;
- keep language-matched metadata, disclosure, audience setting, and visibility;
- record task directory, storyboard directory, preflight audio directory, staged copies, duration, and SHA-256.

Do not delete intermediates or retry an uncertain upload before the publication state is known.

## 4. Publish and verify

1. Open the exact destination account and verify its identity and current role.
2. Select the matching local final MP4 with an absolute path.
3. Enter reviewed language-matched metadata and audience settings.
4. Set the explicitly requested visibility; the personal machine default is Public.
5. Submit once and wait for upload and processing.
6. For paired videos, upload each language variant as its own video. Never replace one variant with the other.
7. Record the final URL or ID, visibility, processing result, and copyright or policy result for every variant.

For YouTube Studio, a progress URL, `Saved as private`, or a pre-publication link is intermediate state. Success requires the visible published confirmation, share URL, and requested visibility. If a browser tab becomes stale, open a fresh Studio tab at the exact channel URL, verify the existing title and URL, and check for a duplicate before retrying.

For Facebook or Instagram, use the approved API or UI path for the verified account. Instagram requires a publicly reachable video URL for API ingestion; a local Windows path is not sufficient. Never expose a temporary public file beyond the time needed for confirmed ingestion.

## 5. Clean up safely

Only after every submitted variant has a reachable URL, the correct account identity, requested visibility, and verified processing result:

- retain the submitted final MP4 for each language;
- recycle only this run's generated narration, subtitles, H3 clips, previews, corrected clips, temporary assemblies, staged copies, storyboard, and preflight audio directories;
- resolve every deletion target to an exact absolute path;
- never delete a workspace root, shared asset directory, or `storage/local_videos` broadly;
- verify the retained final files still exist and their SHA-256 values are unchanged.

## Handoff record

Report the machine, destination account, topic, title, final local paths, Chinese/English mapping, platform URLs or IDs, visibility, processing state, policy result, and any warning or manual step.
