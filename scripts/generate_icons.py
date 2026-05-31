"""Generate DeskCraft icons from Instaldor.png with an HD 'D' letter.

Uses saturation-based flood fill for perfect background removal,
4x supersampling for crisp text, and premultiplied-alpha downscaling.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from collections import deque
import numpy as np
import struct
import io
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_IMG = os.path.join(BASE_DIR, "assets", "img", "Instaldor.png")
ICONS_DIR = os.path.join(BASE_DIR, "src-tauri", "icons")
INSTALLER_DIR = os.path.join(BASE_DIR, "installer")

SS = 4
MASTER_SIZE = 1024
LETTER = "D"


def remove_background(src_path):
    """Remove background using saturation-based BFS from corners."""
    img = Image.open(src_path).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]

    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    max_rgb = np.maximum(r, np.maximum(g, b))
    min_rgb = np.minimum(r, np.minimum(g, b))
    sat = (max_rgb - min_rgb) / (max_rgb + 1e-10)

    visited = np.zeros((h, w), dtype=bool)
    is_bg = np.zeros((h, w), dtype=bool)
    queue = deque()

    for cy, cx in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        for dy in range(10):
            for dx in range(10):
                sy = max(0, min(h - 1, cy + (dy if cy == 0 else -dy)))
                sx = max(0, min(w - 1, cx + (dx if cx == 0 else -dx)))
                if not visited[sy, sx]:
                    queue.append((sy, sx))

    SAT_THRESHOLD = 0.10

    while queue:
        y, x = queue.popleft()
        if visited[y, x]:
            continue
        visited[y, x] = True

        if sat[y, x] < SAT_THRESHOLD:
            is_bg[y, x] = True
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dy == 0 and dx == 0:
                        continue
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                        queue.append((ny, nx))

    arr[is_bg] = [0, 0, 0, 0]

    bg_mask = Image.fromarray((is_bg * 255).astype(np.uint8))
    dilated = bg_mask.filter(ImageFilter.MaxFilter(13))
    edge_zone = (np.array(dilated) > 128) & ~is_bg

    edge_alpha = np.clip((sat - 0.08) / 0.22, 0.0, 1.0)
    arr[edge_zone, 3] = (edge_alpha[edge_zone] * 255).astype(np.uint8)

    fully_transparent = arr[:, :, 3] == 0
    arr[fully_transparent, :3] = 0

    removed = is_bg.sum()
    total = h * w
    print(f"  Background removed: {removed}/{total} pixels ({removed / total * 100:.1f}%)")
    return Image.fromarray(arr)


def _pick_font(size_px):
    """Pick the first available bold font at the requested pixel size."""
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/impact.ttf",
    ]
    for fp in candidates:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size_px), os.path.basename(fp)
            except Exception:
                pass
    raise RuntimeError("No suitable bold font found")


def create_hd_master(src_or_path):
    """Create a high-quality master icon at 4096x4096 with letter + soft shadow.
    Used for sizes >= 64px where supersampled downscale produces best results.
    Accepts either a path (str) or an already-clean RGBA Image.
    """
    render_size = MASTER_SIZE * SS

    if isinstance(src_or_path, str):
        src = remove_background(src_or_path)
    else:
        src = src_or_path
    master = src.resize((render_size, render_size), Image.LANCZOS)

    font_size = int(render_size * 0.52)
    font, font_name = _pick_font(font_size)
    print(f"  Master font: {font_name} at {font_size}px")

    text_layer = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)

    bbox = draw.textbbox((0, 0), LETTER, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (render_size - text_w) / 2 - bbox[0]
    y = (render_size - text_h) / 2 - bbox[1]

    shadow_layer = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_offset = int(render_size * 0.006)
    shadow_draw.text(
        (x + shadow_offset, y + shadow_offset),
        LETTER,
        fill=(0, 0, 0, 60),
        font=font,
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=shadow_offset))

    draw.text((x, y), LETTER, fill=(255, 255, 255, 245), font=font)

    master = Image.alpha_composite(master, shadow_layer)
    master = Image.alpha_composite(master, text_layer)

    return master


def render_small_icon(src_path_or_clean, size):
    """Render a pixel-perfect small icon (<=48px) without the 4096px downscale.
    Uses 2x local supersample, no shadow (shadows turn to mush at small sizes),
    and a slightly larger letter ratio so the "D" stays readable.
    """
    ss = 2
    render_size = size * ss

    if isinstance(src_path_or_clean, str):
        src = remove_background(src_path_or_clean)
    else:
        src = src_path_or_clean

    bg = src.resize((render_size, render_size), Image.LANCZOS)

    letter_ratio = 0.66 if size <= 24 else 0.60
    font_size = int(render_size * letter_ratio)
    font, _ = _pick_font(font_size)

    text_layer = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)
    bbox = draw.textbbox((0, 0), LETTER, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (render_size - tw) / 2 - bbox[0]
    y = (render_size - th) / 2 - bbox[1]
    draw.text((x, y), LETTER, fill=(255, 255, 255, 255), font=font)

    combined = Image.alpha_composite(bg, text_layer)
    return downscale(combined, size)


def downscale(master, size):
    """Downscale with premultiplied alpha for artifact-free resizing."""
    arr = np.array(master).astype(np.float32)
    alpha = arr[:, :, 3:4] / 255.0
    arr[:, :, :3] *= alpha

    premult = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    resized = premult.resize((size, size), Image.LANCZOS)

    out = np.array(resized).astype(np.float32)
    out_alpha = out[:, :, 3:4]
    safe_alpha = np.maximum(out_alpha, 1.0)
    out[:, :, :3] = out[:, :, :3] / safe_alpha * 255.0
    out[:, :, :3] = np.clip(out[:, :, :3], 0, 255)

    threshold = 25 if size <= 48 else (15 if size <= 128 else 8)
    out[out[:, :, 3] < threshold] = [0, 0, 0, 0]

    return Image.fromarray(out.astype(np.uint8))


def create_ico_bmp_entry(img):
    """Create a BMP (DIB) format entry for ICO — maximum Windows compatibility."""
    arr = np.array(img)
    h, w = arr.shape[:2]

    and_row_bytes = ((w + 31) // 32) * 4
    xor_size = w * h * 4
    and_size = and_row_bytes * h

    header = struct.pack(
        "<IiiHHIIiiII",
        40, w, h * 2, 1, 32, 0, xor_size + and_size, 0, 0, 0, 0,
    )

    flipped = arr[::-1]
    bgra = np.stack(
        [flipped[:, :, 2], flipped[:, :, 1], flipped[:, :, 0], flipped[:, :, 3]],
        axis=-1,
    ).astype(np.uint8)

    and_mask = bytes(and_row_bytes * h)
    return header + bgra.tobytes() + and_mask


def create_ico(master, clean_src, output_path):
    """Create a .ico with BMP entries (< 256px) and PNG (>= 256px).
    Small sizes (<=48) are rendered pixel-perfect; large sizes use master downscale.
    """
    sizes = [16, 20, 24, 32, 40, 48, 64, 128, 256]
    entries = []

    for size in sizes:
        if size <= 48:
            img = render_small_icon(clean_src, size)
        else:
            img = downscale(master, size)

        if size >= 256:
            buf = io.BytesIO()
            img.save(buf, format="PNG", optimize=True)
            entries.append((size, buf.getvalue(), True))
        else:
            bmp_data = create_ico_bmp_entry(img)
            entries.append((size, bmp_data, False))

    num = len(entries)
    with open(output_path, "wb") as f:
        f.write(struct.pack("<HHH", 0, 1, num))
        data_offset = 6 + num * 16
        for size, data, _is_png in entries:
            w = 0 if size >= 256 else size
            h = 0 if size >= 256 else size
            f.write(struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(data), data_offset))
            data_offset += len(data)
        for _, data, _ in entries:
            f.write(data)

    print(f"  icon.ico ({len(entries)} sizes: {', '.join(str(s) for s, _, _ in entries)})")


def main():
    print(f"Generating HD DeskCraft icons (letter '{LETTER}')...")
    print(f"  Supersampling: {SS}x ({MASTER_SIZE * SS}x{MASTER_SIZE * SS})")

    clean_src = remove_background(SRC_IMG)
    print(f"  Clean source: {clean_src.size}")

    master = create_hd_master(clean_src)
    print(f"  Master created: {master.size}")

    # --- Tauri icon sizes ---
    tauri_sizes = {
        "icon.png": 1024,
        "512x512.png": 512,
        "256x256.png": 256,
        "128x128@2x.png": 256,
        "128x128.png": 128,
        "64x64.png": 64,
        "48x48.png": 48,
        "32x32.png": 32,
        "16x16.png": 16,
        "Square310x310Logo.png": 310,
        "Square284x284Logo.png": 284,
        "Square150x150Logo.png": 150,
        "Square142x142Logo.png": 142,
        "Square107x107Logo.png": 107,
        "Square89x89Logo.png": 89,
        "Square71x71Logo.png": 71,
        "Square44x44Logo.png": 44,
        "Square30x30Logo.png": 30,
        "StoreLogo.png": 50,
    }

    for filename, size in tauri_sizes.items():
        if size <= 48:
            img = render_small_icon(clean_src, size)
        else:
            img = downscale(master, size)
        path = os.path.join(ICONS_DIR, filename)
        img.save(path, "PNG", optimize=True)
        print(f"  {filename} ({size}x{size})")

    # --- ICO ---
    ico_path = os.path.join(ICONS_DIR, "icon.ico")
    create_ico(master, clean_src, ico_path)

    # --- macOS ---
    icns_img = downscale(master, 1024)
    icns_img.save(os.path.join(ICONS_DIR, "icon.icns"), "PNG", optimize=True)
    print("  icon.icns (1024x1024 PNG)")

    # --- Installer wizard images ---

    wizard_img = Image.new("RGB", (164, 314), (50, 50, 120))
    draw = ImageDraw.Draw(wizard_img)
    for y in range(314):
        t = y / 313
        rv = int(110 * (1 - t) + 25 * t)
        gv = int(60 * (1 - t) + 100 * t)
        bv = int(200 * (1 - t) + 230 * t)
        draw.line([(0, y), (163, y)], fill=(rv, gv, bv))

    icon_wiz = downscale(master, 140)
    icon_wiz_rgb = Image.new("RGB", (140, 140), (80, 80, 180))
    icon_wiz_rgb.paste(icon_wiz, (0, 0), icon_wiz)
    wizard_img.paste(icon_wiz_rgb, (12, 55))
    wizard_img.save(os.path.join(INSTALLER_DIR, "wizard-image.bmp"), "BMP")
    print("  wizard-image.bmp (164x314)")

    icon_small = downscale(master, 55)
    small_rgb = Image.new("RGB", (55, 55), (255, 255, 255))
    small_rgb.paste(icon_small, (0, 0), icon_small)
    small_rgb.save(os.path.join(INSTALLER_DIR, "wizard-small.bmp"), "BMP")
    print("  wizard-small.bmp (55x55)")

    print("\nAll HD DeskCraft icons generated successfully!")


if __name__ == "__main__":
    main()
