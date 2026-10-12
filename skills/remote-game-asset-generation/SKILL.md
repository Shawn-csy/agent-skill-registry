---
name: remote-game-asset-generation
description: Generate and integrate consistent game art through a remote local-AI image API, using versioned style profiles, LoRA workflows, structured asset prompts, and safe Godot fallbacks.
---

# Remote Game Asset Generation

Use this skill when a game project needs AI-generated backgrounds, rooms, characters, items, actions, UI art, or a repeatable art direction backed by a remote local model such as ComfyUI.

## Operating model

- Keep the game runtime independent of the image server. Generate during content production, download finished assets into the project, and let Godot load local `res://` files.
- Keep the canonical art direction in versioned remote style profiles. The game project should pin a `style_profile` ID and version, then describe only the asset content.
- Preserve the existing simulation and interaction layer. Use images for visual surfaces; keep actor movement, room hit areas, door logic, privacy masks, and state-dependent overlays in code.
- Never overwrite an existing asset by default. Use versioned filenames and require an explicit force/replace choice for destructive replacement.

## Before generating

1. Inspect the actual game view and referenced assets. Identify the current palette, line quality, perspective, contrast, proportions, and whether the project is pixel art, flat illustration, painterly, or procedural.
2. Search the project for real image references (`res://` paths, `load`, and `preload`). Do not assume that a procedural renderer is already an image-based scene.
3. Decide whether the asset should be one complete background or a set of aligned panels. If actors or interactions depend on exact room coordinates, prefer separate room/stair/common-area textures or a reference-controlled workflow over an unconstrained whole-building image.
4. Check `/health` and `/styles` on the configured API before submitting expensive jobs. If the API is unavailable, do not make the game depend on it; report the fallback.

## Request shape

Use `POST /generate` with a style profile and structured content where possible. Read [references/request-schema.md](references/request-schema.md) for the supported fields and examples.

Separate style from content:

```json
{
  "style_profile": "dol_flat_cross_section_v1",
  "content": {
    "asset_type": "background",
    "subject": "small tenant bedroom with a desk and single bed",
    "context": "quiet rented apartment at night",
    "camera": "straight-on interior perspective",
    "constraints": ["no people", "no readable text"]
  },
  "prompt": "game scene background",
  "seed": 2601033,
  "filename": "tenant_room_v1.png"
}
```

For a particular object or action, include `asset_type`, `subject`, and `action` instead of relying on vague style prose. Use the same style profile and seed policy across variants that must feel related.

## Style and LoRA decisions

- Use a profile without a LoRA when the reference is architectural line-and-wash, flat illustration, or another style that the base model can reproduce with controlled prompts.
- Use one style LoRA at a time for the first pass. Do not stack unrelated pixel, map, character, and painterly LoRAs until a comparison proves the combination is stable.
- For true pixel art, render at a useful working size, then apply nearest-neighbor downscaling and palette reduction; do not treat the word `pixel` in a prompt as sufficient.
- When installing a new LoRA, verify base-model compatibility, trigger words, strength guidance, file license, and ComfyUI `models/loras` placement. Record the exact filename and strengths in the profile.
- If exact silhouette, room layout, or character identity matters, use a reference-image / ControlNet / IP-Adapter workflow or a project-specific LoRA instead of only adding prompt adjectives.

## Godot integration

- Import generated files into `assets/generated/` (or the project's established art folder), rescan/reimport them, and verify the game at runtime.
- Add a generated image layer behind actors and interactive overlays. Keep a procedural fallback when the asset is missing or unsuitable.
- For a full building replacement, ensure the generated composition matches the game's coordinate system. A visually attractive image with the wrong number of floors or room positions is not a valid replacement for an interactive map.
- Test privacy and state overlays: an occupied room must still be visually masked if the game rules say its interior is hidden; chained doors, labels, actors, and hit regions must remain aligned.
- Store the profile ID, version, seed, prompt/content request, and source job ID alongside the asset or in the project's asset manifest.

## Verification and handoff

Inspect each generated image, then run the game and capture one representative view. Verify composition, palette, line weight, room alignment, text artifacts, cropping, and state overlays. Report which assets were generated, which were wired into the game, and which remain alternatives.

When using a public LoRA, preserve its license information in the project documentation. Do not claim visual or commercial compatibility without checking the model card.
