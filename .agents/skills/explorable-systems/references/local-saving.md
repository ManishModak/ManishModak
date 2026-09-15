# Local saving helper

Use `scripts/serve_artifact.py` when an editable, self-contained HTML artifact needs the saving contract in `html-output` and no suitable workspace service exists. This optional Python 3 helper uses the standard library and POSIX file locking (Linux/macOS); it is not a Windows-native server or an application backend.

## Start

From this skill directory:

```sh
python3 scripts/serve_artifact.py /absolute/path/to/artifact.html --port 8000
```

Use `--port 0` to select an available port and read the printed URL. The server binds to `127.0.0.1` and serves only that file. Inline its assets; other paths return 404. Keep the process running for the preview. The HTML file remains the durable copy when it stops.

## Declare editable fields

Place exactly one region in the UTF-8 HTML body. Keep the script attributes as shown. Keys are stable field IDs; values declare boolean, string or finite number types. Arrays, nested objects and null are unsupported. Use a service suited to richer state rather than encoding arbitrary complex data into opaque strings.

```html
<!-- ARTIFACT-STATE-START -->
<script id="artifact-state" type="application/json">
{"approved": false, "notes": "Initial notes", "selected_step": 1}
</script>
<section id="artifact-state-readable" aria-label="Saved Artifact State">
  <h2>Saved Artifact State</h2>
  <dl>
    <dt>approved</dt><dd>false</dd>
    <dt>notes</dt><dd>Initial notes</dd>
    <dt>selected_step</dt><dd>1</dd>
  </dl>
</section>
<!-- ARTIFACT-STATE-END -->
```

The server regenerates this region as escaped JSON plus readable HTML. Place it inside an outer `<details>` if it should be collapsed; put no custom controls inside the generated region. Everything outside it, including line endings, is preserved. Keys and values are escaped; initial authored JSON must also escape `<` (including closing-script sequences). Display notes with `textContent`, not `innerHTML`.

## API

- `GET /` serves the HTML with an ETag.
- `GET /state` returns `{ "revision": "full-file-sha256", "state": {...} }`.
- `POST /state`, with `Content-Type: application/json`, accepts `{ "revision": "previous-sha256", "state": { "notes": "Updated" } }`. Fields may be patched; unknown IDs or changed types are rejected. The matching quoted hash may instead be supplied in `If-Match`.
- A successful save returns 200 with `{ "status": "ok", "revision": "new-sha256", "state": {...} }`.
- A stale save returns 409 with the current state and revision. Invalid inputs return 400, excessive bodies 413, foreign origins/hosts 403. Broken source contracts return 500.

Writes are limited to declared scalar fields: request bodies up to 1 MB and strings up to 100,000 characters. Hosts must be loopback addresses on this port; supplied browser Origin must match Host. There is no wildcard CORS or arbitrary file/HTML replacement endpoint.

## Browser integration

Build the small client around the artifact's actual controls:

1. Render embedded state immediately, including when opened as a file. Load `/state` before enabling source-saving controls. A failed load must show saving unavailable, not leave a false Saved indicator.
2. Track local edits separately from the last acknowledged snapshot. Debounce text edits and serialize requests: only one save in flight. Capture a snapshot and edit counter when sending.
3. On success, advance the revision and update the readable saved-state mirror. If edits occurred during the request, keep them and send the newer snapshot next. Only show **Saved to file** when the latest edits are acknowledged; never replace newer input with an older response.
4. On conflict, stop automatic retries. Keep the user's edits available and let them compare/reconcile with the newer file. Do not adopt the returned revision and blindly retry the old state: that would defeat the conflict check.
5. On failure, display **Unsaved** with recovery options. A downloadable updated HTML fallback must include current edits, escaped embedded state and its readable mirror; it does not update the original source. Follow `html-output` for the handover prompt and preview/source paths.

## Verification and limits

Run `python3 -B -m unittest discover -s tests -v` from this skill directory. Also exercise the actual browser client: save, read the source, reopen, type while a save is pending, and trigger a conflict. HTTP tests alone do not validate a client's autosave queue or download fallback.

The helper serializes cooperating server requests with locks and writes via a temporary file plus atomic replace, preserving permission bits. Revision checks detect changes already present when a save begins. An unrelated editor does not honor this lock: avoid editing the source concurrently with browser saves, or stop the server while an agent rewrites it. Atomic replacement prevents partially written files; it is not a backup system or a guarantee against every filesystem/power failure.
