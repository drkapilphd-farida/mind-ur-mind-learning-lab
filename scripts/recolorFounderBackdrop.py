#!/usr/bin/env python3
"""Replace the founder photo's plain studio backdrop with the QSR/homepage
warm-light theme's page background color, so the photo blends into the
page instead of showing as a white rectangle.

Why this exists: a CSS vignette on the image edges was tried first, but
the backdrop dominates most of the object-cover crop actually shown in
the hero card — fading only the outer rim left most of the visible
background untouched. A single-sample color-distance version of this
script was tried next, but the studio backdrop isn't perfectly uniform —
lighting hotspots push large areas up to near-pure white (254,254,254),
well past a threshold tuned only on the (dimmer) image corners, so those
areas were silently left unreplaced. Verified this by sampling actual
served pixels rather than trusting the preview by eye.

Current approach: classify each pixel by brightness + saturation instead
of distance from one sampled color. The backdrop is bright AND
low-saturation everywhere, regardless of hotspot intensity; the subject
(skin, hair, maroon shirt, glasses) is either much darker or noticeably
more saturated. Calibrated against real sampled pixels — see the
threshold comments below for the actual RGB/brightness/saturation values
used to pick them.

Usage:
    pip3 install Pillow numpy   # one-time
    python3 scripts/recolorFounderBackdrop.py

Re-run this if the source photo (public/founder.jpg) or the page's
--color-void token ever changes — update TARGET_COLOR to match.
"""

from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parent.parent / "public" / "founder.jpg"
OUTPUT = Path(__file__).resolve().parent.parent / "public" / "founder-warm.jpg"

# --color-void from .warm-light in src/app/globals.css (#EFEAE2).
TARGET_COLOR = np.array([239, 234, 226], dtype=np.float32)

# Calibrated against sampled pixels from public/founder.jpg:
#   backdrop (incl. lighting hotspots): brightness 245-254, saturation 0-9
#   forehead skin:   brightness ~175, saturation ~82
#   hair:            brightness ~39,  saturation ~3   (dark enough to survive)
#   maroon shirt:    brightness ~47,  saturation ~47
#   glasses/skin:    brightness ~170, saturation ~57
# Soft ramps (not hard cutoffs) so hair/glasses edges blend instead of
# showing a jagged cutout line.
BRIGHTNESS_LOW, BRIGHTNESS_HIGH = 200.0, 235.0
SATURATION_LOW, SATURATION_HIGH = 8.0, 25.0


def main() -> None:
    src = Image.open(SOURCE).convert("RGB")
    arr = np.array(src).astype(np.float32)

    brightness = arr.mean(axis=2)
    saturation = arr.max(axis=2) - arr.min(axis=2)

    brightness_score = np.clip(
        (brightness - BRIGHTNESS_LOW) / (BRIGHTNESS_HIGH - BRIGHTNESS_LOW), 0.0, 1.0
    )
    saturation_score = np.clip(
        (SATURATION_HIGH - saturation) / (SATURATION_HIGH - SATURATION_LOW), 0.0, 1.0
    )
    backdrop_alpha = (brightness_score * saturation_score)[:, :, None]  # 1 = backdrop

    out = arr * (1 - backdrop_alpha) + TARGET_COLOR[None, None, :] * backdrop_alpha
    out = np.clip(out, 0, 255).astype(np.uint8)

    Image.fromarray(out).save(OUTPUT, quality=92)
    replaced_pct = (backdrop_alpha > 0.5).mean() * 100
    print(f"Saved {OUTPUT} — {replaced_pct:.1f}% of pixels classified as backdrop")


if __name__ == "__main__":
    main()
