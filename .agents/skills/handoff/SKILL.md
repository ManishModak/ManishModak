---
name: handoff
description: Summarize the current conversation so a fresh agent can continue, selecting the essential context and using html-output for readable, durable handover artifacts. Use when the user requests a handoff or context transfer to another session.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

# Handoff

Prepare the context the next agent needs to continue the user's intended work. If the user supplies a next-session focus, tailor the handoff to it. A handoff is not permission to perform the unfinished work now.

## Select the context

- Capture the objective, agreed scope, constraints, important decisions and their reasons, completed work, remaining work, blockers and the next useful action. Distinguish proposed, implemented and verified states.
- Include relevant file paths, repository/branch or commit references when useful, checks actually performed, and important saved user notes. Do not copy raw reasoning traces or the entire conversation.
- Include a short suggested-skills section with only skills relevant to the next task. Use portable invocation names, not a harness-specific tool command.
- Exclude credentials, secrets and unnecessary personal information. Preserve useful non-sensitive context; do not put private tokens in URLs or copied prompts.

## Reuse or create the artifact

1. Check for an existing plan or handover artifact. If it already captures the work, update its handover section with missing current context and preserve its saved notes and progress. Do not create a second document repeating it.
2. Reference existing specs, decisions, issues, commits and diffs by actual path or URL instead of duplicating their contents. Include enough summary to explain why each reference matters.
3. Load the available `html-output` skill when creating or editing HTML. It owns presentation, expandable details, durable location, local hosting, source-file persistence and copyable handover prompts; do not recreate those rules here. In a standard skills bundle it is the sibling `../html-output/SKILL.md`.
4. If no suitable artifact exists, create a focused handover using that skill. Respect an explicitly requested alternative format. If html-output is unavailable, say so briefly and use a readable document in a stable project/output location; never make an OS temporary directory the sole handover copy.

## Finish the handoff

- Check that the next agent can recover the task from the saved artifact and its references without access to this conversation.
- Provide the artifact path, local preview URL when available, and a concise copyable continuation prompt. The prompt must reflect the user's intended next action—review, discussion or implementation—without escalating its scope.
- Point the next agent to the saved source when the preview is stopped or inaccessible. Include relevant suggested skills in the artifact, and update the same artifact as work continues.
