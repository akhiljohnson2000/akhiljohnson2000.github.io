#!/usr/bin/env python3
"""
Clean repo root and deploy portfolio build.

- Keeps only: .git, portfolio, .gitignore, deploy_update.py
- Deletes all other files and folders at repo root
- Copies contents of portfolio/dist/ to repo root (for GitHub Pages)

The JavaScript Engine Visualizer lives inside portfolio/javascript-engine-visualizer/ (Vue).
"""

import os
import shutil
from pathlib import Path

# Run from repo root (directory where this script lives)
REPO_ROOT = Path(__file__).resolve().parent

KEEP = {".git", "portfolio", ".gitignore", "deploy_update.py"}
DIST_SOURCE = REPO_ROOT / "portfolio" / "dist"


def main():
    if not DIST_SOURCE.exists():
        print(f"Error: {DIST_SOURCE} not found. Run 'npm run build' inside portfolio/ first.")
        return 1

    # 1. Delete everything at root except KEEP
    for item in REPO_ROOT.iterdir():
        name = item.name
        if name in KEEP:
            continue
        try:
            if item.is_file():
                item.unlink()
                print(f"Deleted file: {name}")
            elif item.is_dir():
                shutil.rmtree(item)
                print(f"Deleted folder: {name}")
        except Exception as e:
            print(f"Error removing {name}: {e}")
            return 1

    # 2. Copy contents of portfolio/dist/ to repo root
    for item in DIST_SOURCE.iterdir():
        dest = REPO_ROOT / item.name
        try:
            if item.is_file():
                shutil.copy2(item, dest)
                print(f"Copied: {item.name}")
            elif item.is_dir():
                if dest.exists():
                    shutil.rmtree(dest)
                shutil.copytree(item, dest)
                print(f"Copied folder: {item.name}")
        except Exception as e:
            print(f"Error copying {item.name}: {e}")
            return 1

    print("Done. Root now has: .git, portfolio, deploy_update.py, .gitignore + dist contents.")
    return 0


if __name__ == "__main__":
    exit(main())
