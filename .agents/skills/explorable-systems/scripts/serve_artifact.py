#!/usr/bin/env python3
"""Local loopback HTTP server for a single HTML artifact with durable state saving."""

import argparse
import fcntl
import hashlib
import html
import http.server
import json
import math
import os
import re
import sys
import tempfile
import threading
from urllib.parse import urlparse

MARKER_START = "<!-- ARTIFACT-STATE-START -->"
MARKER_END = "<!-- ARTIFACT-STATE-END -->"
MAX_BODY_SIZE, MAX_STRING_LEN = 1_000_000, 100_000
STATE_REGION_RE = re.compile(
    re.escape(MARKER_START) + r"(.*?)" + re.escape(MARKER_END), re.DOTALL
)
SCRIPT_RE = re.compile(
    r'<script\s+id=["\']artifact-state["\']\s+type=["\']application/json["\']>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)
_THREAD_LOCK = threading.Lock()


def _get_file_lock(path: str):
    h = hashlib.sha256(path.encode("utf-8")).hexdigest()[:16]
    return open(os.path.join(tempfile.gettempdir(), f".serve_artifact_{h}.lock"), "a")


def extract_state_and_span(content: str):
    """Extract declared state dict and marker region span from HTML content."""
    matches = list(STATE_REGION_RE.finditer(content))
    if len(matches) != 1:
        raise ValueError(f"Expected exactly 1 state marker region, found {len(matches)}")
    script_m = SCRIPT_RE.search(matches[0].group(1))
    if not script_m:
        raise ValueError("Missing artifact-state script tag within marker region")
    state = json.loads(script_m.group(1).strip())
    if not isinstance(state, dict):
        raise ValueError("Saved state must be a JSON object")
    if any(not validate_scalar(v, v) for v in state.values()):
        raise ValueError("State values must be bounded primitive scalars")
    return state, matches[0].span()


def format_marker_region(state: dict) -> str:
    """Format safe JSON script tag and semantic HTML readability representation."""
    safe_json = (
        json.dumps(state, indent=2, sort_keys=True)
        .replace("&", "\\u0026")
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
    )
    items = []
    for k in sorted(state.keys()):
        val = state[k]
        rendered = "true" if val is True else ("false" if val is False else str(val))
        items.append(f"    <dt>{html.escape(k)}</dt>\n    <dd>{html.escape(rendered)}</dd>")
    dl_content = "\n".join(items)
    return (
        f"{MARKER_START}\n"
        f'<script id="artifact-state" type="application/json">\n{safe_json}\n</script>\n'
        f'<section id="artifact-state-readable" aria-label="Saved Artifact State">\n'
        f"  <h2>Saved Artifact State</h2>\n  <dl>\n{dl_content}\n  </dl>\n"
        f"</section>\n{MARKER_END}"
    )


def validate_scalar(val, current_val) -> bool:
    """Validate that val matches the declared primitive scalar type of current_val."""
    if isinstance(current_val, bool):
        return isinstance(val, bool)
    if not isinstance(current_val, bool) and isinstance(current_val, (int, float)):
        try:
            return (not isinstance(val, bool)) and isinstance(val, (int, float)) and math.isfinite(val)
        except OverflowError:
            return False
    if isinstance(current_val, str):
        return isinstance(val, str) and len(val) <= MAX_STRING_LEN
    return False


def atomic_write_file(file_path: str, new_content: str):
    """Atomically write text content to the same file path using fsync and replace."""
    mode = os.stat(file_path).st_mode & 0o777
    fd, tmp = tempfile.mkstemp(prefix=".artifact-", dir=os.path.dirname(file_path))
    try:
        with os.fdopen(fd, "wb") as f:
            os.fchmod(f.fileno(), mode)
            f.write(new_content.encode("utf-8"))
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, file_path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


class ArtifactHandler(http.server.BaseHTTPRequestHandler):
    """HTTP request handler for serving and updating a single HTML artifact."""

    server_version = "ArtifactServer/1.0"

    @property
    def artifact_path(self) -> str:
        return self.server.artifact_path

    def _is_loopback_host(self) -> bool:
        try:
            hp = urlparse(f"http://{self.headers.get('Host', '')}")
            return hp.hostname in ("127.0.0.1", "localhost", "::1") and (
                (hp.port or 80) == self.server.server_port
            ) and not hp.username and not hp.path
        except ValueError:
            return False

    def _validate_origin(self) -> bool:
        if self.headers.get("Sec-Fetch-Site", "").lower() == "cross-site":
            return False
        origin = self.headers.get("Origin")
        # Non-browser clients may omit Origin; browser writes must be same-origin.
        return origin is None or origin == f"http://{self.headers.get('Host', '')}"

    def _send_bytes(self, status: int, ctype: str, body: bytes, etag: str = None):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        if etag:
            self.send_header("ETag", f'"{etag}"')
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, status: int, data: dict, etag: str = None):
        self._send_bytes(status, "application/json; charset=utf-8", json.dumps(data).encode("utf-8"), etag)

    def do_GET(self):
        parsed = urlparse(self.path)
        if not self._is_loopback_host():
            self.send_error(403, "Forbidden host")
            return
        if parsed.path not in ("/", "/state"):
            self.send_error(404, "Not Found")
            return

        with _THREAD_LOCK, _get_file_lock(self.artifact_path) as lk:
            fcntl.flock(lk.fileno(), fcntl.LOCK_SH)
            try:
                with open(self.artifact_path, "rb") as f:
                    content_bytes = f.read()
            finally:
                fcntl.flock(lk.fileno(), fcntl.LOCK_UN)

        rev = hashlib.sha256(content_bytes).hexdigest()
        if parsed.path == "/":
            self._send_bytes(200, "text/html; charset=utf-8", content_bytes, etag=rev)
        else:
            try:
                state, _ = extract_state_and_span(content_bytes.decode("utf-8"))
            except Exception as e:
                self._send_json(500, {"error": "contract_error", "message": str(e)})
                return
            self._send_json(200, {"revision": rev, "state": state}, etag=rev)

    def do_POST(self):
        if urlparse(self.path).path != "/state":
            self.send_error(404, "Not Found")
            return
        if not self._is_loopback_host() or not self._validate_origin():
            self._send_json(403, {"error": "forbidden", "message": "Cross-origin or invalid host write rejected"})
            return
        ct = self.headers.get("Content-Type", "")
        if ct.split(";", 1)[0].strip().lower() != "application/json":
            self._send_json(400, {"error": "bad_request", "message": "Content-Type must be application/json"})
            return

        length = 0
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_SIZE:
                raise ValueError
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            incoming_state = payload["state"]
            if not isinstance(payload, dict) or not isinstance(incoming_state, dict):
                raise TypeError
        except (ValueError, json.JSONDecodeError, TypeError, KeyError):
            status = 413 if length > MAX_BODY_SIZE else 400
            self._send_json(status, {"error": "bad_request", "message": "Invalid JSON or body size"})
            return

        client_rev = payload.get("revision") or self.headers.get("If-Match", "").strip().strip('"').lstrip("W/").strip('"')
        if not client_rev:
            self._send_json(400, {"error": "bad_request", "message": "Missing revision in body or If-Match header"})
            return

        with _THREAD_LOCK, _get_file_lock(self.artifact_path) as lk:
            fcntl.flock(lk.fileno(), fcntl.LOCK_EX)
            try:
                with open(self.artifact_path, "r", encoding="utf-8", newline="") as f:
                    content = f.read()

                current_rev = hashlib.sha256(content.encode("utf-8")).hexdigest()
                try:
                    current_state, span = extract_state_and_span(content)
                except Exception as e:
                    self._send_json(500, {"error": "contract_error", "message": str(e)})
                    return

                if client_rev != current_rev:
                    self._send_json(
                        409,
                        {"error": "conflict", "message": "Stale revision", "current_revision": current_rev, "state": current_state},
                        etag=current_rev,
                    )
                    return

                new_state = dict(current_state)
                for k, v in incoming_state.items():
                    if k not in current_state:
                        self._send_json(400, {"error": "unknown_key", "message": f"Unknown key '{k}'"})
                        return
                    if not validate_scalar(v, current_state[k]):
                        self._send_json(400, {"error": "invalid_type", "message": f"Invalid type or value for key '{k}'"})
                        return
                    new_state[k] = v

                new_content = content[:span[0]] + format_marker_region(new_state) + content[span[1]:]
                atomic_write_file(self.artifact_path, new_content)
                new_rev = hashlib.sha256(new_content.encode("utf-8")).hexdigest()
            finally:
                fcntl.flock(lk.fileno(), fcntl.LOCK_UN)

        self._send_json(200, {"status": "ok", "revision": new_rev, "state": new_state}, etag=new_rev)

    def do_PUT(self):
        self._send_json(405, {"error": "method_not_allowed", "message": "PUT not allowed"})

    def do_DELETE(self):
        self._send_json(405, {"error": "method_not_allowed", "message": "DELETE not allowed"})

    def log_message(self, format, *args):
        pass


