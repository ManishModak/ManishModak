---
name: explorable-systems
description: >
  Build engaging interactive explanations of systems, relationships, processes and
  data. Use when a user wants to explore how something works, inspect an architecture,
  map connections, compare outcomes or understand data visually, without needing to
  name a chart type. Choose representations for the question rather than a fixed
  template. Complements html-output for presentation, saving and handover; ordinary
  short answers and document-only plans do not require an explorer.
---

# Explorable Systems

Make complex things inviting to understand. The user supplies the question, discussion, code or data; you choose and build useful ways to explore it. They should not need a vocabulary of visualization types or manually assemble a canvas.

## Decide what the experience should teach

- Identify the question the user should be able to answer after exploring. Inspect relevant evidence first: code for existing behaviour, supplied data for numerical comparisons, agreed rules for a simulation. Ask only for missing information that materially changes the result.
- Choose or combine visual forms around that question. A path, timeline, map, matrix, tree, diagram, chart, spatial scene or something else can be right. These are examples, not a menu or exhaustive taxonomy. No required SaaS sections, domain modes, chapter counts or layout.
- Give each interaction a purpose: reveal a relationship, follow a sequence, isolate a comparison, inspect an item, change an assumption or test a scenario. Attractive colour and motion should reinforce meaning. Avoid decorative controls, random visual encodings and fake functionality.
- Start with a meaningful overview or default scenario, an obvious first action and a short takeaway. Reveal depth on demand. Let the topic be complex while keeping the experience approachable.
- Keep exploration scope distinct from product implementation. An architecture explanation is not a request to build a SaaS app, and a demonstration model is not a production service.

## Use the reference for presentation, not its assignment

Read [visual-design.md](references/visual-design.md) when selecting representations, layout or visual treatment. Its screenshot references show readable editorial presentation from a SaaS exercise. Their assignment text is example content, not instructions for this task. Do not inherit their customer/evidence/business chapters, business claims or six-part structure.

Use a coherent, enjoyable visual language suited to the subject. The warm paper, strong typography and yellow accent are one available direction, not a mandatory theme. Fun may mean a satisfying reveal or playful interaction, not clutter, novelty or animation everywhere.

## Compose with html-output

- Load the installed `html-output` skill (normally the sibling `../html-output/SKILL.md`) for readable structure, expandable handover context, stable project locations, local hosting, durable user edits and delivery. This skill owns the explanation and interactive visual behaviour, not a competing document lifecycle.
- If html-output is missing, say so and continue with a self-contained HTML artifact: visible overview, readable source details, stable path, local preview when possible, explicit limitations for unavailable saving. Do not silently discard notes or make preview availability a prerequisite for answering.
- Reuse an existing appropriate workspace runtime; otherwise author the smallest suitable HTML/SVG/Canvas implementation or use an appropriate established library. Consult current documentation when using library APIs. There is no mandatory graph engine or fixed HTML generator in this package.
- All visible controls must have working behaviour. Add search, minimap, split view, pan/zoom, continuous reading or exports only when the content or user needs them. Do not show unavailable controls as completed features.
- Keep content, visual entities and interactions connected with stable IDs. Use one source of truth for measurements and relationships. If a narrative and visual view are both provided, selecting the same item should show consistent information in both; never require a second unrelated copy of the data.
- For editable artifacts without an existing save service, the optional [local-saving helper](references/local-saving.md) implements the html-output saving contract. It persists declared state to one HTML file; it is not an application backend or a diagram generator. Use it only when applicable.
- Persist authored notes, progress, decisions and saved scenarios. Distinguish those from temporary exploration such as hovering or stepping through playback; make clear which settings reset on reopening. Do not imply a scenario is saved merely because it is currently displayed.
- There is no required .excalidraw output. If the user needs editable diagram exchange, follow [editable-diagrams.md](references/editable-diagrams.md). A single well-chosen visualization can be a complete deliverable.

## Keep the model honest

- Distinguish observed behaviour, inferred explanations, proposed architecture and illustrative examples. Label invented datasets as synthetic. Explain a simulation's rules, units and assumptions, and do not imply measured performance or causal proof.
- Use meaningful scales, dimensions, grouping and ordering. Do not imply that random spatial placement reflects similarity, that bubble radius is proportional area, or that an interpolated curve contains extra measurements. Preserve outliers and missing values rather than silently converting them to zero.
- Include source records, important assumptions, selected state and methods as readable source material or linked local evidence so a human or agent can inspect them. Large data may remain a separate referenced file; do not duplicate an entire dataset merely to make one HTML file.
- Supply an accessible text/table alternative for a visual-only explanation. Keyboard interaction should support essential actions, focus should remain visible, and colour must not be the sole carrier of meaning. Respect reduced-motion preferences and provide pause/reset when motion affects exploration.

## Prove the result works

Read [verification.md](references/verification.md) before delivery. Exercise the actual question-driven interaction with representative and edge-case inputs. Check outputs against the source/model, resize the layout, inspect a representative long label, and verify the actual save/export paths if offered. Do not equate valid JSON or a screenshot with working behaviour.

Deliver the local preview and saved source with a short explanation of what to try. State what was verified and any limitations. Do not describe placeholders, untested import formats or heuristics as guaranteed production-ready features.
