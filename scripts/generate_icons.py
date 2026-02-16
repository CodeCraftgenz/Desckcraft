"""
Gera o icone do DeskCraft em alta definicao.
Estilo igual ao CodeGymCraft: fundo solido, sombra, supersampling 2048px.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import struct, io, os

SUPERSAMPLE = 2048
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_master():
    s = SUPERSAMPLE
    # Light gray solid background (no transparency)
    img = Image.new("RGBA", (s, s), (240, 240, 245, 255))
    draw = ImageDraw.Draw(img)

    margin = int(s * 0.04)
    radius = int(s * 0.22)

    # --- Drop shadow behind the rounded rect ---
    shadow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    off = int(s * 0.015)
    sd.rounded_rectangle(
        [(margin + off, margin + off), (s - margin + off, s - margin + off)],
        radius=radius, fill=(0, 0, 0, 50),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(s * 0.025)))
    img = Image.alpha_composite(img, shadow)

    # --- Gradient rounded rect (purple top -> blue bottom) ---
    rect_mask = Image.new("L", (s, s), 0)
    rm = ImageDraw.Draw(rect_mask)
    rm.rounded_rectangle(
        [(margin, margin), (s - margin - 1, s - margin - 1)],
        radius=radius, fill=255,
    )

    gradient = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    for y in range(s):
        ratio = y / s
        r = int(150 * (1 - ratio) + 0 * ratio)
        g = int(50 * (1 - ratio) + 120 * ratio)
        b = int(200 * (1 - ratio) + 255 * ratio)
        for x in range(s):
            if rect_mask.getpixel((x, y)) > 0:
                gradient.putpixel((x, y), (r, g, b, 255))

    img = Image.alpha_composite(img, gradient)
    draw = ImageDraw.Draw(img)

    # --- Constellation lines ---
    def star_px(sx, sy):
        return (int(margin + sx * (s - 2 * margin)), int(margin + sy * (s - 2 * margin)))

    line_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ld = ImageDraw.Draw(line_layer)
    lw = max(2, int(s * 0.002))

    top_c = [(0.62, 0.12), (0.70, 0.08), (0.78, 0.14), (0.82, 0.06), (0.88, 0.18), (0.75, 0.22)]
    for i in range(len(top_c) - 1):
        ld.line([star_px(*top_c[i]), star_px(*top_c[i + 1])], fill=(255, 255, 255, 40), width=lw)

    bot_c = [(0.08, 0.58), (0.18, 0.52), (0.25, 0.62), (0.22, 0.68), (0.15, 0.70), (0.28, 0.78)]
    for i in range(len(bot_c) - 1):
        ld.line([star_px(*bot_c[i]), star_px(*bot_c[i + 1])], fill=(255, 255, 255, 40), width=lw)

    img = Image.alpha_composite(img, line_layer)
    draw = ImageDraw.Draw(img)

    # --- Stars with glow ---
    stars = [
        (0.62, 0.12, 3), (0.70, 0.08, 2), (0.78, 0.14, 3),
        (0.82, 0.06, 2), (0.88, 0.18, 2), (0.75, 0.22, 2),
        (0.08, 0.58, 2), (0.18, 0.52, 3), (0.25, 0.62, 3),
        (0.15, 0.70, 2), (0.28, 0.78, 2), (0.22, 0.68, 2),
        (0.45, 0.35, 1), (0.55, 0.65, 1), (0.35, 0.85, 1),
        (0.90, 0.45, 1), (0.05, 0.40, 1),
    ]
    for sx, sy, size in stars:
        px, py = star_px(sx, sy)
        r = int(s * 0.003 * size)
        glow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse([(px - r * 3, py - r * 3), (px + r * 3, py + r * 3)], fill=(255, 255, 255, 30))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=r * 2))
        img = Image.alpha_composite(img, glow)
        draw = ImageDraw.Draw(img)
        draw.ellipse([(px - r, py - r), (px + r, py + r)], fill=(255, 255, 255, 220))

    # --- Letter D ---
    font_size = int(s * 0.48)
    font = None
    for fp in ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arialbd.ttf"]:
        if os.path.exists(fp):
            font = ImageFont.truetype(fp, font_size)
            break
    if font is None:
        font = ImageFont.load_default()

    text = "D"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (s - tw) // 2 - bbox[0]
    ty = (s - th) // 2 - bbox[1] - int(s * 0.02)

    # Shadow
    shadow_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sd2 = ImageDraw.Draw(shadow_layer)
    sd2.text((tx + 6, ty + 8), text, fill=(0, 0, 0, 70), font=font)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=10))
    img = Image.alpha_composite(img, shadow_layer)
    draw = ImageDraw.Draw(img)

    # White D
    draw.text((tx, ty), text, fill=(255, 255, 255, 255), font=font)

    return img


def build_ico(images_dict, output_path):
    entries = []
    data_blocks = []
    offset = 6 + 16 * len(images_dict)
    for size in sorted(images_dict.keys()):
        im = images_dict[size].convert("RGBA")
        buf = io.BytesIO()
        im.save(buf, format="PNG", optimize=True)
        png_data = buf.getvalue()
        w = 0 if size >= 256 else size
        h = 0 if size >= 256 else size
        entries.append(struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(png_data), offset))
        data_blocks.append(png_data)
        offset += len(png_data)

    with open(output_path, "wb") as f:
        f.write(struct.pack("<HHH", 0, 1, len(images_dict)))
        for e in entries:
            f.write(e)
        for d in data_blocks:
            f.write(d)


# === MAIN ===
if __name__ == "__main__":
    print("Generating master 2048x2048...")
    master = create_master()

    # Reference PNGs
    for sz in [256, 512, 1024]:
        master.resize((sz, sz), Image.LANCZOS).save(os.path.join(ROOT, f"icon_bg_{sz}.png"), optimize=True)
    print("Saved icon_bg_*.png")

    # Tauri icons
    icons_dir = os.path.join(ROOT, "src-tauri", "icons")
    for sz in [16, 32, 48, 64, 128, 256, 512]:
        resized = master.resize((sz, sz), Image.LANCZOS)
        if sz <= 48:
            resized = resized.filter(ImageFilter.SHARPEN)
        resized.save(os.path.join(icons_dir, f"{sz}x{sz}.png"), optimize=True)
        print(f"  {sz}x{sz}.png")

    master.resize((1024, 1024), Image.LANCZOS).save(os.path.join(icons_dir, "icon.png"), optimize=True)
    print("  icon.png (1024)")
    master.resize((256, 256), Image.LANCZOS).save(os.path.join(icons_dir, "128x128@2x.png"), optimize=True)

    store = {
        "Square30x30Logo": 30, "Square44x44Logo": 44, "Square71x71Logo": 71,
        "Square89x89Logo": 89, "Square107x107Logo": 107, "Square142x142Logo": 142,
        "Square150x150Logo": 150, "Square284x284Logo": 284, "Square310x310Logo": 310,
        "StoreLogo": 50,
    }
    for name, sz in store.items():
        resized = master.resize((sz, sz), Image.LANCZOS)
        if sz <= 50:
            resized = resized.filter(ImageFilter.SHARPEN)
        resized.save(os.path.join(icons_dir, f"{name}.png"), optimize=True)
        print(f"  {name}.png ({sz})")

    # ICO
    ico_sizes = [16, 20, 24, 32, 40, 48, 64, 128, 256]
    images_dict = {}
    for sz in ico_sizes:
        resized = master.resize((sz, sz), Image.LANCZOS)
        if sz <= 48:
            resized = resized.filter(ImageFilter.SHARPEN)
        images_dict[sz] = resized

    ico_path = os.path.join(icons_dir, "icon.ico")
    build_ico(images_dict, ico_path)
    print(f"  icon.ico ({os.path.getsize(ico_path):,} bytes, {len(ico_sizes)} sizes)")

    # Frontend logo
    master.resize((512, 512), Image.LANCZOS).save(os.path.join(ROOT, "src", "assets", "logo.png"), optimize=True)
    print("  src/assets/logo.png")

    # Wizard images
    inst_dir = os.path.join(ROOT, "installer")
    wiz = Image.new("RGB", (164, 314), (255, 255, 255))
    icon_120 = master.resize((120, 120), Image.LANCZOS).convert("RGBA")
    bg_paste = Image.new("RGB", (120, 120), (255, 255, 255))
    bg_paste.paste(icon_120, (0, 0), icon_120)
    wiz.paste(bg_paste, (22, 40))
    wd = ImageDraw.Draw(wiz)
    ft = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 18)
    bb = wd.textbbox((0, 0), "DeskCraft", font=ft)
    wd.text(((164 - bb[2] + bb[0]) // 2, 170), "DeskCraft", fill=(80, 50, 150), font=ft)
    fv = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 12)
    bb2 = wd.textbbox((0, 0), "v1.0.0", font=fv)
    wd.text(((164 - bb2[2] + bb2[0]) // 2, 195), "v1.0.0", fill=(120, 120, 140), font=fv)
    for y in range(250, 314):
        ratio = (y - 250) / 64
        r = int(130 * (1 - ratio))
        g = int(60 * (1 - ratio) + 100 * ratio)
        b = int(220 * (1 - ratio) + 255 * ratio)
        for x in range(164):
            wiz.putpixel((x, y), (r, g, b))
    wiz.save(os.path.join(inst_dir, "wizard-image.bmp"), "BMP")
    print("  wizard-image.bmp")

    small = master.resize((55, 55), Image.LANCZOS).convert("RGBA")
    bg_s = Image.new("RGB", (55, 55), (255, 255, 255))
    bg_s.paste(small, (0, 0), small)
    bg_s.save(os.path.join(inst_dir, "wizard-small.bmp"), "BMP")
    print("  wizard-small.bmp")

    print("\nDone!")
