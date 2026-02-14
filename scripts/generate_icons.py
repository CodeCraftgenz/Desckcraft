"""
Generate DeskCraft app icons from the actual logo.png.
Centers the logo on a gradient rounded-square background.
"""

import io
import math
import struct
from PIL import Image, ImageDraw

# Icon sizes required by Tauri
SIZES = [16, 32, 48, 64, 128, 256, 512]
SQUARE_SIZES = [30, 44, 71, 89, 107, 142, 150, 284, 310]
ICON_DIR = "src-tauri/icons"
LOGO_PATH = "Logo_white.png"


def lerp_color(c1, c2, t):
    """Linear interpolation between two RGB colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def create_icon(size):
    """Create a complete icon at the given size using the actual logo."""
    # Work at 4x for antialiasing
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))

    # Gradient colors matching logo
    top_left = (99, 102, 241)      # indigo-500
    bottom_right = (192, 38, 211)  # fuchsia-600

    # Draw gradient background
    for y in range(s):
        for x in range(s):
            t = (x + y) / (2 * s)
            color = lerp_color(top_left, bottom_right, t)
            img.putpixel((x, y), (*color, 255))

    # Rounded rectangle mask
    radius = int(s * 0.22)
    mask = Image.new("L", (s, s), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=255)
    img.putalpha(mask)

    # Load and overlay the actual logo
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo_w, logo_h = logo.size
        aspect = logo_w / logo_h

        # Fit the logo inside the icon with padding
        padding = int(s * 0.12)
        available = s - (padding * 2)

        if aspect > 1:
            # Wide logo: fit to width
            new_w = available
            new_h = int(new_w / aspect)
        else:
            # Tall logo: fit to height
            new_h = available
            new_w = int(new_h * aspect)

        logo_resized = logo.resize((new_w, new_h), Image.LANCZOS)

        # Center the logo
        x_off = (s - new_w) // 2
        y_off = (s - new_h) // 2

        # Composite logo onto gradient
        temp = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        temp.paste(logo_resized, (x_off, y_off), logo_resized)

        img = Image.alpha_composite(img, temp)

        # Re-apply the rounded mask
        r, g, b, a = img.split()
        mask_img = Image.new("L", (s, s), 0)
        mask_draw2 = ImageDraw.Draw(mask_img)
        mask_draw2.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=255)
        img.putalpha(mask_img)

    except FileNotFoundError:
        print(f"  Warning: {LOGO_PATH} not found, using plain gradient")

    # Downscale with high-quality resampling
    img = img.resize((size, size), Image.LANCZOS)
    return img


def create_ico(images, path):
    """Create .ico file from a list of PIL Images (manual binary format)."""
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
    target_sizes = {16, 32, 128, 256, 512}
    icns_images = []
    for img in images:
        if img.size[0] in target_sizes:
            icns_images.append(img.copy())

    if icns_images:
        icns_images.sort(key=lambda i: i.size[0])
        try:
            icns_images[-1].save(
                path,
                format="ICNS",
                append_images=icns_images[:-1],
            )
        except Exception as e:
            print(f"  ICNS generation skipped: {e}")


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
    all_images[512].save(f"{ICON_DIR}/icon.png")

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
    icns_images = [all_images[s] for s in [16, 32, 128, 256, 512] if s in all_images]
    create_icns(icns_images, f"{ICON_DIR}/icon.icns")

    print("\nAll icons generated successfully!")


if __name__ == "__main__":
    main()
