"""Optimise newly sourced official Shalom Embassy photography.

Source files live in the system temp folder after being fetched from the
ministry's official YouTube channels. Outputs follow the existing
assets/img/opt/<name>-<width>.{avif,webp} convention.
"""
from pathlib import Path
import pillow_avif  # noqa: F401 - registers the AVIF codec with Pillow
from PIL import Image, ImageOps

SRC = Path.home() / "AppData/Local/Temp/shalom-photos"
OUT = Path(__file__).resolve().parent.parent / "assets" / "img" / "opt"
RAW = Path(__file__).resolve().parent.parent / "assets" / "img"

MAP = {
    "5GGjwFaH8uM": "power-supply",
    "ey2jrizUceY": "worship-deep",
    "6dwCmvhVqNw": "altar-honour",
    "JjcGamEqUxo": "revival-fire",
    "SImK4jEk3T8": "anniversary-day3",
    "Aqw-9dJpqN8": "anniversary-day2",
    "ZqD414u0My8": "story-six-points",
    "ZKItIU2GcIc": "story-glory",
    "aI0PCeclZBQ": "story-persistence",
    "sBN8a5VYhXY": "story-turnaround",
    "JEaLV22kwL4": "story-preserved",
    "rhaNffYa0xI": "story-safe-delivery",
    "s_YkzCm5IsE": "story-epilepsy",
    "8hrpt7wv9lE": "story-footballer",
    "HvxDnmC83WY": "story-holy-ghost",
}

for video_id, name in MAP.items():
    src = SRC / f"{video_id}.jpg"
    if not src.exists():
        print("missing", src)
        continue
    with Image.open(src) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        width, height = image.size
        # Keep the original master in assets/img for lightbox quality.
        master = RAW / f"{name}.jpg"
        image.save(master, "JPEG", quality=90, optimize=True)
        image.save(RAW / f"{name}.webp", "WEBP", quality=88, method=6)

        max_width = min(width, 1280)
        widths = [w for w in (320, 480, 640, 960, 1280) if w < max_width]
        widths.append(max_width)
        for target in widths:
            ratio = target / width
            resized = image.resize(
                (target, max(1, round(height * ratio))), Image.LANCZOS
            )
            resized.save(
                OUT / f"{name}-{target}.webp", "WEBP", quality=82, method=6
            )
            resized.save(
                OUT / f"{name}-{target}.avif", "AVIF", quality=55, speed=5
            )
        print(f"{name}: {width}x{height} -> {', '.join(map(str, widths))}")
