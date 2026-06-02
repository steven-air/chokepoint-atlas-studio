# Optimization Review

This repository started as a useful research skill plus standalone Python scripts. The main opportunity is not the core scoring logic; it is packaging the workflow so a user can get from "I have a lane idea" to "I have a reusable research pack" without reading the source tree.

## Current Friction

- Installation was skill-installer-first, which is natural for Codex users but unclear for normal Python users.
- There was no package metadata, so users could not run a stable command like `chokepoint-atlas build`.
- The three script entry points were discoverable only by reading README examples.
- The project had no local UI, even though the output is visual and review-oriented.
- Output artifacts are useful, but users need a faster way to preview quick scan, scorecard, and graph before committing a lane.
- Chinese text must be handled carefully on Windows. Keep files UTF-8 and quote YAML frontmatter fields.

## Implemented In This Fork

- Added `pyproject.toml` for editable install with no third-party dependencies.
- Added console commands: `chokepoint-atlas` and `atlas`.
- Added unified subcommands: `init`, `build`, `compare`, `pipeline`, and `studio`.
- Added a no-build browser Studio backed by Python stdlib HTTP server.
- The Studio supports the same product workflows as the CLI: single research pack, lane compare, and source pipeline.
- Added `INSTALL.md` with normal Python usage, Studio usage, and Codex skill notes.
- Preserved the original scripts and skill behavior to reduce regression risk.

## Next Product Improvements

- Add a schema command: `chokepoint-atlas schema --kind pack` so users can validate inputs before running a pack.
- Add an export bundle command that writes one HTML report containing the quick scan, memo, scorecard, and Mermaid graph.
- Add source credibility fields and a freshness score to evidence.
- Add watchlist mode for catalysts with due dates and status.
- Add a guided lane wizard in Studio instead of requiring raw JSON editing.
- Add tests for CLI wrappers and Studio API responses.
- Add screenshots/GIFs showing the Studio workflow.

## Interface Direction

The ideal UI is an analyst workbench, not a marketing landing page:

- Left side: structured lane editor and source bundle input.
- Right side: live outputs and validation.
- Top controls: build, compare, export, load sample.
- Tabs: Quick Scan, Evidence Memo, Scorecard, Graph, Validation.
- Keep the palette neutral and dense. This is a repeated-use research tool.
