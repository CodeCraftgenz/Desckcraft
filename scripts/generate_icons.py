"""
Generate sharp DeskCraft app icons at all required sizes.
Uses the molecular/node motif from the logo with purple-to-pink gradient.
Creates a stylized "D" made of connected nodes on a gradient background.
"""

import math
import struct
from PIL import Image, ImageDraw, ImageFilter

# Icon sizes required by Tauri
SIZES = [16, 32, 48, 64, 128, 256, 512]
SQUARE_SIZES = [30, 44, 71, 89, 107, 142, 150, 284, 310]
ICON_DIR = "src-tauri/icons"


def lerp_color(c1, c2, t):
    """Linear interpolation between two RGB colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def create_gradient_bg(size):
    """Create a rounded-square background with purple-to-pink gradient."""
    # Work at 4x for antialiasing
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Gradient colors matching logo
    top_left = (99, 102, 241)      # indigo-500
    bottom_right = (192, 38, 211)  # fuchsia-600

    # Draw rounded rectangle
    radius = int(s * 0.22)
    # Fill with gradient
    for y in range(s):
        for x in range(s):
            # Diagonal gradient
            t = (x + y) / (2 * s)
            color = lerp_color(top_left, bottom_right, t)
            img.putpixel((x, y), (*color, 255))

    # Create mask for rounded rectangle
    mask = Image.new("L", (s, s), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=255)

    # Apply mask
    img.putalpha(mask)

    # Downscale with high-quality resampling
    img = img.resize((size, size), Image.LANCZOS)
    return img


def draw_d_nodes(img, size):
    """Draw a stylized 'D' made of connected molecular nodes."""
    draw = ImageDraw.Draw(img)

    # Scale factors
    cx = size / 2
    cy = size / 2

    # Padding from edges
    pad = size * 0.2

    # D shape: vertical line on left + arc on right
    # Define node positions for a stylized "D"
    # Left vertical stroke (3 nodes)
    left_x = cx - size * 0.18

    nodes = []

    # Left column - vertical bar of the D
    top_y = pad + size * 0.05
    bot_y = size - pad - size * 0.05
    mid_y = cy

    nodes.append((left_x, top_y))       # 0: top-left
    nodes.append((left_x, mid_y))        # 1: mid-left
    nodes.append((left_x, bot_y))        # 2: bottom-left

    # Right arc of the D (4 nodes)
    arc_cx = cx + size * 0.02
    arc_rx = size * 0.22
    arc_ry = (bot_y - top_y) / 2

    for i, angle in enumerate([-55, -15, 15, 55]):
        rad = math.radians(angle)
        nx = arc_cx + arc_rx * math.cos(rad)
        ny = cy - arc_ry * math.sin(rad)  # negative because Y is down
        nodes.append((nx, ny))  # 3,4,5,6

    # Define connections (edges between nodes)
    connections = [
        (0, 1), (1, 2),        # Left vertical
        (0, 3), (3, 4),        # Top arc
        (4, 5), (5, 6),        # Mid arc
        (6, 2),                # Bottom arc
        (1, 4), (1, 5),        # Cross connections for richness
    ]

    # Draw at 4x then downscale for antialiasing
    s4 = size * 4
    hires = Image.new("RGBA", (s4, s4), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hires)

    # Scale nodes to 4x
    nodes4 = [(x * 4, y * 4) for x, y in nodes]

    # Line width scaled
    line_w = max(int(size * 0.06 * 4), 4)
    node_r_big = max(int(size * 0.065 * 4), 6)
    node_r_small = max(int(size * 0.045 * 4), 4)

    # Draw connections (white lines with slight transparency)
    for a, b in connections:
        hd.line([nodes4[a], nodes4[b]], fill=(255, 255, 255, 220), width=line_w)

    # Draw nodes (white circles)
    for i, (nx, ny) in enumerate(nodes4):
        r = node_r_big if i in (0, 2, 4, 5) else node_r_small
        hd.ellipse(
            [nx - r, ny - r, nx + r, ny + r],
            fill=(255, 255, 255, 255),
        )
        # Inner glow
        ir = max(r - int(size * 0.02 * 4), r // 2)
        hd.ellipse(
            [nx - ir, ny - ir, nx + ir, ny + ir],
            fill=(255, 255, 255, 255),
        )

    # Downscale
    hires = hires.resize((size, size), Image.LANCZOS)

    # Composite onto main image
    img.paste(hires, (0, 0), hires)
    return img


def create_icon(size):
    """Create a complete icon at the given size."""
    img = create_gradient_bg(size)
    img = draw_d_nodes(img, size)
    return img


def create_ico(images, path):
    """Create .ico file from a list of PIL Images (manual binary format)."""
    import io

    entries = []
    for img in images:
        s = img.size[0]
        if s > 256:
            continue
        rgba = img.convert("RGBA")
        buf = io.BytesIO()
        rgba.save(buf, format="PNG")
        png_data = buf.getvalue()
        entries.append((s, s, png_data))

    if not entries:
        return

    num = len(entries)
    header = struct.pack("<HHH", 0, 1, num)
    dir_size = 16 * num
    data_offset = 6 + dir_size

    directory = b""
    image_data = b""

    for w, h, png_data in entries:
        bw = 0 if w >= 256 else w
        bh = 0 if h >= 256 else h
        offset = data_offset + len(image_data)
        entry = struct.pack("<BBBBHHII", bw, bh, 0, 0, 1, 32, len(png_data), offset)
        directory += entry
        image_data += png_data

    with open(path, "wb") as f:
        f.write(header + directory + image_data)


def create_icns(images, path):
    """Create .icns file from images."""
    # Pillow supports ICNS writing
    # Need 16, 32, 128, 256, 512 sizes
    target_sizes = {16, 32, 128, 256, 512}
    icns_images = []
    for img in images:
        if img.size[0] in target_sizes:
            icns_images.append(img.copy())

    if icns_images:
        # Sort by size
        icns_images.sort(key=lambda i: i.size[0])
        # Use the largest as base, append others
        icns_images[-1].save(
            path,
            format="ICNS",
            append_images=icns_images[:-1],
        )


def main():
    import os

    os.makedirs(ICON_DIR, exist_ok=True)

    all_images = {}

    # Generate standard sizes
    for size in SIZES:
        print(f"Generating {size}x{size}...")
        img = create_icon(size)
        all_images[size] = img
        img.save(f"{ICON_DIR}/{size}x{size}.png")

    # Generate 128x128@2x (256px)
    print("Generating 128x128@2x...")
    all_images[256].save(f"{ICON_DIR}/128x128@2x.png")

    # Main icon.png (512)
    print("Generating icon.png (512x512)...")
    if 512 in all_images:
        all_images[512].save(f"{ICON_DIR}/icon.png")
    else:
        icon = create_icon(512)
        icon.save(f"{ICON_DIR}/icon.png")
        all_images[512] = icon

    # Generate Square logos for Windows Store
    for size in SQUARE_SIZES:
        print(f"Generating Square{size}x{size}Logo.png...")
        img = create_icon(size)
        img.save(f"{ICON_DIR}/Square{size}x{size}Logo.png")

    # StoreLogo (50x50)
    print("Generating StoreLogo.png (50x50)...")
    store = create_icon(50)
    store.save(f"{ICON_DIR}/StoreLogo.png")

    # ICO file (Windows)
    print("Generating icon.ico...")
    ico_images = [all_images[s] for s in [16, 32, 48, 64, 128, 256] if s in all_images]
    create_ico(ico_images, f"{ICON_DIR}/icon.ico")

    # ICNS file (macOS)
    print("Generating icon.icns...")
    try:
        icns_images = [all_images[s] for s in [16, 32, 128, 256, 512] if s in all_images]
        create_icns(icns_images, f"{ICON_DIR}/icon.icns")
    except Exception as e:
        print(f"  ICNS generation skipped (not on macOS): {e}")

    print("\nAll icons generated successfully!")


if __name__ == "__main__":
    main()
