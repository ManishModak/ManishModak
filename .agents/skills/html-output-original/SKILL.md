---
name: html-output
description: >
  Generate rich, interactive HTML files instead of Markdown for specs, plans, reports,
  code reviews, design prototypes, custom editors, and any complex output where visual
  clarity matters. Use this skill whenever the user asks to "make an HTML file", "create
  an HTML artifact", or wants a shareable, readable document. Also trigger proactively
  when the user requests specs, implementation plans, brainstorming outputs, code
  explainers, PR writeups, design mockups, or reports — even if they don't explicitly
  say "HTML". Prefer HTML over Markdown for any output longer than ~50 lines or
  whenever the content would benefit from tables, diagrams, color, interactivity,
  tabs, or SVG illustrations.
---

# HTML Output Skill

Generate rich, self-contained HTML files that are far more readable and shareable than Markdown. This skill covers when to use HTML, how to structure different types of HTML outputs, and practical patterns for each use case.

---

## When to Use HTML Instead of Markdown

Default to HTML when any of the following apply:

- Output is longer than ~50–100 lines
- Content includes tabular data, diagrams, color, or spatial layout
- The user will share the file with others
- The content is a spec, plan, report, or explainer someone needs to actually *read*
- The user wants interactivity (sliders, tabs, knobs, copy buttons, drag-and-drop)
- ASCII art or unicode workarounds would otherwise be used to convey visual info

Markdown is fine for: short snippets, commit messages, quick answers, version-controlled prose where diff readability matters most.

**Override rule:** If the user explicitly asks for a specific format (Markdown, Word/.docx, PDF, plain text), that request wins — don't substitute HTML.

## Saving & Delivering the File

- In a chat environment with a filesystem (e.g. Claude.ai), write the `.html` file to the outputs directory (`/mnt/user-data/outputs/`) and present it to the user with the file-presentation tool so they get a download/preview link. Never just paste the raw HTML into chat.
- In Claude Code / local environments, save it into the project (or a path the user names), then launch it in the user-visible browser or attached preview and verify that it loads. Do not stop at merely reporting the path when a browser preview is available.
- If no browser or preview can be launched, provide a clickable path and state the exact limitation instead of claiming the artifact was shown.
- Use a descriptive kebab-case filename: `auth-flow-implementation-plan.html`, not `output.html`.

---

## Core Principles

1. **Self-contained**: All CSS and JS inline in a single `.html` file — no external dependencies except CDN links (use cdnjs.cloudflare.com).
2. **Visually organized**: Use tabs, sections, color-coding, and sidebar navigation for long documents. Make it skimmable.
3. **Mobile responsive**: Use CSS that adapts to narrow viewports.
4. **Export-friendly**: For interactive editors, always add a "Copy as JSON" or "Copy as prompt" button so output flows back into Claude.
5. **SVG for diagrams**: Use inline SVG for flowcharts, architecture diagrams, data flows — never ASCII art.
6. **Rich but not bloated**: Don't add complexity for its own sake. Match richness to the content's needs.

---

## Use Cases & Patterns

### 1. Specs, Plans & Exploration

For brainstorming, implementation plans, and design explorations:

- Use a tabbed layout: Overview / Details / Mockups / Open Questions
- Include SVG diagrams for data flow, architecture, or component relationships
- Add annotated code snippets where relevant
- Use color-coded callouts for risks, decisions, and open questions
- Grid layout for side-by-side comparison of multiple options

**Example prompts this covers:**
- "Generate 6 different approaches to the onboarding screen in a single HTML file"
- "Create a thorough implementation plan with mockups, data flow, and code snippets"
- "Brainstorm and compare different options for X"

---

### 2. Code Review & Explainers

For PRs, code walkthroughs, and concept explainers:

- Render diffs with syntax highlighting and inline margin annotations
- Color-code findings by severity (red = critical, yellow = warning, blue = info)
- Include flowcharts of the code's logic using SVG
- Add a "Gotchas" or "Key Decisions" section at the bottom
- Use a two-column layout: code on the left, annotations on the right

