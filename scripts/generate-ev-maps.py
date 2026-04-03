"""
Generate depth maps and motion masks for the EV simulator scene photos.

Depth maps use smooth perspective-based gradients — no sharp edges.
White = near (in front of camera), black = far.
Motion masks use soft elliptical shapes — no hard rectangles.
White = moving, black = static.

Usage: python3 scripts/generate-ev-maps.py
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'exposure-simulator')


def smooth_clamp(v):
    return max(0, min(255, int(v)))


# ── Street scene ──────────────────────────────────────────────────────────────

def street_depth(w, h):
    """Street: ground plane perspective. Bottom = near, top = far.
    Vanishing point near top-center. Smooth gradient, no hard edges."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    # Vanishing point
    vx, vy = w * 0.5, h * 0.25
    for y in range(h):
        for x in range(w):
            # Distance from vanishing point (normalized)
            dy = (y - vy) / h
            dx = (x - vx) / w * 0.3  # horizontal matters less
            dist = math.sqrt(dx * dx + dy * dy)
            # Near at bottom, far at vanishing point
            depth = smooth_clamp(255 * min(dist / 0.6, 1.0))
            pixels[x, y] = depth
    return img.filter(ImageFilter.GaussianBlur(radius=30))


def street_motion(w, h):
    """Street: several walking figures as soft ellipses, no rectangles."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)
    # Multiple pedestrian blobs at different positions
    figures = [
        (0.35, 0.35, 0.08, 0.35, 180),  # left person
        (0.48, 0.40, 0.07, 0.30, 200),  # center person
        (0.62, 0.38, 0.06, 0.28, 150),  # right person
        (0.22, 0.42, 0.05, 0.25, 120),  # far left
    ]
    for cx, cy, rx, ry, intensity in figures:
        draw.ellipse([
            int(w * (cx - rx)), int(h * (cy - ry)),
            int(w * (cx + rx)), int(h * (cy + ry))
        ], fill=intensity)
    return img.filter(ImageFilter.GaussianBlur(radius=40))


# ── Landscape scene ───────────────────────────────────────────────────────────

def landscape_depth(w, h):
    """Landscape: horizontal bands — sky far, mountains mid, foreground near.
    Smooth S-curve transition between zones."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    for y in range(h):
        t = y / h  # 0=top, 1=bottom
        # S-curve: sky(0-0.3)=far, mountains(0.3-0.55)=mid, ground(0.55-1)=near
        if t < 0.3:
            depth = t / 0.3 * 0.15  # sky: very far (0-0.15)
        elif t < 0.55:
            # Smooth transition from far mountains to mid
            p = (t - 0.3) / 0.25
            depth = 0.15 + p * p * 0.35  # quadratic ease-in
        else:
            # Ground: near
            p = (t - 0.55) / 0.45
            depth = 0.5 + p * 0.5
        val = smooth_clamp(255 * depth)
        for x in range(w):
            pixels[x, y] = val
    return img.filter(ImageFilter.GaussianBlur(radius=20))


def landscape_motion(w, h):
    """Landscape: soft band of flowing water near bottom, wispy clouds at top."""
    img = Image.new('L', (w, h), 0)
    pixels = img.load()
    for y in range(h):
        t = y / h
        # Water band: soft gaussian centered at t=0.85
        water = math.exp(-((t - 0.85) ** 2) / (2 * 0.06 ** 2)) * 180
        # Cloud band: soft gaussian centered at t=0.08
        cloud = math.exp(-((t - 0.08) ** 2) / (2 * 0.05 ** 2)) * 80
        val = smooth_clamp(water + cloud)
        for x in range(w):
            pixels[x, y] = val
    return img.filter(ImageFilter.GaussianBlur(radius=30))


# ── Portrait scene ────────────────────────────────────────────────────────────

def portrait_depth(w, h):
    """Portrait: subject face/torso is near (center), everything else falls off
    smoothly. Elliptical falloff centered on face area."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    # Subject center (face/upper body)
    cx, cy = w * 0.48, h * 0.38
    # Elliptical radius (tighter vertically for face shape)
    rx, ry = w * 0.22, h * 0.35
    for y in range(h):
        for x in range(w):
            # Normalized elliptical distance
            dx = (x - cx) / rx
            dy = (y - cy) / ry
            dist = math.sqrt(dx * dx + dy * dy)
            # Smooth falloff: subject=white, background=dark
            # Use smoothstep-like curve
            if dist < 0.5:
                depth = 1.0
            elif dist < 1.5:
                t = (dist - 0.5) / 1.0
                depth = 1.0 - t * t * (3 - 2 * t)  # smoothstep
            else:
                depth = 0.0
            pixels[x, y] = smooth_clamp(255 * depth)
    return img.filter(ImageFilter.GaussianBlur(radius=15))


def portrait_motion(w, h):
    """Portrait: very subtle — slight hair movement at top, fabric sway."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)
    # Soft hair region
    draw.ellipse([int(w * 0.35), int(h * 0.05), int(w * 0.60), int(h * 0.28)],
                  fill=90)
    # Very subtle sleeve/fabric
    draw.ellipse([int(w * 0.25), int(h * 0.55), int(w * 0.40), int(h * 0.75)],
                  fill=50)
    return img.filter(ImageFilter.GaussianBlur(radius=35))


# ── Low light scene ───────────────────────────────────────────────────────────

def lowlight_depth(w, h):
    """Night city: street-level perspective. Ground near, skyline far.
    Vanishing point at top center."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    vx, vy = w * 0.5, h * 0.2
    for y in range(h):
        for x in range(w):
            dy = (y - vy) / h
            dx = (x - vx) / w * 0.25
            dist = math.sqrt(dx * dx + dy * dy)
            depth = smooth_clamp(255 * min(dist / 0.65, 1.0))
            pixels[x, y] = depth
    return img.filter(ImageFilter.GaussianBlur(radius=25))


def lowlight_motion(w, h):
    """Night: car headlight streaks on road (horizontal band), some pedestrians."""
    img = Image.new('L', (w, h), 0)
    pixels = img.load()
    for y in range(h):
        t = y / h
        # Road traffic band: gaussian centered at t=0.65
        traffic = math.exp(-((t - 0.65) ** 2) / (2 * 0.08 ** 2)) * 200
        val = smooth_clamp(traffic)
        for x in range(w):
            pixels[x, y] = val
    # Add a couple of soft pedestrian blobs
    draw = ImageDraw.Draw(img)
    draw.ellipse([int(w * 0.18), int(h * 0.3), int(w * 0.28), int(h * 0.65)],
                  fill=100)
    draw.ellipse([int(w * 0.72), int(h * 0.35), int(w * 0.80), int(h * 0.60)],
                  fill=80)
    return img.filter(ImageFilter.GaussianBlur(radius=30))


# ── Generate all ──────────────────────────────────────────────────────────────

scenes = {
    'street': (street_depth, street_motion),
    'landscape': (landscape_depth, landscape_motion),
    'portrait': (portrait_depth, portrait_motion),
    'lowlight': (lowlight_depth, lowlight_motion),
}

for name, (depth_fn, motion_fn) in scenes.items():
    photo_path = os.path.join(OUT, f'{name}.jpg')
    photo = Image.open(photo_path)
    w, h = photo.size
    print(f'{name}: {w}x{h}')

    depth = depth_fn(w, h)
    depth.save(os.path.join(OUT, f'{name}-depth.png'))

    motion = motion_fn(w, h)
    motion.save(os.path.join(OUT, f'{name}-motion.png'))

print(f'Generated depth maps and motion masks for {len(scenes)} scenes')
