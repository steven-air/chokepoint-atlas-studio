from __future__ import annotations

import argparse
import runpy
import shutil
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = REPO_ROOT / "scripts"
EXAMPLES_DIR = REPO_ROOT / "examples"


def run_repo_script(script_name: str, args: list[str]) -> None:
    script_path = SCRIPTS_DIR / script_name
    if not script_path.exists():
        raise FileNotFoundError(f"Missing script: {script_path}")

    old_argv = sys.argv[:]
    old_path = sys.path[:]
    try:
        sys.path.insert(0, str(SCRIPTS_DIR))
        sys.argv = [str(script_path), *args]
        runpy.run_path(str(script_path), run_name="__main__")
    finally:
        sys.argv = old_argv
        sys.path = old_path


def copy_example(kind: str, output: str) -> None:
    examples = {
        "pack": "ai_factory_lane_input.json",
        "compare": "lane_compare_input.json",
        "sources": "source_bundle_input.json",
    }
    source = EXAMPLES_DIR / examples[kind]
    target = Path(output).expanduser().resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    print(f"Copied {kind} example to: {target}")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="chokepoint-atlas",
        description="Build, compare, and review Chokepoint Atlas research packs.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    build = sub.add_parser("build", help="Build one research pack from structured lane JSON.")
    build.add_argument("--input", required=True)
    build.add_argument("--output", required=True)

    compare = sub.add_parser("compare", help="Compare multiple lanes from one JSON file.")
    compare.add_argument("--input", required=True)
    compare.add_argument("--output", required=True)

    pipeline = sub.add_parser("pipeline", help="Run source bundle -> draft -> final pack.")
    pipeline.add_argument("--input", required=True)
    pipeline.add_argument("--output", required=True)

    init = sub.add_parser("init", help="Copy a starter input JSON file.")
    init.add_argument("--kind", choices=["pack", "compare", "sources"], default="pack")
    init.add_argument("--output", default="atlas-input.json")

    studio = sub.add_parser("studio", help="Start the local browser studio.")
    studio.add_argument("--host", default="127.0.0.1")
    studio.add_argument("--port", type=int, default=8765)
    studio.add_argument("--no-open", action="store_true", help="Do not open a browser automatically.")

    args = parser.parse_args(argv)

    if args.command == "build":
        run_repo_script("build_research_pack.py", ["--input", args.input, "--output", args.output])
    elif args.command == "compare":
        run_repo_script("compare_lanes.py", ["--input", args.input, "--output", args.output])
    elif args.command == "pipeline":
        run_repo_script("run_source_pipeline.py", ["--input", args.input, "--output", args.output])
    elif args.command == "init":
        copy_example(args.kind, args.output)
    elif args.command == "studio":
        from chokepoint_atlas.studio import run_studio

        run_studio(host=args.host, port=args.port, open_browser=not args.no_open)


if __name__ == "__main__":
    main()

