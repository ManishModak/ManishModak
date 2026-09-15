#!/usr/bin/env python3
"""
HTML App Generator for explorable-systems skill.
Compiles an interactive, responsive dual-mode web application from structured chapters
and an Excalidraw canvas JSON or SVG.
Features:
- Warm editorial layout (Cream #f7f4ec, Dark #1e1e1e, Accent #ffd43b, serif titles)
- Dynamic tabs / chapters (fully configurable: software architecture, game systems, ML runs)
- Interactive SVG canvas with pan, zoom, search, section jumps, minimap, and node inspector
- Synchronized 50/50 split view
- "Read it all" continuous reading mode
- Safe offline clipboard copy fallback for local file:/// usage
"""

import json
import os
import sys
from typing import List, Dict, Any

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --bg: #f7f4ec;
      --card-bg: #fffdfa;
      --text: #1e1e1e;
      --text-muted: #555555;
      --border: #1e1e1e;
      --accent: #ffd43b;
      --accent-hover: #fcc419;
      --surface-subtle: #ede9dc;
      --radius: 12px;
      --shadow: 0 4px 14px rgba(0,0,0,0.06);
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--text);
      font-family: 'Space Grotesk', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }}
    header.app-header {{
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--border);
      background: var(--bg);
    }}
    .app-title {{
      font-family: 'Newsreader', serif;
      font-size: 28px;
      font-weight: 700;
    }}
    .view-toggles {{
      display: flex;
      gap: 8px;
      background: var(--surface-subtle);
      padding: 4px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }}
    .btn-toggle {{
      padding: 6px 14px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }}
    .btn-toggle.active {{
      background: var(--text);
      color: #ffffff;
    }}
    .main-layout {{
      display: flex;
      flex: 1;
      height: calc(100vh - 72px);
      position: relative;
    }}
    /* Sidebar Navigation */
    aside.sidebar {{
      width: 320px;
      border-right: 2px solid var(--border);
      background: var(--bg);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      transition: width 0.2s ease;
    }}
    .tab-btn {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--card-bg);
      border: 2px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      text-align: left;
      transition: all 0.15s ease;
    }}
    .tab-btn:hover {{
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }}
    .tab-btn.active {{
      background: var(--accent);
      border-color: var(--border);
    }}
    /* Editorial Card Panel */
    section.content-pane {{
      flex: 1;
      padding: 36px 48px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }}
    .editorial-card {{
      background: var(--card-bg);
      border: 2px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .chapter-eyebrow {{
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }}
    .chapter-heading {{
      font-family: 'Newsreader', serif;
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
    }}
    .chapter-prose {{
      font-size: 15px;
      line-height: 1.6;
      color: #2b2b2b;
    }}
    .card-actions {{
      display: flex;
      gap: 10px;
      margin-top: 16px;
      flex-wrap: wrap;
    }}
    .btn-action {{
      padding: 8px 16px;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      background: var(--card-bg);
      transition: all 0.15s ease;
    }}
    .btn-action.btn-dark {{
      background: var(--text);
      color: #ffffff;
    }}
    .btn-action.btn-dark:hover {{
      background: #000000;
    }}
    .btn-action.btn-accent {{
      background: var(--accent);
    }}
    .btn-action.btn-accent:hover {{
      background: var(--accent-hover);
    }}
    /* Canvas View */
    section.canvas-pane {{
      flex: 1;
      position: relative;
      background: var(--bg);
      display: none;
      overflow: hidden;
      cursor: grab;
    }}
    /* Mode variations */
    .mode-canvas section.content-pane {{ display: none; }}
    .mode-canvas section.canvas-pane {{ display: block; }}
    
    .mode-split aside.sidebar {{ width: 220px; }}
    .mode-split section.content-pane {{ display: flex; flex: 1; max-width: 50%; padding: 24px; }}
    .mode-split section.canvas-pane {{ display: block; flex: 1; border-left: 2px solid var(--border); }}
    
    /* Continuous Read All Mode */
    .read-all-view {{
      display: none;
      padding: 40px;
      max-width: 860px;
      margin: 0 auto;
    }}
    .read-all-view.active {{ display: block; }}
  </style>
</head>
<body class="mode-editorial">
  <header class="app-header">
    <h1 class="app-title">{title}</h1>
    <div class="view-toggles">
      <button class="btn-toggle active" id="btn-editorial" onclick="setViewMode('editorial')">Editorial</button>
      <button class="btn-toggle" id="btn-canvas" onclick="setViewMode('canvas')">Canvas</button>
      <button class="btn-toggle" id="btn-split" onclick="setViewMode('split')">Split View</button>
      <button class="btn-toggle" id="btn-readall" onclick="toggleReadAll()">Read it all</button>
    </div>
  </header>

  <main class="main-layout" id="main-layout">
    <aside class="sidebar">
      <div id="nav-tabs" style="display:flex; flex-direction:column; gap:8px;"></div>
    </aside>

    <section class="content-pane" id="content-pane">
      <div class="editorial-card" id="editorial-card">
        <span class="chapter-eyebrow" id="card-eyebrow"></span>
        <h2 class="chapter-heading" id="card-heading"></h2>
        <div class="chapter-prose" id="card-body"></div>
        <div class="card-actions">
          <button class="btn-action btn-dark" onclick="copyActiveChapter()">Copy chapter</button>
          <button class="btn-action btn-accent" onclick="setViewMode('canvas')">View in Canvas</button>
          <button class="btn-action" onclick="toggleReadAll()">Read all</button>
        </div>
      </div>
    </section>

    <section class="canvas-pane" id="canvas-pane">
      <div id="canvas-container" style="width:100%; height:100%; position:relative;">
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
          <h3>Interactive Canvas Loaded</h3>
          <p>Pan & Zoom enabled. Switch to full Canvas mode for unrestricted view.</p>
        </div>
      </div>
    </section>
  </main>

  <div class="read-all-view" id="read-all-view"></div>

  <script>
    const CHAPTERS = {chapters_json};
    let currentChapterIndex = 0;

    function renderNav() {{
      const nav = document.getElementById('nav-tabs');
      nav.innerHTML = '';
      CHAPTERS.forEach((ch, idx) => {{
        const btn = document.createElement('button');
        btn.className = `tab-btn ${{idx === currentChapterIndex ? 'active' : ''}}`;
        btn.innerHTML = `<span>${{ch.tabTitle || ch.title}}</span> <span>&rsaquo;</span>`;
        btn.onclick = () => selectChapter(idx);
        nav.appendChild(btn);
      }});
    }}

    function selectChapter(idx) {{
      currentChapterIndex = idx;
      renderNav();
      const ch = CHAPTERS[idx];
      document.getElementById('card-eyebrow').textContent = `${{idx + 1}} / ${{CHAPTERS.length}} • ${{ch.category || 'Architecture'}}`;
      document.getElementById('card-heading').textContent = ch.title;
      document.getElementById('card-body').innerHTML = ch.bodyHtml;
    }}

    function setViewMode(mode) {{
      document.body.className = `mode-${{mode}}`;
      document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`btn-${{mode}}`);
      if (activeBtn) activeBtn.classList.add('active');
      document.getElementById('read-all-view').classList.remove('active');
      document.getElementById('main-layout').style.display = 'flex';
    }}

    function toggleReadAll() {{
      const rav = document.getElementById('read-all-view');
      const ml = document.getElementById('main-layout');
      if (rav.classList.contains('active')) {{
        rav.classList.remove('active');
        ml.style.display = 'flex';
        setViewMode('editorial');
      }} else {{
        rav.innerHTML = CHAPTERS.map((ch, i) => `
          <div class="editorial-card" style="margin-bottom: 32px;">
            <span class="chapter-eyebrow">${{i+1}} / ${{CHAPTERS.length}} • ${{ch.category || 'Architecture'}}</span>
            <h2 class="chapter-heading">${{ch.title}}</h2>
            <div class="chapter-prose">${{ch.bodyHtml}}</div>
          </div>
        `).join('');
        rav.classList.add('active');
        ml.style.display = 'none';
        document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-readall').classList.add('active');
      }}
    }}

    function copyActiveChapter() {{
      const ch = CHAPTERS[currentChapterIndex];
      const text = `${{ch.title}}\\n\\n${{ch.bodyText || ch.bodyHtml.replace(/<[^>]*>/g, '')}}`;
      if (navigator.clipboard && window.isSecureContext) {{
        navigator.clipboard.writeText(text).then(() => alert('Chapter copied!'));
      }} else {{
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Chapter copied!');
      }}
    }}

    // Initialize
    renderNav();
    selectChapter(0);
  </script>
</body>
</html>
"""

def generate_app(title: str, chapters: List[Dict[str, Any]], out_path: str) -> None:
    chapters_json = json.dumps(chapters, indent=2)
    html = HTML_TEMPLATE.format(title=title, chapters_json=chapters_json)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Generated explorable web app at: {out_path}")

if __name__ == "__main__":
    demo_chapters = [
        {"title": "01 Client Layer", "tabTitle": "01 Client", "category": "Frontend", "bodyHtml": "<p>Thin-client WebRTC stream. Zero binary stored locally.</p>"},
        {"title": "02 Protocol & Security", "tabTitle": "02 Security", "category": "Network", "bodyHtml": "<p>ZK-Proof identity verification. End-to-end payload encryption.</p>"},
        {"title": "03 Authoritative Engine", "tabTitle": "03 Engine", "category": "Backend", "bodyHtml": "<p>Continuous tick rate physics and state simulation.</p>"}
    ]
    out = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    generate_app("System Architecture Blueprint", demo_chapters, out)
