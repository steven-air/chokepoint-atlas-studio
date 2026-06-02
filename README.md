# Chokepoint Atlas Studio

Chokepoint Atlas Studio is a fork of Chokepoint Atlas with two practical entry points:

- a Python CLI for repeatable research-pack generation
- a local browser Studio for reviewing lane JSON, scorecards, memos, and graphs

The core idea is unchanged: turn a broad AI infrastructure narrative into a supply-chain map, identify the real bottleneck, cross-check evidence, then rank the lane and candidate names.

## What It Helps With

- AI optical interconnect
- semiconductor packaging and test
- datacenter power and cooling
- robotics supply chains
- AI factory infrastructure
- any lane where physical constraints matter more than ticker hype

It is not meant for instant stock picking. The workflow builds the thesis first, then names.

## Install

Use Python 3.10 or newer.

```bash
git clone https://github.com/steven-air/chokepoint-atlas-studio.git
cd chokepoint-atlas-studio
python -m pip install -e .
```

No third-party runtime dependencies are required.

## CLI

Create a starter lane file:

```bash
chokepoint-atlas init --kind pack --output my-lane.json
```

Build a research pack:

```bash
chokepoint-atlas build --input my-lane.json --output out/my-lane
```

Compare multiple lanes:

```bash
chokepoint-atlas init --kind compare --output lanes.json
chokepoint-atlas compare --input lanes.json --output out/lane-compare
```

Run the source-bundle pipeline:

```bash
chokepoint-atlas init --kind sources --output sources.json
chokepoint-atlas pipeline --input sources.json --output out/source-pipeline
```

Generated outputs include quick scans, evidence memos, scorecards, graph JSON, Mermaid graphs, validation reports, and catalyst watch notes.

## Web Studio

Start the local browser UI:

```bash
chokepoint-atlas studio
```

Open:

```text
http://127.0.0.1:8765/
```

The Studio supports:

- Research Pack
- Lane Compare
- Source Pipeline

It loads samples, accepts pasted JSON, and previews the output without needing a build step or frontend dependencies.

## Original Skill

The original Codex skill remains in [SKILL.md](./SKILL.md). Reference materials are under [references](./references), examples are under [examples](./examples), and product docs are under [docs](./docs).

## Optimization Notes

See [docs/OPTIMIZATION_REVIEW.md](./docs/OPTIMIZATION_REVIEW.md) for the fork plan, current friction points, and next product improvements.
