"""
Generate illustrated scenes for the White Balance Visualizer.

4 scenes showing different lighting conditions where white balance matters:
- Indoor: warm tungsten-lit room with furniture
- Outdoor: sunny park/garden with trees and sky
- Golden Hour: sunset scene with warm light
- Overcast: cloudy day, cool blue tones

Usage: python3 scripts/generate-wb-scenes.py
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import random
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'white-balance')
os.makedirs(OUT, exist_ok=True)

W, H = 1200, 800
random.seed(99)


def lerp(c1, c2, t):
    t = max(0, min(1, t))
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def clamp(v):
    return max(0, min(255, int(v)))


# ═══════════════════════════════════════════════════════════════════════════════
# INDOOR — Warm living room with furniture, lamp, window, bookshelves
# ═══════════════════════════════════════════════════════════════════════════════

def make_indoor():
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)

    # Wall
    for y in range(H):
        t = y / H
        c = lerp((180, 160, 130), (160, 140, 110), t)
        d.line([(0, y), (W, y)], fill=c)

    # Floor
    floor_y = int(H * 0.65)
    for y in range(floor_y, H):
        t = (y - floor_y) / (H - floor_y)
        c = lerp((120, 90, 60), (100, 75, 50), t)
        d.line([(0, y), (W, y)], fill=c)
    # Floor planks
    for px in range(0, W, 80):
        d.line([(px, floor_y), (px, H)], fill=(90, 70, 45), width=1)

    # Baseboard
    d.rectangle([0, floor_y - 5, W, floor_y + 8], fill=(140, 120, 90))

    # ── Window (right side) — cool daylight ──
    wx, wy = int(W * 0.72), int(H * 0.10)
    ww, wh = 200, int(H * 0.42)
    # Window frame
    d.rectangle([wx - 8, wy - 8, wx + ww + 8, wy + wh + 8], fill=(160, 140, 110))
    # Sky through window
    for y in range(wy, wy + wh):
        t = (y - wy) / wh
        c = lerp((160, 200, 240), (200, 220, 240), t)
        d.line([(wx, y), (wx + ww, y)], fill=c)
    # Window panes
    d.line([(wx + ww // 2, wy), (wx + ww // 2, wy + wh)], fill=(160, 140, 110), width=4)
    d.line([(wx, wy + wh // 2), (wx + ww, wy + wh // 2)], fill=(160, 140, 110), width=4)
    # Curtains
    for cx in [wx - 30, wx + ww + 5]:
        d.rectangle([cx, wy - 15, cx + 25, wy + wh + 20], fill=(170, 155, 135))
        # Curtain folds
        for fold_y in range(wy, wy + wh + 20, 12):
            d.line([(cx + 5, fold_y), (cx + 20, fold_y)], fill=(155, 140, 120), width=1)

    # Light patch from window on floor
    d.polygon([
        (wx, floor_y), (wx + ww, floor_y),
        (wx + ww + 60, H), (wx - 20, H)
    ], fill=(140, 120, 85))

    # ── Bookshelf (left wall) ──
    bsx, bsy = int(W * 0.02), int(H * 0.05)
    bsw, bsh = 180, int(H * 0.58)
    d.rectangle([bsx, bsy, bsx + bsw, bsy + bsh], fill=(100, 70, 45))
    # Shelves
    shelf_count = 5
    for i in range(shelf_count + 1):
        sy = bsy + i * (bsh // shelf_count)
        d.rectangle([bsx, sy - 3, bsx + bsw, sy + 3], fill=(110, 80, 50))
        # Books on shelf
        if i < shelf_count:
            bx = bsx + 5
            while bx < bsx + bsw - 10:
                bw = random.randint(8, 18)
                bh_book = bsh // shelf_count - 10
                bc = random.choice([
                    (180, 50, 50), (50, 80, 140), (60, 120, 60), (180, 140, 50),
                    (140, 60, 100), (50, 130, 130), (160, 100, 50), (80, 60, 120),
                    (200, 80, 60), (60, 100, 80)
                ])
                d.rectangle([bx, sy + 6, bx + bw, sy + 6 + bh_book], fill=bc)
                bx += bw + random.randint(0, 2)

    # ── Table lamp (center) — warm glow source ──
    lamp_x = int(W * 0.45)
    lamp_base_y = floor_y - 5
    # Side table
    d.rectangle([lamp_x - 50, lamp_base_y - 40, lamp_x + 50, lamp_base_y],
                 fill=(110, 80, 50))
    d.rectangle([lamp_x - 40, lamp_base_y, lamp_x + 40, floor_y + 5],
                 fill=(100, 70, 45))
    # Lamp stand
    d.rectangle([lamp_x - 3, lamp_base_y - 100, lamp_x + 3, lamp_base_y - 40],
                 fill=(150, 130, 100))
    # Lampshade
    d.polygon([
        (lamp_x - 35, lamp_base_y - 100),
        (lamp_x + 35, lamp_base_y - 100),
        (lamp_x + 25, lamp_base_y - 150),
        (lamp_x - 25, lamp_base_y - 150),
    ], fill=(220, 190, 140))
    # Warm glow
    for r in range(120, 10, -5):
        alpha = (120 - r) / 120
        gc = lerp((180, 160, 130), (255, 220, 150), alpha * 0.3)
        d.ellipse([lamp_x - r, lamp_base_y - 130 - r // 2,
                   lamp_x + r, lamp_base_y - 130 + r // 2], fill=gc)

    # ── Sofa ──
    sofa_x = int(W * 0.30)
    sofa_y = floor_y - 8
    d.rounded_rectangle([sofa_x - 100, sofa_y - 60, sofa_x + 100, sofa_y],
                         radius=8, fill=(80, 55, 45))
    # Back
    d.rounded_rectangle([sofa_x - 100, sofa_y - 100, sofa_x + 100, sofa_y - 55],
                         radius=8, fill=(90, 62, 50))
    # Armrests
    d.rounded_rectangle([sofa_x - 110, sofa_y - 95, sofa_x - 95, sofa_y - 10],
                         radius=5, fill=(85, 58, 47))
    d.rounded_rectangle([sofa_x + 95, sofa_y - 95, sofa_x + 110, sofa_y - 10],
                         radius=5, fill=(85, 58, 47))
    # Cushions
    d.rounded_rectangle([sofa_x - 45, sofa_y - 55, sofa_x - 5, sofa_y - 8],
                         radius=5, fill=(95, 68, 55))
    d.rounded_rectangle([sofa_x + 5, sofa_y - 55, sofa_x + 45, sofa_y - 8],
                         radius=5, fill=(95, 68, 55))
    # Throw pillows
    d.rounded_rectangle([sofa_x - 80, sofa_y - 80, sofa_x - 50, sofa_y - 50],
                         radius=4, fill=(180, 120, 60))
    d.rounded_rectangle([sofa_x + 50, sofa_y - 80, sofa_x + 80, sofa_y - 50],
                         radius=4, fill=(60, 100, 120))

    # ── Rug ──
    d.ellipse([int(W * 0.25), floor_y + 20, int(W * 0.65), H - 20],
               fill=(130, 80, 60))
    d.ellipse([int(W * 0.27), floor_y + 25, int(W * 0.63), H - 25],
               fill=(140, 90, 65))
    # Pattern
    d.ellipse([int(W * 0.32), floor_y + 45, int(W * 0.58), H - 45],
               outline=(160, 110, 70), width=2)

    # ── Picture frames on wall ──
    frames = [(int(W * 0.38), int(H * 0.12), 70, 50),
              (int(W * 0.55), int(H * 0.08), 55, 75)]
    for fx, fy, fw, fh in frames:
        d.rectangle([fx - 3, fy - 3, fx + fw + 3, fy + fh + 3], fill=(120, 100, 70))
        fc = random.choice([(140, 160, 180), (180, 160, 140), (160, 180, 160)])
        d.rectangle([fx, fy, fx + fw, fy + fh], fill=fc)

    # ── Plant in corner ──
    px, py = int(W * 0.92), floor_y - 5
    # Pot
    d.polygon([(px - 18, py), (px + 18, py), (px + 14, py - 35), (px - 14, py - 35)],
              fill=(160, 100, 70))
    # Leaves
    for i in range(8):
        angle = i * 45 + random.randint(-15, 15)
        lx = px + int(25 * math.cos(math.radians(angle)))
        ly = py - 35 - abs(int(30 * math.sin(math.radians(angle))))
        d.ellipse([lx - 12, ly - 6, lx + 12, ly + 6],
                   fill=lerp((40, 100, 50), (60, 130, 60), random.random()))

    # ── Ceiling lamp (subtle) ──
    d.rectangle([int(W * 0.48), 0, int(W * 0.52), 15], fill=(160, 140, 110))
    d.ellipse([int(W * 0.44), 10, int(W * 0.56), 30], fill=(200, 180, 140))

    return img


# ═══════════════════════════════════════════════════════════════════════════════
# OUTDOOR — Sunny park with trees, path, flowers, blue sky
# ═══════════════════════════════════════════════════════════════════════════════

def make_outdoor():
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)

    # Sky
    for y in range(int(H * 0.45)):
        t = y / (H * 0.45)
        c = lerp((80, 150, 230), (150, 200, 245), t)
        d.line([(0, y), (W, y)], fill=c)

    # Clouds
    for cx, cy, rx, ry in [(200, 45, 100, 25), (550, 30, 130, 30),
                             (850, 50, 90, 22), (400, 70, 70, 18)]:
        for i in range(4):
            ox, oy = random.randint(-20, 20), random.randint(-6, 6)
            d.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy],
                       fill=(245, 250, 255))

    # Sun
    sun_x, sun_y = int(W * 0.80), int(H * 0.06)
    for r in range(50, 10, -5):
        gc = lerp((200, 220, 245), (255, 250, 220), (50 - r) / 40)
        d.ellipse([sun_x - r, sun_y - r, sun_x + r, sun_y + r], fill=gc)

    # Distant hills
    pts = [(0, int(H * 0.42))]
    x = 0
    while x < W:
        pts.append((x, random.randint(int(H * 0.36), int(H * 0.42))))
        x += random.randint(60, 120)
    pts += [(W, int(H * 0.42)), (W, int(H * 0.48)), (0, int(H * 0.48))]
    d.polygon(pts, fill=(80, 140, 80))

    # Grass field
    grass_top = int(H * 0.45)
    for y in range(grass_top, H):
        t = (y - grass_top) / (H - grass_top)
        c = lerp((60, 140, 50), (80, 160, 60), t)
        d.line([(0, y), (W, y)], fill=c)

    # Path (winding)
    path_pts = []
    for i in range(20):
        t = i / 19
        px = int(W * 0.5 + math.sin(t * 2) * 80 * (1 - t))
        py = int(grass_top + t * (H - grass_top))
        path_pts.append((px, py))
    for i in range(len(path_pts) - 1):
        w_path = int(15 + (path_pts[i][1] - grass_top) / (H - grass_top) * 50)
        d.line([path_pts[i], path_pts[i + 1]], fill=(190, 175, 150), width=w_path)

    # Large trees
    trees = [(int(W * 0.12), int(H * 0.30), 50, (55, 100, 45)),
             (int(W * 0.35), int(H * 0.25), 60, (45, 110, 40)),
             (int(W * 0.70), int(H * 0.28), 55, (50, 105, 42)),
             (int(W * 0.90), int(H * 0.32), 45, (48, 95, 38))]
    for tx, ty, tr, tc in trees:
        # Trunk
        d.rectangle([tx - 8, ty + tr, tx + 8, int(H * 0.55)], fill=(90, 65, 40))
        # Canopy
        for i in range(8):
            ox = random.randint(-20, 20)
            oy = random.randint(-15, 10)
            r = random.randint(tr - 10, tr + 10)
            gc = lerp(tc, (tc[0] + 20, tc[1] + 20, tc[2] + 10), random.random())
            d.ellipse([tx - r + ox, ty - r + oy, tx + r + ox, ty + r + oy], fill=gc)
        # Shadow dapples
        for i in range(5):
            sx = tx + random.randint(-tr, tr)
            sy = ty + random.randint(-tr // 2, tr // 2)
            d.ellipse([sx - 5, sy - 3, sx + 5, sy + 3],
                       fill=lerp(tc, (30, 70, 25), 0.3))

    # Flower patches
    for patch_x, patch_y, count in [(int(W * 0.20), int(H * 0.70), 30),
                                     (int(W * 0.60), int(H * 0.65), 25),
                                     (int(W * 0.80), int(H * 0.75), 20)]:
        for i in range(count):
            fx = patch_x + random.randint(-60, 60)
            fy = patch_y + random.randint(-20, 20)
            fc = random.choice([(255, 80, 80), (255, 200, 50), (255, 150, 200),
                                (200, 100, 255), (255, 255, 100)])
            fr = random.randint(3, 6)
            d.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=fc)
            # Stem
            d.line([(fx, fy + fr), (fx, fy + fr + 8)], fill=(50, 110, 40), width=1)

    # Bench on path
    bench_x = int(W * 0.52)
    bench_y = int(H * 0.60)
    d.rectangle([bench_x - 30, bench_y - 5, bench_x + 30, bench_y], fill=(120, 80, 50))
    d.rectangle([bench_x - 28, bench_y - 15, bench_x + 28, bench_y - 8], fill=(110, 75, 45))
    # Legs
    for lx in [bench_x - 25, bench_x + 25]:
        d.rectangle([lx - 2, bench_y, lx + 2, bench_y + 12], fill=(100, 70, 40))

    # Butterflies
    for bx, by in [(int(W * 0.25), int(H * 0.55)), (int(W * 0.65), int(H * 0.50))]:
        bc = random.choice([(255, 200, 50), (200, 100, 255)])
        d.polygon([(bx, by), (bx - 6, by - 5), (bx - 3, by + 2)], fill=bc)
        d.polygon([(bx, by), (bx + 6, by - 5), (bx + 3, by + 2)], fill=bc)

    # Birds
    for bx, by in [(int(W * 0.30), int(H * 0.10)), (int(W * 0.35), int(H * 0.12)),
                    (int(W * 0.65), int(H * 0.08))]:
        d.arc([bx - 6, by - 3, bx, by + 3], 200, 340, fill=(40, 40, 50), width=2)
        d.arc([bx, by - 3, bx + 6, by + 3], 200, 340, fill=(40, 40, 50), width=2)

    return img


# ═══════════════════════════════════════════════════════════════════════════════
# GOLDEN HOUR — Sunset scene with warm orange light
# ═══════════════════════════════════════════════════════════════════════════════

def make_golden():
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)

    # Sky gradient — warm sunset
    for y in range(int(H * 0.50)):
        t = y / (H * 0.50)
        if t < 0.3:
            c = lerp((255, 140, 50), (255, 180, 80), t / 0.3)
        elif t < 0.6:
            c = lerp((255, 180, 80), (255, 200, 130), (t - 0.3) / 0.3)
        else:
            c = lerp((255, 200, 130), (220, 190, 160), (t - 0.6) / 0.4)
        d.line([(0, y), (W, y)], fill=c)

    # Sun (large, low)
    sun_x, sun_y = int(W * 0.35), int(H * 0.38)
    for r in range(80, 10, -3):
        alpha = (80 - r) / 70
        gc = lerp((255, 200, 130), (255, 240, 200), alpha)
        d.ellipse([sun_x - r, sun_y - r, sun_x + r, sun_y + r], fill=gc)

    # Sun rays
    for angle in range(0, 360, 30):
        rx = sun_x + int(120 * math.cos(math.radians(angle)))
        ry = sun_y + int(80 * math.sin(math.radians(angle)))
        d.line([(sun_x, sun_y), (rx, ry)], fill=(255, 220, 160), width=2)

    # Water/lake
    water_top = int(H * 0.48)
    for y in range(water_top, H):
        t = (y - water_top) / (H - water_top)
        c = lerp((200, 150, 100), (150, 100, 70), t)
        d.line([(0, y), (W, y)], fill=c)

    # Sun reflection on water
    for y in range(water_top, int(H * 0.80)):
        t = (y - water_top) / (H * 0.80 - water_top)
        ref_w = int(30 + t * 60)
        ref_x = sun_x + random.randint(-5, 5)
        c = lerp((255, 220, 160), (220, 160, 100), t)
        d.line([(ref_x - ref_w, y), (ref_x + ref_w, y)], fill=c)

    # Water ripples
    for i in range(40):
        ry = random.randint(water_top + 10, H - 10)
        rx = random.randint(30, W - 30)
        rw = random.randint(20, 60)
        d.line([(rx, ry), (rx + rw, ry)],
               fill=lerp((180, 130, 90), (200, 150, 110), random.random()), width=1)

    # Silhouette hills
    pts = [(0, int(H * 0.48))]
    x = 0
    while x < W:
        pts.append((x, random.randint(int(H * 0.40), int(H * 0.48))))
        x += random.randint(40, 100)
    pts += [(W, int(H * 0.48)), (W, int(H * 0.52)), (0, int(H * 0.52))]
    d.polygon(pts, fill=(60, 40, 30))

    # Silhouette trees on horizon
    for tx in range(50, W, random.randint(80, 150)):
        ty = int(H * 0.38) + random.randint(-20, 10)
        # Trunk
        d.rectangle([tx - 3, ty, tx + 3, int(H * 0.48)], fill=(40, 25, 15))
        # Canopy
        tr = random.randint(20, 35)
        d.ellipse([tx - tr, ty - tr, tx + tr, ty + tr], fill=(50, 30, 20))

    # Dock/pier
    dock_x = int(W * 0.65)
    d.polygon([
        (dock_x, int(H * 0.48)),
        (dock_x + 120, int(H * 0.52)),
        (dock_x + 115, int(H * 0.54)),
        (dock_x - 5, int(H * 0.50)),
    ], fill=(80, 55, 35))
    # Posts
    for px in range(dock_x + 10, dock_x + 110, 30):
        py = int(H * 0.49 + (px - dock_x) * 0.0003 * (H - water_top))
        d.rectangle([px - 2, py, px + 2, py + 25], fill=(70, 45, 30))

    # Person silhouette on dock
    px, py = dock_x + 80, int(H * 0.42)
    d.rounded_rectangle([px - 8, py, px + 8, py + 35], radius=3, fill=(35, 20, 15))
    d.ellipse([px - 7, py - 12, px + 7, py + 2], fill=(35, 20, 15))

    # Distant boats
    for bx, by in [(int(W * 0.15), int(H * 0.50)), (int(W * 0.85), int(H * 0.49))]:
        d.polygon([(bx - 15, by), (bx + 15, by), (bx + 10, by + 5), (bx - 10, by + 5)],
                   fill=(50, 30, 20))
        d.polygon([(bx, by), (bx + 2, by), (bx + 2, by - 18), (bx, by - 15)],
                   fill=(50, 30, 20))

    return img


# ═══════════════════════════════════════════════════════════════════════════════
# OVERCAST — Cloudy day, urban scene with cool blue tones
# ═══════════════════════════════════════════════════════════════════════════════

def make_overcast():
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)

    # Overcast sky — flat, gray-blue
    for y in range(int(H * 0.40)):
        t = y / (H * 0.40)
        c = lerp((170, 180, 195), (190, 195, 205), t)
        d.line([(0, y), (W, y)], fill=c)

    # Heavy cloud layer
    for i in range(30):
        cx = random.randint(-50, W + 50)
        cy = random.randint(0, int(H * 0.35))
        rx = random.randint(60, 150)
        ry = random.randint(20, 40)
        cc = lerp((175, 185, 200), (195, 200, 210), random.random())
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=cc)

    # Buildings — urban scene
    building_data = []
    bx = -20
    while bx < W + 50:
        bw = random.randint(80, 160)
        bh = random.randint(150, 380)
        by = int(H * 0.45) - bh
        bc = lerp((120, 125, 135), (150, 155, 165), random.random())
        building_data.append((bx, by, bw, bh, bc))
        d.rectangle([bx, by, bx + bw, int(H * 0.45)], fill=bc)
        # Windows
        for wy in range(by + 10, int(H * 0.45) - 10, 16):
            for wx in range(bx + 8, bx + bw - 8, 14):
                if random.random() < 0.6:
                    wc = lerp((160, 170, 185), (200, 210, 225), random.random())
                    d.rectangle([wx, wy, wx + 7, wy + 10], fill=wc)
        # Roof detail
        d.rectangle([bx, by, bx + bw, by + 5],
                     fill=lerp(bc, (100, 105, 115), 0.3))
        bx += bw + random.randint(-5, 10)

    # Street
    street_y = int(H * 0.45)
    for y in range(street_y, H):
        t = (y - street_y) / (H - street_y)
        c = lerp((100, 105, 115), (80, 85, 95), t)
        d.line([(0, y), (W, y)], fill=c)

    # Wet street reflections
    for i in range(80):
        rx = random.randint(0, W)
        ry = random.randint(street_y + 30, H)
        rw = random.randint(15, 50)
        rc = lerp((110, 115, 130), (130, 135, 150), random.random())
        d.line([(rx, ry), (rx + rw, ry)], fill=rc, width=1)

    # Puddle
    puddle_x, puddle_y = int(W * 0.45), int(H * 0.78)
    d.ellipse([puddle_x - 80, puddle_y - 15, puddle_x + 80, puddle_y + 15],
               fill=(120, 130, 150))
    d.ellipse([puddle_x - 70, puddle_y - 10, puddle_x + 70, puddle_y + 10],
               fill=(130, 140, 160))

    # Sidewalk
    d.polygon([(0, street_y), (0, int(H * 0.55)),
               (int(W * 0.15), int(H * 0.50)), (int(W * 0.15), street_y)],
              fill=(140, 145, 150))
    d.polygon([(W, street_y), (W, int(H * 0.55)),
               (int(W * 0.85), int(H * 0.50)), (int(W * 0.85), street_y)],
              fill=(140, 145, 150))

    # People with umbrellas
    umbrella_people = [
        (int(W * 0.10), int(H * 0.47), (200, 60, 60)),
        (int(W * 0.30), int(H * 0.52), (60, 60, 180)),
        (int(W * 0.55), int(H * 0.50), (60, 160, 60)),
        (int(W * 0.78), int(H * 0.48), (180, 180, 50)),
        (int(W * 0.90), int(H * 0.51), (160, 60, 160)),
    ]
    for px, py, uc in umbrella_people:
        # Body
        d.rounded_rectangle([px - 8, py, px + 8, py + 40],
                             radius=3, fill=(60, 60, 70))
        # Head
        d.ellipse([px - 6, py - 10, px + 6, py + 2], fill=(180, 155, 135))
        # Umbrella
        d.pieslice([px - 22, py - 30, px + 22, py - 5], 180, 0, fill=uc)
        d.line([(px, py - 5), (px, py - 30)], fill=(80, 80, 80), width=2)

    # Cars
    for cx, cy, cc in [(int(W * 0.40), int(H * 0.65), (80, 80, 95)),
                        (int(W * 0.70), int(H * 0.70), (90, 85, 100))]:
        d.rounded_rectangle([cx - 50, cy - 20, cx + 50, cy + 20],
                             radius=6, fill=cc)
        d.rectangle([cx - 35, cy - 30, cx + 35, cy - 18],
                     fill=lerp(cc, (160, 170, 190), 0.4))
        d.ellipse([cx - 40, cy + 15, cx - 25, cy + 28], fill=(50, 50, 55))
        d.ellipse([cx + 25, cy + 15, cx + 40, cy + 28], fill=(50, 50, 55))
        # Headlights
        d.ellipse([cx - 48, cy - 5, cx - 40, cy + 5], fill=(220, 220, 200))

    # Street lights
    for lx in [int(W * 0.20), int(W * 0.60), int(W * 0.85)]:
        ly = int(H * 0.28)
        d.rectangle([lx - 2, ly, lx + 2, int(H * 0.50)], fill=(80, 80, 85))
        d.ellipse([lx - 8, ly - 4, lx + 8, ly + 4], fill=(200, 200, 190))

    # Traffic light
    tl_x = int(W * 0.50)
    tl_y = int(H * 0.30)
    d.rectangle([tl_x - 2, tl_y, tl_x + 2, int(H * 0.48)], fill=(70, 70, 75))
    d.rectangle([tl_x - 8, tl_y - 30, tl_x + 8, tl_y], fill=(50, 50, 55))
    d.ellipse([tl_x - 4, tl_y - 28, tl_x + 4, tl_y - 20], fill=(255, 50, 50))
    d.ellipse([tl_x - 4, tl_y - 18, tl_x + 4, tl_y - 10], fill=(80, 80, 40))
    d.ellipse([tl_x - 4, tl_y - 8, tl_x + 4, tl_y], fill=(40, 80, 40))

    return img


# ═══════════════════════════════════════════════════════════════════════════════
# Generate all
# ═══════════════════════════════════════════════════════════════════════════════

scenes = {
    'indoor': make_indoor,
    'outdoor': make_outdoor,
    'golden': make_golden,
    'overcast': make_overcast,
}

for name, fn in scenes.items():
    print(f'Generating {name}...')
    scene = fn()
    scene.save(os.path.join(OUT, f'{name}.jpg'), quality=92)
    print(f'  saved {name}.jpg')

print(f'\nGenerated {len(scenes)} scene images in {OUT}')
