# Verify the interaction, not just the shell

Scale verification to the artifact's real behaviour. Avoid arbitrary screenshot quotas and tests that merely match a heading.

## Content and interpretation

Confirm the displayed values and relationships agree with the source. Check one independently calculable outcome for simulations and derived metrics. Clearly label synthetic inputs, missing data and assumptions. Preserve units and explain non-obvious visual encodings.

Inspect visual claims too: a boundary must enclose exactly the actors it applies to. Do not fill gaps in supplied architecture with invented protocol details, logs, algorithms or guarantees just to make the visual look realistic. Label any necessary illustrative additions explicitly.

Read the saved HTML without executing JavaScript: the objective, source evidence, rules, notes and relevant current state should be recoverable. Do not rely on tooltips or a canvas as the only explanation.

## Interaction

Exercise the primary user journey rather than just loading the page: select or follow an item, change a relevant parameter, inspect the result, and reset. If two views are linked, verify they show the same entity and state. If selection is offered, handle missing/stale selections and empty filters meaningfully.

For controls that appear in the artifact, check applicable behaviours:

- Search/filter: a match, no match and clearing the filter.
- Zoom/pan: limits, reset/fit and reachability of content.
- Animation: pause and reduced-motion behaviour.
- Copy: successful copy or a visible selectable fallback; no false success.
- Export: downloaded artifact/data reflects the current state and reopens.
- Saved edits: wait for acknowledgement, inspect the source file and reopen. Check a failed save and a stale page do not silently overwrite or lose edits. Use the local-saving helper tests when that helper is used.

Do not add these controls merely to satisfy the checklist. A slider that changes no meaningful result or a canvas with placeholder text is not a working explorer.

## Layout and access

Check the normal desktop view and a narrow view, long labels and representative data extremes. Avoid overlap, clipping and unreachable controls. Verify essential actions with the keyboard and provide readable alternatives for graphical information. Do not rely on colour alone.

Escape source text and embedded data correctly. Test a literal closing-script sequence in authored text if interpolating JSON into a script. Do not let imported notes become executable markup.

## Delivery evidence

Record what was actually checked, and distinguish automated calculations, browser interaction and editor-import verification. Do not claim a capability you did not implement. If a preview or external editor is blocked, explain the specific limitation and deliver the saved artifact without bypassing that block.