class ArtifactServer(http.server.HTTPServer):
    """HTTPServer bound to loopback carrying the target artifact path."""

    def __init__(self, server_address, RequestHandlerClass, artifact_path: str):
        super().__init__(server_address, RequestHandlerClass)
        self.artifact_path = artifact_path


def serve(file_path: str, port: int = 8000) -> ArtifactServer:
    """Validate artifact file and return a configured ArtifactServer bound to 127.0.0.1."""
    if not os.path.isabs(file_path):
        raise ValueError("Artifact path must be absolute")
    file_path = os.path.realpath(file_path)
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        extract_state_and_span(f.read())
    return ArtifactServer(("127.0.0.1", port), ArtifactHandler, file_path)


def main():
    parser = argparse.ArgumentParser(description="Locally serve one HTML artifact with durable state saving.")
    parser.add_argument("file", help="Absolute path to HTML artifact file")
    parser.add_argument(
        "--port", type=int, default=8000, help="Loopback port (default: 8000, 0 for auto-assign)"
    )
    args = parser.parse_args()

    if not os.path.isabs(args.file):
        parser.error(f"Artifact path must be absolute: {args.file}")
    if not os.path.isfile(args.file):
        parser.error(f"File not found: {args.file}")

    try:
        server = serve(args.file, args.port)
    except Exception as e:
        sys.exit(f"Error starting server: {e}")

    print(f"Serving {args.file} on http://127.0.0.1:{server.server_port}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
