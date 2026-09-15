# Editable diagram exchange, when needed

An interactive explanation does not automatically need an Excalidraw export. Offer one when the user asks for an editable board or when diagram editing is part of the task. Keep exports consistent with the represented system and current saved state.

Use a maintained exporter or the target editor's documented format. Verify current documentation before depending on its API or schema. The original package's hand-built Excalidraw generator is archived; it is not part of this skill's active toolchain.

For an exported diagram, verify in the target editor when available:

- The file imports and can be saved and reopened without losing content.
- Moving a card keeps its text and badges attached or grouped appropriately.
- Moving connected nodes updates the connectors and their labels as intended.
- Long titles, URLs and multiline text remain readable within their containers. Character counts alone do not prove fit; use actual font/layout measurement and inspect representative output.
- Connector routing matches the flow and avoids obscuring labels, including loops and vertical or reverse-direction relationships.
- Labels, relationships and source identifiers correspond to the HTML view. Exported static diagrams need not reproduce interactive simulation behaviour; explain the boundary.

If the target editor cannot be tested, report export validation as limited. Parsing as JSON is not proof of editor compatibility. Never advertise “zero overflow” for all inputs based on one small example.
