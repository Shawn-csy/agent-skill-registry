# Paired-language production

Use this reference when the user asks for Chinese and English versions of the same short video.

## Shared visual project, independent language tracks

```text
shared research + text-free visual storyboard
├── zh-TW script -> zh-TW audio -> zh-TW subtitles -> zh-TW final MP4
└── en script   -> en audio   -> en subtitles   -> en final MP4
```

Share the storyboard only when the visual material is language-neutral. Generate separate visuals when a scene contains written words, lip-sync, a language-specific joke, or language-specific on-screen text.

## Production sequence

1. Research once and write both scripts side by side. Adapt the hook, idioms, pacing, CTA, title, and caption naturally for each language.
2. Generate and measure both narrations independently. For shared visuals, use:

   ```text
   required_footage = max(zh_audio_duration, en_audio_duration) + 0.10s
   ```

3. Divide the longer track into 3–7 visual beats. Keep a distinct prompt and seed for every shot.
4. Generate the shared footage once, then assemble the Chinese and English files separately with matching audio and subtitles.
5. If one narration is shorter, trim or rewrite it, or add a new distinct visual beat. Do not loop, reverse, speed-change, or re-encode footage to fill time.
6. Review both final files independently for playable streams, 9:16 dimensions, duration, subtitle glyphs and timing, scene changes, title, caption, hashtags, disclosure, and audience setting.

## File record

Before upload, record this for each variant:

```text
locale, script, audio, subtitles, final MP4,
task directory, storyboard directory, preflight audio directory,
staged local-video copies, duration, SHA-256,
title, description, audience, visibility,
platform URL, processing result
```

Keep each language in a separate task directory. A renderer may emit `final-1.mp4`, so use the task directory and recorded absolute path as the source of truth.

## YouTube pair publication

Upload the two final files as two separate videos:

1. Verify the exact channel before selecting a file.
2. Use the visible file-selection control and an absolute path.
3. Fill language-matched metadata and the correct audience setting.
4. Continue through Details, Video elements, Checks, and Visibility. Inspect the Checks result.
5. Treat an upload-progress URL, `Saved as private`, or a pre-publication link as intermediate state.
6. Confirm the visible published state, share URL, and requested visibility before calling the upload successful.

If the browser becomes stale after submission, open a fresh Studio tab for the exact channel, verify the existing title and URL, and check for a duplicate before retrying. Never blindly upload a second copy.

## Cleanup gate

Clean only after both variants independently pass the publication gate. Use a dry-run cleanup first, inspect exact targets, then recycle only this run's intermediates. Preserve both final MP4s and verify their hashes after cleanup.
