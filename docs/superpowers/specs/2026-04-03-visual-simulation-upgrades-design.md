# Visual Simulation Upgrades

## Overview

Upgrade 5 tools with Canvas/WebGL-powered visual simulations. Each tool adopts the FOV Viewer's sidebar+canvas layout pattern: controls and numeric results in a 280px left sidebar, visual simulation in the main canvas area.

All client-side only. No backend.

## Tools

### 1. DoF Calculator → Bokeh Simulator

**Layout:** Sidebar (controls + 4 result cards) | Canvas (scene with depth-based blur)

**Sidebar controls:** Focal length dropdown, aperture dropdown, subject distance slider (log scale), sensor dropdown.

**Sidebar results:** Near focus, far focus, total DoF, hyperfocal distance — in a 2×2 grid of compact result cards.

**Canvas:** Reference scene rendered on Canvas. A depth map drives per-pixel blur intensity — pixels at the focus distance are sharp, pixels further from the focus plane get progressively blurred. Depth scale bar at the bottom shows the in-focus range (green) vs blurred zones (red).

**Topbar:** Scene preset buttons (Portrait, Landscape, Street, Macro) — each loads a different reference image + depth map.

**Tech:** Canvas 2D with a multi-pass blur approach. For each pixel, blur radius = function of (pixel depth - focus distance) / DoF range. Use a box blur approximation at varying radii for performance. Depth maps are pre-authored grayscale images matching each scene.

**Mobile:** Sidebar collapses below the canvas (same as FOV Viewer mobile pattern).

### 2. Exposure Simulator → Real-Time Image Preview

**Layout:** Sidebar (lock buttons + 3 sliders + EV result + effect bars) | Canvas (exposure-modified scene)

**Sidebar controls:** Lock toggle buttons (Aperture/Shutter/ISO), three sliders with current values, EV result card, effect indicator bars (DoF, Motion, Noise).

**Canvas:** Reference photo modified in real-time. Three shader effects:
- **Brightness:** Linear brightness adjustment based on EV delta from scene's reference EV. Highlights clip to white, shadows crush to black.
- **Noise:** Procedural grain overlay scaled to ISO value. No noise at ISO 100, heavy grain at ISO 25600.
- **Motion blur:** Directional blur applied when shutter speed is slow (below 1/30). Blur amount proportional to shutter duration.

**Topbar:** Scene presets (Daylight EV 15, Golden Hour EV 12, Indoor EV 7, Night EV 3) — each sets a reference EV so the same camera settings produce different exposure results.

**Canvas overlays:** Settings badge (top-right: "f/5.6 · 1/125 · ISO 100"), exposure meter bar (bottom-center: ±3 stops scale with indicator).

**Tech:** Canvas 2D with ImageData manipulation. Brightness = pixel × 2^(evDelta). Noise = additive random per-pixel scaled by ISO. Motion blur = horizontal box blur at slow shutter speeds.

**Mobile:** Same collapse pattern.

### 3. Diffraction Limit → Sharpness Preview

**Layout:** Sidebar (sensor/resolution selects + results) | Canvas (split-view sharpness comparison)

**Sidebar controls:** Sensor dropdown, resolution (MP) input, aperture slider.

**Sidebar results:** Pixel pitch, diffraction-limited aperture, current Airy disk diameter, sharpness ratio.

**Canvas:** Split-view with a draggable divider. Left side: detail crop at the optimal aperture (sharp). Right side: same crop blurred by the diffraction amount at the selected aperture. Labels above each side ("f/5.6 — Optimal" vs "f/22 — Diffracted"). The blur amount is physically derived: gaussian blur radius = (Airy disk diameter - pixel pitch) when Airy > pixel pitch.

**Topbar:** Detail crop presets (Text, Foliage, Architecture, Fabric) — different test patterns that show diffraction effects differently.

**Tech:** Canvas 2D. Load a detail crop image, apply gaussian blur to the right half. Blur radius derived from diffraction math. Divider is a draggable vertical line.

