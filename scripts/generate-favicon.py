"""Generate multi-size favicon.ico and optimized PNG icons from the Raider mark."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_CANDIDATES = [
    ROOT / "docs/visual-reference/brand-ux-v1/production-candidates/raider-favicon-1.png",
    ROOT / "public/images/raider/favicon-mark.png",
]


def main() -> None:
    src_path = next(p for p in SRC_CANDIDATES if p.exists())
    src = Image.open(src_path).convert("RGBA")
    print(f"source: {src.size} mode={src.mode} from {src_path}")

    def make(size: int) -> Image.Image:
        return src.resize((size, size), Image.Resampling.LANCZOS)

    # Multi-size ICO: embed 16/32/48 explicitly
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_frames = [make(w) for w, _h in ico_sizes]
    app_ico = ROOT / "src/app/favicon.ico"
    public_ico = ROOT / "public/favicon.ico"
    ico_frames[0].save(
        app_ico,
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_frames[1:],
    )
    public_ico.write_bytes(app_ico.read_bytes())
    print(f"wrote {app_ico.relative_to(ROOT)} ({app_ico.stat().st_size} bytes)")
    print(f"wrote {public_ico.relative_to(ROOT)} ({public_ico.stat().st_size} bytes)")

    png32 = ROOT / "public/favicon.png"
    make(32).save(png32, format="PNG", optimize=True)
    print(f"wrote {png32.relative_to(ROOT)} ({png32.stat().st_size} bytes) 32x32")

    for size, name in [(16, "favicon-16x16.png"), (32, "favicon-32x32.png")]:
        p = ROOT / "public" / name
        make(size).save(p, format="PNG", optimize=True)
        print(f"wrote {p.relative_to(ROOT)} ({p.stat().st_size} bytes)")

    apple = ROOT / "public/apple-touch-icon.png"
    make(180).save(apple, format="PNG", optimize=True)
    print(f"wrote {apple.relative_to(ROOT)} ({apple.stat().st_size} bytes) 180x180")

    mark = ROOT / "public/images/raider/favicon-mark.png"
    make(192).save(mark, format="PNG", optimize=True)
    print(f"wrote {mark.relative_to(ROOT)} ({mark.stat().st_size} bytes) 192x192")

    verify = Image.open(app_ico)
    print(f"ico verify: format={verify.format} size={verify.size}")
    n = 0
    try:
        while True:
            verify.seek(n)
            print(f"  frame {n}: {verify.size}")
            n += 1
    except EOFError:
        pass


if __name__ == "__main__":
    main()
