#!/usr/bin/env python3
"""CI gate: the PR body must carry evidence taken on the current head commit.

Reads PR_BODY, HEAD_SHA and CHANGED_FILES (newline-separated) from the env.
- Docs-only PRs (only *.md / docs/**) pass.
- Otherwise the body needs an "## Evidence" section with "Commit: <sha>"
  matching HEAD_SHA (7+ hex chars), and a fenced block with command output.
- If files under UI_PATHS changed, the body also needs an image or video.
- The body links its task: "Fixes #N", "Closes #N" or "Part of owner/repo#N".
"""
import os
import re
import sys

UI_PATHS = [p for p in os.environ.get('UI_PATHS', '').split(',') if p]
DOC_RE = re.compile(r'(\.md$|^docs/|^\.gitignore$|^LICENSE$)')
ISSUE_RE = re.compile(r'\b(fix(es|ed)?|close[sd]?|resolve[sd]?|part of)\s+([\w.-]+/[\w.-]+)?#\d+', re.I)
MEDIA_RE = re.compile(
    r'(!\[[^\]]*\]\([^)]+\)|<img\s|<video\s|github\.com/user-attachments/'
    r'|\.(png|jpe?g|gif|webp|mp4|mov)\b)',
    re.I,
)


def fail(msg: str) -> int:
    print(f'::error::{msg}')
    print('Fill the Evidence section of the PR template (see AGENTS.md > Definition of done).')
    return 1


def main() -> int:
    body = os.environ.get('PR_BODY') or ''
    head = (os.environ.get('HEAD_SHA') or '').lower()
    files = [f for f in (os.environ.get('CHANGED_FILES') or '').splitlines() if f]
    if files and all(DOC_RE.search(f) for f in files):
        print('Docs-only PR: no evidence needed.')
        return 0
    if not ISSUE_RE.search(body):
        return fail('No linked issue. Add "Fixes #N" (or "Closes #N", "Part of owner/repo#N"). Open an issue first if there is none.')
    m = re.search(r'^##\s*Evidence\s*$(.*?)(?=^##\s|\Z)', body, re.M | re.S | re.I)
    if not m:
        return fail('No "## Evidence" section in the PR body.')
    evidence = m.group(1)
    c = re.search(r'Commit:\s*`?([0-9a-f]{7,40})`?', evidence, re.I)
    if not c:
        return fail('Evidence has no "Commit: <sha>" line.')
    sha = c.group(1).lower()
    if not head.startswith(sha):
        return fail(f'Evidence was taken on {sha}, but the PR head is {head[:12]}. Re-run and update it.')
    if not re.search(r'```.+?```', evidence, re.S) or re.search(r'```\s*scripts/verify\.sh output here\s*```', evidence):
        return fail('Evidence has no command output block.')
    ui = [f for f in files if any(f.startswith(p) for p in UI_PATHS)]
    if ui and not MEDIA_RE.search(body):
        return fail(f'UI files changed ({len(ui)}, e.g. {ui[0]}) but the PR has no screenshot or video.')
    print(f'Evidence OK for {head[:12]} ({len(files)} files, {len(ui)} UI).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
