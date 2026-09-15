# Personal agent reference bundle

[AGENTS.md](AGENTS.md) preserves my working guidelines, including YAGNI, type safety, focused tests, understanding the feature first, and treating questions as read-only. [skills/](skills/README.md) contains current reusable skills. [deprecated/](deprecated/) contains older versions for reference only.

This folder is a reference bundle for moving between devices. Copy the selected files into the global or project-specific locations supported by the target harness. The folder structure here is for storage; it does not imply automatic installation.

Use the current html-output skill when installing. The [original version](deprecated/html-output-original/SKILL.md) is archived and retains the same skill name. Do not install skills from deprecated/.

The [original explorable-systems package](deprecated/explorable-systems-original/SKILL.md) is also archived intact. Its generators are unfinished reference code; install the rebuilt version from skills/explorable-systems instead.

Example request for an agent on a new device:

> Read https://github.com/ManishModak/ManishModak/tree/main/.agents and install the current skills from skills/ and my AGENTS.md guidelines globally for [harness name] on this device. Check that harness's supported locations, preserve unrelated existing instructions, and flag conflicting preferences before overwriting them. Exclude everything in deprecated/ from installation.
