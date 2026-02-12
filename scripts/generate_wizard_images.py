"""
Generate Inno Setup wizard images from the app icon.
- wizard-image.bmp: 164x314 (left panel of installer wizard)
- wizard-small.bmp: 55x55 (top-right corner of wizard)
"""

from PIL import Image, ImageDraw
import os


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def create_wizard_image():
    """Create the large wizard image (164x314) for the left panel."""
    w, h = 164, 314
    img = Image.new("RGB", (w, h))

    # Gradient background matching brand
    top_color = (99, 102, 241)     # indigo-500
    bot_color = (147, 51, 234)     # purple-600

    for y in range(h):
        t = y / h
        color = lerp_color(top_color, bot_color, t)
        for x in range(w):
            img.putpixel((x, y), color)

    # Load and overlay the icon centered
    icon_path = os.path.join("src-tauri", "icons", "128x128.png")
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        icon_size = 100
        icon = icon.resize((icon_size, icon_size), Image.LANCZOS)

        # Position: centered horizontally, upper third vertically
        x_off = (w - icon_size) // 2
        y_off = 80

        # Paste with alpha
        temp = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        temp.paste(icon, (x_off, y_off), icon)

        # Convert main to RGBA, composite, convert back
        img = Image.alpha_composite(img.convert("RGBA"), temp).convert("RGB")

    return img


def create_wizard_small():
    """Create the small wizard image (55x55) for the top-right corner."""
    size = 55

    # Load icon and resize
    icon_path = os.path.join("src-tauri", "icons", "64x64.png")
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        icon = icon.resize((size, size), Image.LANCZOS)

        # Create white background
        bg = Image.new("RGB", (size, size), (255, 255, 255))
        bg.paste(icon, (0, 0), icon)
        return bg
    else:
        # Fallback: gradient square
        img = Image.new("RGB", (size, size), (99, 102, 241))
        return img


def main():
    os.makedirs("installer", exist_ok=True)

    print("Generating wizard-image.bmp (164x314)...")
    wizard = create_wizard_image()
    wizard.save(os.path.join("installer", "wizard-image.bmp"), "BMP")

    print("Generating wizard-small.bmp (55x55)...")
    small = create_wizard_small()
    small.save(os.path.join("installer", "wizard-small.bmp"), "BMP")

    print("Done!")


if __name__ == "__main__":
    main()
