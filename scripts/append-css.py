from pathlib import Path

root = Path(__file__).resolve().parent.parent
block = (root / "scripts" / "new-components.css").read_text(encoding="utf-8")
marker = "SHALOM EMBASSY — 17 YEARS / STORIES / GALLERY / FOLLOW"

for name in ("assets/css/styles.css", "assets/css/styles.min.css"):
    path = root / name
    text = path.read_text(encoding="utf-8")
    if marker in text:
        text = text.split(marker)[0].rstrip() + "\n\n"
        # Remove the opening comment line left behind.
        text = text.rsplit("/* =========================================================", 1)[0].rstrip() + "\n\n"
    path.write_text(text.rstrip() + "\n\n" + block, encoding="utf-8")
    print(name, path.stat().st_size, "bytes")
