---
name: explorable-systems
description: >
  Build interactive visual architectures, deep mindmaps, and explorable system boards
  from complex discussions, codebases, game systems, or data. Generates an editable
  Excalidraw canvas (.excalidraw) paired with a self-contained interactive web app (index.html)
  featuring dual-pane editorial reading, interactive canvas/charts, 50/50 split view,
  and continuous "Read it all" mode. Use whenever the user wants to visualize, map, or
  deeply understand a software architecture, game economy, protocol, or ML dataset.
---

# Explorable Systems & Interactive Visual Architecture

Transform abstract technical concepts, system designs, game mechanics, and datasets into **tangible, interactive visual workspaces**.

Instead of static markdown tables or manual hours spent dragging boxes in visual editors, this skill automates the creation of:
1. **An Editable Master Excalidraw Canvas** (`.excalidraw`) with verified two-way element bindings and zero text overflow.
2. **A Self-Contained Interactive Web Application** (`index.html`) offering synchronized dual-pane inspection, pan/zoom canvas controls, full-screen mode, 50/50 split mode, and continuous "Read it all" reading.
3. **Interactive Charts & Data Visualizers** (Bubble maps, state machines, and flow graphs) tailored to the specific domain.

---

## 🎨 Visual Philosophy & Aesthetic Reference

The visual design is inspired by high-polish editorial engineering dashboards (see `references/`):
- **Warm Editorial Color Palette**: Background `#f7f4ec`, Card background `#fffdfa`, Dark borders/text `#1e1e1e`, Accent highlight `#ffd43b` (warm gold), and subtle dividers `#ede9dc`.
- **Typography Pairing**: Serif headings (`Newsreader` or `Playfair Display`) paired with clean geometric monospace/sans-serif body (`Space Grotesk`, `JetBrains Mono`).
- **Tactile Card Layout**: Thick 2px high-contrast borders, rounded corners (10–12px), subtle depth shadows, and badge pills.

### Reference Images
Located in `/home/manishm/.gemini/config/skills/explorable-systems/references/`:
- `media_1789395730349.jpg` & `media_1789398980240.png`: Editorial tab drawer and card anatomy.
- `media_1789395728746.jpg`: Delivery specification and action button styles (`Copy`, `Download`, `Read it all`).
- `media_1789398985745.png`: Strategic business & defensibility framing.

---

## 🧩 The 3 Core Visual Modes

**Form follows function.** Never force a rigid template. Adapt the structure to the actual topic:

### Mode 1: Software & Distributed Architecture
* **Best for:** Chat apps, storage pipelines, end-to-end encryption handshakes, microservices, cloud orchestration, caching layers.
* **Visual Structure:** Flow diagrams, data pipelines, client-server conduits, and security boundaries.
* **Sections Example:** `01 Client & Transport` $\to$ `02 Cryptographic Handshake (Signal/E2EE)` $\to$ `03 Message Broker (Kafka/NATS)` $\to$ `04 Storage & Sharding`.

### Mode 2: Game Systems & Macro-Economics
* **Best for:** Player-driven economies, anti-bot math, crafting state machines, asset taxonomies, faucet-to-sink loops.
* **Visual Structure:** Closed-loop flowcharts, token flow diagrams, degradation curves, and mastery trees.
* **Sections Example:** `01 The Player Loop` $\to$ `02 Faucets & Sinks` $\to$ `03 Anti-Bot Energy Window` $\to$ `04 5-Tier Item Taxonomy` $\to$ `05 Staged Roadmap`.

### Mode 3: Data, ML & Interactive Analytics
* **Best for:** Model training runs, loss curves, hyperparameter sweeps, dataset cluster distributions, token embeddings.
* **Visual Structure:** Interactive Canvas Bubble Maps (using `components/bubble_map.js`), scatter plots, or multi-run comparison matrices.
* **Sections Example:** `01 Dataset Topology` $\to$ `02 Architecture & Weights` $\to$ `03 Training Run Comparisons` $\to$ `04 Evaluation Benchmarks`.

---

## 🛠️ Prebuilt Scripts & Components

