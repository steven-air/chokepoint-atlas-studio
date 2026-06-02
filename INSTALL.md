# Install Guide

Chokepoint Atlas Studio has no third-party runtime dependencies. Use Python 3.10 or newer.

## Fast Start

```bash
git clone https://github.com/steven-air/chokepoint-atlas-studio.git
cd chokepoint-atlas-studio
python -m pip install -e .
chokepoint-atlas init --kind pack --output my-lane.json
chokepoint-atlas build --input my-lane.json --output out/my-lane
```

Open `out/my-lane/quick_scan.md` first, then review `evidence_memo.md`, `scorecard.json`, and `graph_mermaid.md`.

## Browser Studio

```bash
chokepoint-atlas studio
```

The studio starts at `http://127.0.0.1:8765/`. It lets you paste or load lane JSON and preview:

- Quick Scan
- Evidence Memo
- Scorecard
- Mermaid graph

The web UI supports the same three workflows as the CLI:

- Research Pack
- Lane Compare
- Source Pipeline

## CLI Commands

```bash
chokepoint-atlas init --kind pack --output my-lane.json
chokepoint-atlas init --kind compare --output lanes.json
chokepoint-atlas init --kind sources --output sources.json

chokepoint-atlas build --input my-lane.json --output out/my-lane
chokepoint-atlas compare --input lanes.json --output out/lane-compare
chokepoint-atlas pipeline --input sources.json --output out/source-pipeline
chokepoint-atlas studio --host 127.0.0.1 --port 8765
```

## Codex Skill Install

If you want the skill inside Codex, install from this repository path with your Codex skill installer and restart Codex.

Keep `SKILL.md` frontmatter valid YAML. Quote long fields that contain Chinese, colons, brackets, or markdown.
