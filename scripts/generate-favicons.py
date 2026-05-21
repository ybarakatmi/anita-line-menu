#!/usr/bin/env python3
"""Generate cross-browser favicon assets from app/icon.png."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "app" / "icon.png"
APP = ROOT / "app"
PUBLIC = ROOT / "public"

SIZES_PNG = {
    "icon-16.png": 16,
    "icon-32.png": 32,
    "icon-48.png": 48,
    "icon-192.png": 192,
    "icon-512.png": 512,
    "apple-touch-icon.png": 180,
}


def resize(img: Image.Image, size: int) -> Image.Image:
    return img.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    src = Image.open(SRC).convert("RGBA")

    ico_sizes = [16, 32, 48]
    ico_images = [resize(src, s) for s in ico_sizes]
    ico_images[-1].save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[:-1],
    )
    ico_images[-1].save(PUBLIC / "favicon.ico", format="ICO", sizes=[(s, s) for s in ico_sizes])

    for name, size in SIZES_PNG.items():
        out = resize(src, size)
        out.save(PUBLIC / name, format="PNG", optimize=True)
        if name == "icon-32.png":
            out.save(APP / "icon.png", format="PNG", optimize=True)
        if name == "apple-touch-icon.png":
            out.save(APP / "apple-icon.png", format="PNG", optimize=True)

    print("Generated favicons in app/ and public/")


if __name__ == "__main__":
    main()
