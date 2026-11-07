# Notes for Claude Code

How this repository is worked on: [CONTRIBUTING.md](CONTRIBUTING.md). Building and testing: the
Development section of the README; `mise run check` runs everything CI runs.

## README and other translated documents

The README exists in eleven languages: `README.md` (English, the one GitHub shows) and
`docs/i18n/README.<language>.md` for the others. Change them in two steps:

1. Change the Japanese README (`docs/i18n/README.ja.md`) only, and stop. The maintainer reviews it.
2. Once the maintainer has approved the Japanese text, bring `README.md` and every other language
   in line with it, in one pull request.

Do not change the English or any other language before step 1 is approved, even for a small fix.

## Images

Orca installs every tracked file, so the README's images and GIFs live on the `readme-media`
branch and the READMEs link them by `raw.githubusercontent.com` URL. Only what the manifest names
(`assets/icon.png`, `docs/images/plugin-page/`) stays on `main`. Add or replace README media with
a commit to `readme-media`; it refuses force-pushes and deletion.
