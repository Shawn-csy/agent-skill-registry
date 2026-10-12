# Remote image request schema

The current local API accepts:

```text
GET  /health
GET  /styles
GET  /styles/<style_id>
POST /generate
GET  /jobs/<job_id>
GET  /image/<filename>
```

## `/generate`

Required:

- `prompt`: short semantic description, or omit it only when `content` produces a non-empty prompt.
- `filename`: local-safe image filename.

Recommended:

- `style_profile`: versioned profile ID, for example `dol_flat_cross_section_v1`, `pixel_dol_v1`, or `pixel_dol_map_v1`.
- `content.asset_type`: `background`, `room`, `item`, `character`, `action`, `ui`, or `map`.
- `content.subject`: the specific object, room, person, or scene.
- `content.action`: the pose or event when the asset depicts an action.
- `content.instruction`: visible instruction/command for a UI asset, only when text rendering is intentional.
- `content.context`: narrative/location context.
- `content.camera`: view, framing, and composition.
- `content.constraints`: repeatable restrictions such as `no people`, `one object only`, `no readable text`, or `transparent-looking background`.
- `negative_prompt`: content-specific exclusions; the style profile's negative prompt is also applied.
- `seed`: fixed for comparable variants; omit for a random result.
- `timeout_seconds`: bound the remote job wait.

The job response records the resolved prompt, negative prompt, content object, seed, style profile ID/version, ComfyUI prompt ID, and output URL. Preserve those fields for reproducibility.

## Examples

### Existing-game architectural style

```json
{
  "style_profile": "dol_flat_cross_section_v1",
  "prompt": "room background",
  "content": {
    "asset_type": "room",
    "subject": "small tenant bedroom with a single bed, desk, wardrobe, and personal belongings",
    "context": "quiet rented Taipei apartment at night",
    "camera": "clean interior perspective, readable room geometry",
    "constraints": ["fine dark ink contour lines", "soft mauve watercolor fills", "no people", "no readable text"]
  },
  "filename": "tenant_room_v1.png",
  "seed": 2601034
}
```

### Specific item/action

```json
{
  "style_profile": "pixel_dol_v1",
  "prompt": "inventory item illustration",
  "content": {
    "asset_type": "action",
    "subject": "old brass apartment key with a blue plastic tag",
    "action": "turning the key in an old metal lock",
    "context": "Taipei apartment hallway at night",
    "camera": "single readable side-view composition",
    "constraints": ["one subject only", "no readable text"]
  },
  "filename": "key_unlock_action_v1.png",
  "seed": 2601035
}
```

## Profile guidance

The project currently uses these conventions:

- `dol_flat_cross_section_v1`: no LoRA; architectural line-and-wash, warm ivory paper, dusty rose/mauve/lavender fills, fine dark contours.
- `dol_building_wide_v1`: wide two-floor cutaway variant; validate the number of floors and room positions before wiring it into an interactive map.
- `pixel_dol_v1`: general SDXL pixel-art LoRA profile.
- `pixel_dol_map_v1`: SDXL map/tile profile using `mapchipLora`.

Treat profile IDs as immutable versions. Create `*_v2` for a materially different visual direction rather than silently changing existing assets.