All tools are pre-packaged in this skill directory for instant agent reuse:

```
explorable-systems/
├── SKILL.md
├── references/                 # Visual grounding screenshots
│   ├── media_1789395728746.jpg
│   ├── media_1789395730349.jpg
│   ├── media_1789398977607.png
│   ├── media_1789398980240.png
│   └── media_1789398985745.png
├── scripts/
│   ├── excalidraw_generator.py # Generates valid, 2-way bound Excalidraw JSON
│   └── html_app_generator.py   # Compiles the self-contained interactive web app
└── components/
    ├── bubble_map.js           # Zero-dependency interactive bubble cluster chart
    └── flow_graph.js           # Interactive node graph controller with pan/zoom
```

### 1. `scripts/excalidraw_generator.py`
Automates clean Excalidraw diagram creation without syntax or binding errors:
- **Two-Way Binding**: Automatically pairs arrow `startBinding` and `endBinding` with target containers' `boundElements`.
- **Word-Wrapping Engine**: Wraps bullet points to 40–50 characters and computes dynamic card heights to prevent text bleed.
- **Usage**:
  ```python
  from scripts.excalidraw_generator import ExcalidrawBuilder
  b = ExcalidrawBuilder()
  c1 = b.add_card(100, 100, 340, "WebSocket Gateway", ["• Manages stateful connections", "• Heartbeat ping/pong 30s"], badge="Network")
  c2 = b.add_card(520, 100, 340, "E2EE Ratchet Engine", ["• Double Ratchet algorithm", "• Ephemeral key exchange"], badge="Crypto")
  b.add_arrow(c1["id"], c2["id"], label="Encrypted Payload")
  b.export_json("system.excalidraw")
  ```

### 2. `scripts/html_app_generator.py`
Compiles the self-contained `index.html` application:
- Includes the editorial drawer, full canvas zoom/pan, 50/50 split mode, and continuous "Read it all" reading mode.
- Includes safe offline clipboard copy fallback for `file:///` paths.
- **Usage**:
  ```python
  from scripts.html_app_generator import generate_app
  chapters = [
    {"title": "01 Encryption Handshake", "tabTitle": "01 Crypto", "category": "Security", "bodyHtml": "<p>Explanation...</p>"},
    {"title": "02 Sharded Storage", "tabTitle": "02 Database", "category": "Persistence", "bodyHtml": "<p>Explanation...</p>"}
  ]
  generate_app("Chat Architecture Blueprint", chapters, "index.html")
  ```

### 3. `components/bubble_map.js`
Zero-dependency HTML5 Canvas / SVG bubble visualizer:
- Perfect for ML model runs or multi-variable data.
- Handles repulsion physics, radius normalization, click selection, and hover tooltips.

---

## 📋 Execution Protocol for Agents

When requested to visualize, map, or design an explorable architecture:

1. **Understand the Domain**: Identify whether the topic is **Software Architecture**, **Game Systems / Economy**, or **Data / ML Runs**.
2. **Synthesize Domain Chapters**: Create 4 to 8 logical chapters tailored to the subject. Give each chapter an eyebrow badge, serif title, and clear technical prose.
3. **Generate the Excalidraw Canvas**:
   - Use `scripts/excalidraw_generator.py` to produce a `.excalidraw` file.
   - Ensure all arrows are cleanly routed between adjacent modules without cutting through text boxes.
   - Use distinct background tints for different tiers or architectural layers (e.g. `#ffffff` for clients, `#e7f5ff` for core services, `#fff9db` for data sinks).
4. **Compile the Interactive App (`index.html`)**:
   - Embed the canvas data and chapters into a standalone, single-file `index.html`.
   - Ensure the app supports:
     - Tab switching on the left panel.
     - View mode toggles: **Editorial**, **Canvas**, **Split View**, and **Read it all**.
     - Seamless offline performance over local `file:///` links.
5. **Verify Deliverables**:
   - Inspect the `.excalidraw` file for valid JSON and zero missing bindings.
   - Verify `index.html` renders cleanly without console or layout errors.
   - Present the user with the direct `file:///` link and a concise summary of the architectural map.
