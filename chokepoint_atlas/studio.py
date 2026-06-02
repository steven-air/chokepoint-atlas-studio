from __future__ import annotations

import json
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = REPO_ROOT / "web"
SCRIPTS_DIR = REPO_ROOT / "scripts"
EXAMPLE_PATH = REPO_ROOT / "examples" / "ai_factory_lane_input.json"
EXAMPLES = {
    "pack": REPO_ROOT / "examples" / "ai_factory_lane_input.json",
    "compare": REPO_ROOT / "examples" / "lane_compare_input.json",
    "sources": REPO_ROOT / "examples" / "source_bundle_input.json",
}


def build_pack_payload(data: dict) -> dict:
    old_path = sys.path[:]
    try:
        sys.path.insert(0, str(SCRIPTS_DIR))
        from build_research_pack import (
            build_research_pack,
            render_catalyst_watch,
            render_evidence_memo,
            render_mermaid_markdown,
            render_quick_scan,
        )

        bundle = build_research_pack(data)
        return {
            "ok": True,
            "mode": "pack",
            "validation": bundle["validation"],
            "research_pack": bundle["research_pack"],
            "scorecard": bundle["scorecard"],
            "graph": bundle["graph"],
            "quick_scan": render_quick_scan(data, bundle["evidence"], bundle["lane_scores"]),
            "evidence_memo": render_evidence_memo(
                data,
                bundle["evidence"],
                bundle["lane_scores"],
                bundle["top_companies"],
            ),
            "catalyst_watch": render_catalyst_watch(data, bundle["top_companies"]),
            "graph_mermaid": render_mermaid_markdown(bundle["mermaid"], data["meta"]["title"]),
        }
    finally:
        sys.path = old_path


def compare_payload(data: dict) -> dict:
    old_path = sys.path[:]
    try:
        sys.path.insert(0, str(SCRIPTS_DIR))
        from build_research_pack import build_research_pack, lane_priority
        from compare_lanes import render_lane_compare_memo, render_ranked_lane_table

        lanes = data.get("lanes")
        if not isinstance(lanes, list) or not lanes:
            raise ValueError("Input must contain a non-empty top-level `lanes` array.")

        rows = []
        details = []
        for lane in lanes:
            bundle = build_research_pack(lane)
            strongest = bundle["evidence"][0]["summary"] if bundle["evidence"] else "No evidence"
            row = {
                "pack_id": lane["meta"]["pack_id"],
                "title": lane["meta"]["title"],
                "lane": lane["thesis"]["lane"],
                "end_system": lane["thesis"]["end_system"],
                "bottleneck_call": lane["thesis"]["bottleneck_call"],
                "lane_score": bundle["lane_scores"],
                "priority": lane_priority(bundle["lane_scores"]["total_average"]),
                "strongest_evidence": strongest,
                "top_names": [name["ticker"] for name in bundle["top_companies"]],
            }
            rows.append(row)
            details.append({"pack_id": lane["meta"]["pack_id"], "top_names": bundle["top_companies"]})

        rows.sort(key=lambda item: item["lane_score"]["total_average"], reverse=True)
        return {
            "ok": True,
            "mode": "compare",
            "lane_ranking": {"lanes": rows},
            "lane_details": {"lanes": details},
            "ranked_lane_table": render_ranked_lane_table(rows),
            "lane_compare_memo": render_lane_compare_memo(rows),
        }
    finally:
        sys.path = old_path


def pipeline_payload(data: dict) -> dict:
    old_path = sys.path[:]
    try:
        sys.path.insert(0, str(SCRIPTS_DIR))
        from build_research_pack import (
            build_research_pack,
            render_catalyst_watch,
            render_evidence_memo,
            render_mermaid_markdown,
            render_quick_scan,
        )
        from extract_sources_to_pack import build_draft_pack

        draft_pack, extraction_report = build_draft_pack(data)
        bundle = build_research_pack(draft_pack)
        return {
            "ok": True,
            "mode": "pipeline",
            "draft_pack_input": draft_pack,
            "extraction_report": extraction_report,
            "validation": bundle["validation"],
            "research_pack": bundle["research_pack"],
            "scorecard": bundle["scorecard"],
            "graph": bundle["graph"],
            "quick_scan": render_quick_scan(draft_pack, bundle["evidence"], bundle["lane_scores"]),
            "evidence_memo": render_evidence_memo(
                draft_pack,
                bundle["evidence"],
                bundle["lane_scores"],
                bundle["top_companies"],
            ),
            "catalyst_watch": render_catalyst_watch(draft_pack, bundle["top_companies"]),
            "graph_mermaid": render_mermaid_markdown(bundle["mermaid"], draft_pack["meta"]["title"]),
        }
    finally:
        sys.path = old_path


def handle_payload(mode: str, data: dict) -> dict:
    if mode == "pack":
        return build_pack_payload(data)
    if mode == "compare":
        return compare_payload(data)
    if mode == "pipeline":
        return pipeline_payload(data)
    raise ValueError("Mode must be one of: pack, compare, pipeline")


class StudioHandler(BaseHTTPRequestHandler):
    server_version = "ChokepointAtlasStudio/0.2"

    def log_message(self, format: str, *args: object) -> None:
        return

    def send_bytes(self, status: int, content: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def send_json(self, status: int, payload: dict) -> None:
        self.send_bytes(status, json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/sample":
            kind = parse_qs(parsed.query).get("kind", ["pack"])[0]
            sample_path = EXAMPLES.get(kind, EXAMPLE_PATH)
            self.send_json(200, json.loads(sample_path.read_text(encoding="utf-8")))
            return

        if path in ("", "/"):
            file_path = WEB_DIR / "index.html"
        else:
            file_path = WEB_DIR / path.lstrip("/")

        if not file_path.resolve().is_relative_to(WEB_DIR.resolve()) or not file_path.exists():
            self.send_json(404, {"ok": False, "error": "Not found"})
            return

        content_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
        }
        self.send_bytes(200, file_path.read_bytes(), content_types.get(file_path.suffix, "application/octet-stream"))

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/build":
            self.send_json(404, {"ok": False, "error": "Not found"})
            return

        try:
            mode = parse_qs(parsed.query).get("mode", ["pack"])[0]
            length = int(self.headers.get("Content-Length", "0"))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            self.send_json(200, handle_payload(mode, data))
        except Exception as exc:
            self.send_json(400, {"ok": False, "error": str(exc)})


def run_studio(host: str = "127.0.0.1", port: int = 8765, open_browser: bool = True) -> None:
    server = ThreadingHTTPServer((host, port), StudioHandler)
    url = f"http://{host}:{port}/"
    print(f"Chokepoint Atlas Studio running at {url}")
    if open_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStudio stopped.")