**Mobile:** Stacks vertically — top/bottom split instead of left/right, sidebar below.

### 4. Star Trail Calculator → Animated Sky Preview

**Layout:** Sidebar (controls + results for both modes) | Canvas (animated star field)

**Sidebar controls:** Mode toggle (Sharp Stars / Star Trails), focal length, sensor, resolution, aperture (for NPF), latitude slider. In trail mode: exposure per frame, number of frames, gap.

**Sidebar results:** Sharp mode: max exposure (500 rule), max exposure (NPF rule). Trail mode: total shooting time, total arc degrees.

**Canvas:** Dark background with procedural star field. Stars are placed randomly with varying brightness. All stars rotate around Polaris (position determined by latitude).
- **Sharp Stars mode:** Stars rendered as points. An "exposure preview" ring shows how much a star would trail at the current exposure time — if within the limit, ring is green; if exceeding, ring turns red with a visible streak.
- **Star Trails mode:** Stars rendered as circular arcs. Arc length = (exposure × frames) in angular terms. Animation plays the trail building up over time, then loops.

**Topbar:** Latitude presets (Equator 0°, Mid-latitude 45°, Arctic 70°) — changes the pole star position and arc curvature.

**Tech:** Canvas 2D. Stars placed once with seeded random. Rotation is simple trigonometry around pole point. Arc rendering via ctx.arc(). Animate with requestAnimationFrame.

**Mobile:** Same collapse pattern.

### 5. Sensor Size → Pixel Density Visualization

**Layout:** Keep existing sidebar+canvas structure, add a new visualization mode.

**New mode:** "Pixel Density" added to existing Overlay/Side-by-Side toggle. Shows a zoomed-in view of each selected sensor's pixel grid at actual relative scale. Larger pixels (full frame 50MP) vs smaller pixels (APS-C 24MP) are immediately visible.

**Canvas enhancement:** In pixel density mode, render a grid for each sensor where cell size = pixel pitch at a normalized scale. Color-code by sensor. Show pixel pitch value labels.

**Tech:** Canvas 2D (already in use). New rendering path in the existing draw function.

**Mobile:** No change needed — existing mobile layout works.

## Shared Patterns

**Layout CSS:** Each upgraded tool gets its own CSS module with the FOV Viewer sidebar+canvas pattern:
- `.layout` — flex row, `height: calc(100vh - 44px)` (minus nav)
- `.sidebar` — 280px fixed, border-right, overflow-y auto, padding 16px
- `.canvasArea` — flex 1, flex column
- `.canvasTopbar` — flex row, centered, border-bottom
- `.canvasMain` — flex 1, centered, padding 24px

**Page changes:** Each tool's `page.tsx` stops using `ToolPageShell` and renders the component directly (like FOV Viewer does). The tool name/description moves into the sidebar header.

**Mobile breakpoint:** 1023px. Sidebar collapses below canvas. Same pattern as FOV Viewer.

**Scene/preset assets:** Stored in `public/scenes/[tool-name]/`. Depth maps are grayscale PNGs. Reference images are JPEGs.

**No external dependencies.** All rendering via Canvas 2D API. No WebGL libraries, no Three.js.

## Asset Requirements

Each tool needs pre-authored reference images:
- **DoF:** 4 scenes (portrait, landscape, street, macro) + matching depth maps — can be simple gradient-based depth maps initially
- **Exposure:** 4 scenes at different base EVs — daylight, golden hour, indoor, night
- **Diffraction:** 4 detail crops — text, foliage, architecture, fabric
- **Star Trails:** No assets needed (procedural)
- **Sensor Size:** No assets needed (procedural grid)

For initial implementation, use **procedurally generated scenes** instead of real photos. This avoids copyright issues and asset pipeline complexity. Scenes can be replaced with real photography later.

## Out of Scope

- WebGL shaders (Canvas 2D is sufficient for these effects)
- Real photo assets (procedural first, real photos later)
- Backend / API
- New math modules (reuse existing `lib/math/` functions)
- Tests for canvas rendering (test the math, not the pixels)
