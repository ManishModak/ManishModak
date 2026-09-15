#!/usr/bin/env python3
"""Integration tests for serve_artifact.py."""

import hashlib
import json
import os
import sys
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

# Ensure scripts directory is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts")))
from serve_artifact import extract_state_and_span, format_marker_region, serve


SAMPLE_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Test Artifact</title></head>
<body>
  <h1>Test Title</h1>
  <p>Leader text before state.</p>
<!-- ARTIFACT-STATE-START -->
<script id="artifact-state" type="application/json">
{
  "completed": false,
  "counter": 10,
  "notes": "Initial notes"
}
</script>
<section id="artifact-state-readable" aria-label="Saved Artifact State">
  <h2>Saved Artifact State</h2>
  <dl>
    <dt>completed</dt>
    <dd>false</dd>
    <dt>counter</dt>
    <dd>10</dd>
    <dt>notes</dt>
    <dd>Initial notes</dd>
  </dl>
</section>
<!-- ARTIFACT-STATE-END -->
  <p>Trailer text after state.</p>
</body>
</html>"""


class TestServeArtifactIntegration(unittest.TestCase):
    """HTTP integration tests covering full lifecycle, concurrency, security, and schema."""

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.artifact_path = os.path.join(self.tmp_dir.name, "test_artifact.html")
        with open(self.artifact_path, "w", encoding="utf-8") as f:
            f.write(SAMPLE_HTML_TEMPLATE)

        self.server = serve(self.artifact_path, port=0)
        self.port = self.server.server_port
        self.base_url = f"http://127.0.0.1:{self.port}"
        self.server_thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.server_thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.tmp_dir.cleanup()

    def _http_request(self, path, method="GET", data=None, headers=None):
        url = f"{self.base_url}{path}"
        req_headers = {"Host": f"127.0.0.1:{self.port}"}
        if headers:
            req_headers.update(headers)
        body = None
        if data is not None:
            if isinstance(data, (dict, list)):
                body = json.dumps(data).encode("utf-8")
                if "Content-Type" not in req_headers:
                    req_headers["Content-Type"] = "application/json"
            elif isinstance(data, str):
                body = data.encode("utf-8")
            elif isinstance(data, bytes):
                body = data

        req = Request(url, data=body, headers=req_headers, method=method)
        try:
            with urlopen(req) as resp:
                resp_body = resp.read()
                return resp.status, resp.headers, resp_body
        except HTTPError as e:
            try:
                body = e.read()
            finally:
                e.close()
            return e.code, e.headers, body

    def test_preserves_crlf_and_permissions(self):
        original = SAMPLE_HTML_TEMPLATE.replace("\n", "\r\n").encode()
        with open(self.artifact_path, "wb") as f:
            f.write(original)
        os.chmod(self.artifact_path, 0o600)
        _, _, body = self._http_request("/state")
        status, _, body = self._http_request("/state", "POST", {
            "revision": json.loads(body)["revision"], "state": {"notes": "Saved"}})
        self.assertEqual(status, 200)
        with open(self.artifact_path, "rb") as f:
            actual = f.read()
        before = original.split(b"<!-- ARTIFACT-STATE-START -->")[0]
        after = original.split(b"<!-- ARTIFACT-STATE-END -->")[1]
        self.assertTrue(actual.startswith(before))
        self.assertTrue(actual.endswith(after))
        self.assertEqual(os.stat(self.artifact_path).st_mode & 0o777, 0o600)
        self.assertEqual(json.loads(body)["revision"], hashlib.sha256(actual).hexdigest())

    def test_malformed_headers_and_large_numbers(self):
        _, _, body = self._http_request("/state")
        revision = json.loads(body)["revision"]
        for header in ({"Host": "127.0.0.1:invalid"}, {"Origin": f"http://localhost:{self.port}"}):
            status, _, _ = self._http_request("/state", "POST", {"revision": revision, "state": {}}, header)
            self.assertEqual(status, 403)
        status, _, _ = self._http_request("/state", "POST", b"{}", {
            "Content-Type": "application/json", "Content-Length": "invalid"})
        self.assertEqual(status, 400)
        for value in (10**1000, float("nan"), float("inf")):
            status, _, _ = self._http_request("/state", "POST", {"revision": revision, "state": {"counter": value}})
            self.assertEqual(status, 400)

    def test_serve_root_and_state(self):
        """GET / returns HTML and ETag; GET /state returns declared JSON state and revision."""
        status, headers, body = self._http_request("/")
        self.assertEqual(status, 200)
        self.assertIn(b"Leader text before state.", body)
        self.assertIn(b"Trailer text after state.", body)
        self.assertIn("text/html", headers.get("Content-Type", ""))
        etag = headers.get("ETag", "").strip('"')
        with open(self.artifact_path, "rb") as f:
            expected_hash = hashlib.sha256(f.read()).hexdigest()
        self.assertEqual(etag, expected_hash)

        status, headers, body = self._http_request("/state")
        self.assertEqual(status, 200)
        data = json.loads(body.decode("utf-8"))
        self.assertEqual(data["revision"], expected_hash)
        self.assertEqual(data["state"], {"completed": False, "counter": 10, "notes": "Initial notes"})

    def test_save_and_reopen_reads(self):
        """POST /state saves valid state atomically, updates source HTML, and reflects in subsequent GETs."""
        _, _, body = self._http_request("/state")
        initial_rev = json.loads(body)["revision"]

        new_state = {"notes": "Updated progress notes", "counter": 42, "completed": True}
        status, headers, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": initial_rev, "state": new_state},
        )
        self.assertEqual(status, 200)
        resp_data = json.loads(body)
        self.assertEqual(resp_data["status"], "ok")
        new_rev = resp_data["revision"]
        self.assertEqual(resp_data["state"], new_state)

        # Verify on-disk file content
        with open(self.artifact_path, "r", encoding="utf-8") as f:
            disk_content = f.read()
        self.assertIn("Leader text before state.", disk_content)
        self.assertIn("Trailer text after state.", disk_content)
        self.assertIn('"counter": 42', disk_content)
        self.assertIn("<dt>counter</dt>\n    <dd>42</dd>", disk_content)
        self.assertIn("<dt>completed</dt>\n    <dd>true</dd>", disk_content)
        self.assertIn("<dt>notes</dt>\n    <dd>Updated progress notes</dd>", disk_content)

        # Reopen reads via HTTP
        status, _, body = self._http_request("/state")
        self.assertEqual(status, 200)
        reopened = json.loads(body)
        self.assertEqual(reopened["revision"], new_rev)
        self.assertEqual(reopened["state"], new_state)

    def test_escaped_payload_script_and_html(self):
        """Tricky payloads with </script> and HTML special chars are safely escaped in script and HTML."""
        _, _, body = self._http_request("/state")
        rev = json.loads(body)["revision"]

        dangerous_payload = {
            "notes": "</script><script>alert('xss')</script> & <b>test</b> \"quote\"",
            "counter": 0,
            "completed": False,
        }
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": dangerous_payload},
        )
        self.assertEqual(status, 200)

        with open(self.artifact_path, "r", encoding="utf-8") as f:
            disk_content = f.read()

        # The literal substring "</script>" must NOT appear inside the script tag
        script_part = disk_content.split('id="artifact-state"')[1].split("</script>")[0]
        self.assertNotIn("</script>", script_part)
        self.assertIn(r"\u003c/script\u003e", script_part)

        # The readable HTML section must escape <, >, &, "
        self.assertIn("&lt;/script&gt;&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;", disk_content)
        self.assertIn("&amp; &lt;b&gt;test&lt;/b&gt;", disk_content)

        # GET /state parses the escaped JSON back to the exact original string
        status, _, body = self._http_request("/state")
        data = json.loads(body)
        self.assertEqual(data["state"]["notes"], dangerous_payload["notes"])

    def test_stale_revision_rejection(self):
        """POST /state with a mismatched or stale revision returns 409 Conflict."""
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": "0000000000000000000000000000000000000000000000000000000000000000", "state": {"counter": 99}},
        )
        self.assertEqual(status, 409)
        resp_data = json.loads(body)
        self.assertEqual(resp_data["error"], "conflict")
        self.assertIn("current_revision", resp_data)
        self.assertEqual(resp_data["state"]["counter"], 10)

    def test_external_modification_stale_revision(self):
        """External modification by an agent updates source hash; subsequent save with prior revision fails with 409."""
        _, _, body = self._http_request("/state")
        old_rev = json.loads(body)["revision"]

        # External agent edits the file directly on disk
        with open(self.artifact_path, "r", encoding="utf-8") as f:
            content = f.read()
        external_content = content.replace("Trailer text after state.", "Trailer modified by agent.")
        with open(self.artifact_path, "w", encoding="utf-8") as f:
            f.write(external_content)

        # Client attempt to save with the old revision
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": old_rev, "state": {"counter": 50}},
        )
        self.assertEqual(status, 409)
        resp_data = json.loads(body)
        self.assertEqual(resp_data["error"], "conflict")

        # Confirm agent's edits were not overwritten
        with open(self.artifact_path, "r", encoding="utf-8") as f:
            self.assertIn("Trailer modified by agent.", f.read())

    def test_invalid_types_and_unknown_keys(self):
        """Reject unknown keys, type mismatches, non-scalar structures, and oversized values."""
        _, _, body = self._http_request("/state")
        rev = json.loads(body)["revision"]

        # Unknown key
        status, _, body = self._http_request("/state", method="POST", data={"revision": rev, "state": {"unknown_id": "val"}})
        self.assertEqual(status, 400)
        self.assertIn("unknown_key", json.loads(body).get("error", ""))

        # Type mismatch: string for bool
        status, _, body = self._http_request("/state", method="POST", data={"revision": rev, "state": {"completed": "true"}})
        self.assertEqual(status, 400)
        self.assertIn("invalid_type", json.loads(body).get("error", ""))

        # Type mismatch: bool for integer
        status, _, body = self._http_request("/state", method="POST", data={"revision": rev, "state": {"counter": True}})
        self.assertEqual(status, 400)
        self.assertIn("invalid_type", json.loads(body).get("error", ""))

        # Non-scalar: list
        status, _, body = self._http_request("/state", method="POST", data={"revision": rev, "state": {"notes": ["list", "val"]}})
        self.assertEqual(status, 400)

        # Non-scalar: dict
        status, _, body = self._http_request("/state", method="POST", data={"revision": rev, "state": {"counter": {"nested": 1}}})
        self.assertEqual(status, 400)

        # String exceeding sensible limit (100,000 chars)
        huge_string = "A" * 100_001
        status, _, body = self._http_request("/state", method="POST", data={"revision": rev, "state": {"notes": huge_string}})
        self.assertEqual(status, 400)

        # Non-JSON content type
        status, _, _ = self._http_request(
            "/state",
            method="POST",
            data="plain text",
            headers={"Content-Type": "text/plain"},
        )
        self.assertEqual(status, 400)

    def test_cross_origin_and_host_rejection(self):
        """Reject cross-origin Origin, Sec-Fetch-Site cross-site, and invalid Host headers."""
        _, _, body = self._http_request("/state")
        rev = json.loads(body)["revision"]

        # Cross-origin Origin header
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": {"counter": 20}},
            headers={"Origin": "http://evil.com"},
        )
        self.assertEqual(status, 403)

        # Origin: null
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": {"counter": 20}},
            headers={"Origin": "null"},
        )
        self.assertEqual(status, 403)

        # Sec-Fetch-Site: cross-site
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": {"counter": 20}},
            headers={"Sec-Fetch-Site": "cross-site"},
        )
        self.assertEqual(status, 403)

        # Foreign Host header on write
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": {"counter": 20}},
            headers={"Host": "attacker.com"},
        )
        self.assertEqual(status, 403)

        # Foreign Host header on read
        status, _, body = self._http_request(
            "/",
            method="GET",
            headers={"Host": "attacker.com"},
        )
        self.assertEqual(status, 403)

        # Matching loopback Origin header succeeds
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": {"counter": 20}},
            headers={"Origin": f"http://127.0.0.1:{self.port}"},
        )
        self.assertEqual(status, 200)

    def test_path_refusal_and_methods(self):
        """Fixed target: reject traversal, unknown paths, and disallowed HTTP methods."""
        # Non-existent paths
        status, _, _ = self._http_request("/random_path")
        self.assertEqual(status, 404)

        # Traversal attempt
        status, _, _ = self._http_request("/../etc/passwd")
        self.assertEqual(status, 404)

        # Disallowed methods
        status, _, _ = self._http_request("/state", method="PUT", data={})
        self.assertEqual(status, 405)

        status, _, _ = self._http_request("/state", method="DELETE")
        self.assertEqual(status, 405)

    def test_revision_via_if_match_header(self):
        """Accept revision passed via standard HTTP If-Match header."""
        _, _, body = self._http_request("/state")
        rev = json.loads(body)["revision"]

        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"state": {"counter": 77}},
            headers={"If-Match": f'"{rev}"'},
        )
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["state"]["counter"], 77)

    def test_external_marker_tampering_and_schema_update(self):
        """Reject saves when markers are removed; re-read updated schema if file contract is altered."""
        _, _, body = self._http_request("/state")
        rev = json.loads(body)["revision"]

        # Case 1: External tampering removes markers entirely
        with open(self.artifact_path, "w", encoding="utf-8") as f:
            f.write("<!DOCTYPE html><html><body>No markers here</body></html>")

        # Save should fail with 500 contract error without crashing
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": rev, "state": {"counter": 123}},
        )
        # Even with mismatched revision it returns 409 or contract error
        self.assertIn(status, (409, 500))

        # Case 2: External update to contract adds a new field "priority": 1
        new_template = SAMPLE_HTML_TEMPLATE.replace(
            '"notes": "Initial notes"',
            '"notes": "Initial notes",\n  "priority": 1'
        )
        with open(self.artifact_path, "w", encoding="utf-8") as f:
            f.write(new_template)

        # Get updated revision from disk
        with open(self.artifact_path, "rb") as f:
            new_rev = hashlib.sha256(f.read()).hexdigest()

        # Client can now save the newly added field "priority"
        status, _, body = self._http_request(
            "/state",
            method="POST",
            data={"revision": new_rev, "state": {"priority": 5}},
        )
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["state"]["priority"], 5)


if __name__ == "__main__":
    unittest.main()
