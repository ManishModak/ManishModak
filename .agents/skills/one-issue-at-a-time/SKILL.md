---
name: one-issue-at-a-time
description: Guide a user through issues and fix decisions one at a time with short explanations, concrete examples, and an evolving agreed plan. Use when the user wants to understand before implementing, asks to tackle items one by one, or expresses reading fatigue during a planning discussion. Not a replacement for an explicitly requested full report or autonomous implementation.
---

# One issue at a time

Help the user understand, decide, and move forward without overwhelming them. Use normal, clear sentences; brevity should not remove the explanation they need.

## Pace the conversation

- Focus on the current issue. Keep remaining issues in a small working queue instead of repeating the entire backlog.
- Lead with the direct answer. Explain what happened and why it matters, then propose the simplest sound fix. Usually a few short paragraphs or three to five bullets are enough; adapt to the question rather than enforcing a word count.
- Use one concrete before/after example when the user is confused. Explain differently instead of repeating the same abstraction. Avoid introducing adjacent concerns until needed.
- If the user asks several questions together, answer each briefly without requiring them to repeat the others.
- When asked to move on, give the next issue a short explanation. Do not unload all its implementation details at once or end every answer with a permission question.

## Make decisions understandable

- Keep explanations simple, not solutions superficial. Fix root causes and choose the simplest sound design. Break complex work into understandable decisions; don’t sacrifice correctness or maintainability to make a fix smaller.
- Understand the feature and inspect relevant evidence before diagnosing. Distinguish observed facts, likely causes, and unverified possibilities. Do not claim an inspection that has not happened.
- Prefer one recommended approach with a plain reason. Offer alternatives only when a real tradeoff needs the user's choice. Avoid introducing extra systems, strict limits or blocking behaviour without a concrete need.
- When asked how a tool or API would actually work, show a small example input and describe the corresponding behaviour. Identify new parameters as proposed, not already implemented. Follow any applicable documentation requirements.
- Treat missing information as unknown, not automatically wrong. Where safe and useful, continue with a clear qualification. Known conflicts still need action; do not obscure them to keep the flow moving.
- Accept supported corrections. Drop an issue when its premise is wrong rather than inventing a replacement concern. Avoid judging current source data solely by remembered expectations.

## Preserve agreement and scope

- During a discussion, “works” or “looks good” agrees to the idea; it does not automatically authorize implementing application changes. “Add it to the plan” authorizes updating the plan. Follow explicit implementation requests when they arrive.
- When a plan is requested, maintain one artifact in the user's chosen format. If they request HTML, use a simple readable document with numbered actions and short closure criteria; use a relevant artifact skill when available.
- Add decisions as they are agreed. Mark dropped items, deferred work and unresolved details explicitly. Do not quietly add optional suggestions as approved requirements.
- Keep stable issue numbers and distinguish a revision from a new issue. Update stale status text when decisions change.
- After a plan edit, confirm briefly and address the next requested topic. Do not paste the whole plan back into chat.
- When asked whether planning is complete, answer honestly: identify any remaining decision and distinguish “plan ready” from “implemented and verified.” Do not keep opening hypothetical issues after the agreed scope is settled.

## Example of the desired explanation

User: “I don’t understand why this failed.”

Assistant: “The assistant requested 20 products, but the tool accepts at most 12. It returned an error instead of products. A simple fix is to return 12 and say that the result was capped.”

This illustrates the explanation style, not a universal rule to cap every tool at 12.
