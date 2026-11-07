# Contributing

Thanks for helping. This page is how work moves through this repository: issues, labels, the
project board, milestones, pull requests and releases. For building and testing, see
[Development](README.md#development); for a security problem, use a
[private report](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), never an issue.

## Issues

- Use a template. A bug report asks for the text of the viewer's **Details** panel, which says
  what happened without including your model.
- A new issue gets `needs-triage`. Triage gives it a type label, an `area:` label when one fits,
  a milestone when it is planned, and removes `needs-triage`.

## Labels

The labels live in [.github/labels.json](.github/labels.json) and are applied with
`mise run labels`. Change them there, not in GitHub's settings.

| Kind | Labels | Rule |
|---|---|---|
| Type | `bug`, `enhancement`, `documentation`, `security`, `i18n`, `accessibility`, `dependencies`, `ci` | Exactly one on every issue and pull request |
| Area | `area: gltf`, `area: stl`, `area: ply`, `area: obj`, `area: fbx`, `area: ui`, `area: rendering` | As many as apply |
| Status | `needs-triage`, `blocked`, `good first issue`, `help wanted`, `question` | While they are true |
| Resolution | `duplicate`, `invalid`, `wontfix` | When closing without a change, with the reason in a comment |

## Project board

Open issues and pull requests sit on the
[project board](https://github.com/users/momokun7/projects) in one of four columns: Inbox (new,
not triaged), Todo, In progress, and Done.

## Milestones

One milestone per release, named after its version (`v1.0.0`, `v1.1.0`). Planned issues and every
pull request go in the milestone of the release they ship in. A milestone has no due date; it
closes when its release is tagged.

## Pull requests

- Branch from `main` with a short prefix: `feat/`, `fix/`, `docs/`, `chore/`, `ci/`.
- Fill in the template: what changes and why, `Closes #` for the issue it resolves, the risk,
  and the commands you ran with their output.
- Assign it to yourself, give it a type label, and put it in a milestone.
- `mise run check` must pass, and so must CI. Pull requests are squash-merged, so the title
  becomes the commit on `main`: write it as a short sentence in the imperative ("Open STL files").

## Releases

1. Every pull request in the milestone is merged, and CI on `main` passes.
2. The version in `orca-plugin.json` matches the milestone.
3. Tag `vX.Y.Z` on `main`, publish a GitHub release with notes grouped by type label, and close the
   milestone.

## Translations

The viewer's text lives in `build/src/messages.ts` (English and Japanese) and
`build/src/locales/` (every other language Orca offers). The translations other than English and
Japanese were drafted by machine; corrections from native speakers are very welcome. Keep every
`{{placeholder}}` as it is; `npm test` checks them.