**Example prompts this covers:**
- "Create an HTML artifact explaining this PR, focusing on streaming/backpressure"
- "I don't understand how our rate limiter works — make an HTML explainer"
- "Summarize how feature X works with diagrams and key code snippets"

---

### 3. Design & Prototypes

For UI mockups and interaction prototypes:

- Implement the actual interaction in HTML/CSS/JS, not a static screenshot
- Add sliders, toggles, and knobs to tune parameters (animation duration, easing, colors)
- Include a "Copy parameters" button that exports the chosen values
- Show multiple variants side-by-side in a grid
- Use CSS custom properties for easy theming

**Example prompts this covers:**
- "Prototype a checkout button animation with sliders to tune it"
- "Show me 4 different card designs side by side"
- "Create a mockup of the settings screen"

---

### 4. Reports & Research

For summaries, status reports, and technical writeups:

- Use a document-style layout with a sticky table of contents
- Include SVG charts and diagrams to break up text
- Add callout boxes for key findings, risks, and recommendations
- Structure as: Executive Summary → Details → Data → Appendix
- Make it printable (good contrast, sensible page breaks)

**Example prompts this covers:**
- "Weekly status report for my team"
- "Incident report for leadership"
- "Research summary on how our caching layer changed over the last 6 months"

---

### 5. Custom Editing Interfaces

For throwaway, task-specific UIs built around a specific piece of data:

- Build exactly the editor needed for this one task — not a generic tool
- Pre-populate with the user's actual data
- Always end with an export button: "Copy as JSON", "Copy as Markdown", "Copy diff"
- Common patterns:
  - Draggable kanban cards (for ticket triage)
  - Form-based config editors (for feature flags, env vars)
  - Side-by-side editors (for prompts, templates)
  - Approve/reject rows (for dataset curation)

**Example prompts this covers:**
- "Make a drag-and-drop kanban for these 30 Linear tickets with a copy-as-markdown button"
- "Build a form editor for this feature flag config"
- "Side-by-side prompt editor with live preview and token counter"

---

## HTML Structure Template

Use this as a starting point and adapt to the use case:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- Descriptive title --></title>
  <style>
    /* CSS custom properties for theming */
    :root {
      --bg: #0f1117;
      --surface: #1a1d27;
      --border: #2a2d3a;
      --accent: #6366f1;
      --text: #e2e8f0;
      --muted: #64748b;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    /* Reset + base */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    /* Layout, tabs, cards, etc. below */
  </style>
</head>
<body>
  <!-- Content -->
  <script>
    // Interactivity here
  </script>
</body>
</html>
```

---

## Design Tips

- **Dark theme by default** works well for technical content; offer a toggle for reports.
- **Typography**: Use `system-ui` for body, `monospace` for code. Size hierarchy: 2rem → 1.5rem → 1.25rem → 1rem → 0.875rem.
- **Color-coding**: Be consistent. Red = error/risk, yellow = warning/caution, green = success/good, blue = info/note.
- **Tabs**: Great for long documents. Keep tab labels short (1–3 words).
- **Copy buttons**: Use `navigator.clipboard.writeText()`. Show a ✓ confirmation after copying.
- **SVG diagrams**: Use `viewBox`, `foreignObject` for text, and `marker` for arrowheads.

---

## Sharing

- Download from the chat and open in any browser, or drag the file into a browser tab.
- Upload to S3 / GitHub Pages / any static host for a shareable link.
- Attach to PRs, emails, or Slack messages as a single file.

## Embedding Data Safely

When pre-populating the file with user data (tickets, configs, code snippets):

- Embed data as a JSON blob in a `<script type="application/json">` tag or a JS constant — don't interpolate raw strings into markup.
- Escape any `</script>` sequences inside embedded strings (`<\/script>`), or the browser will terminate the script block early and break the whole file.
- HTML-escape user content rendered into the DOM (`&`, `<`, `>`), especially code snippets — use `textContent`, not `innerHTML`, when inserting via JS.

---

## What Not to Do

- Don't use `<form>` tags — use `onClick`/`onChange` handlers instead.
- Don't rely on external fonts or scripts that might be blocked.
- Don't make the file so large it's slow to open — split into multiple files for very large outputs.
- Don't add interactivity just because you can — match complexity to the need.
