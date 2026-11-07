# Security Policy

## Supported Versions

Security fixes are released for the latest version of the plugin.

## Reporting a Vulnerability

If you discover a security vulnerability in 3D Viewer, please report it responsibly.

**Do NOT open a public issue.**

Instead, use **GitHub's [private vulnerability reporting](https://github.com/momokun7/orca-3d-viewer/security/advisories/new)** feature on this repository.

## Response Timeline

- Acknowledgment: best effort (typically within a few days)
- Fix release: as soon as practical

## Scope

The viewer opens files people did not write themselves, so a model is untrusted input.

- A model that makes the viewer run code, inject markup, or reach the network or file system
- A model that crashes or hangs the viewer or Orca, or exhausts memory beyond Orca's 64 MiB file cap
- The viewer writing to, or asking Orca for anything beyond reading, the open file
- The committed `editor/` bundle differing from what `build/` produces from this repository's sources

Bugs in three.js, Draco or meshoptimizer themselves are best reported upstream; tell us too if the
viewer exposes them.

## How the viewer is contained

- It runs in Orca's isolated plugin frame: its own process, a strict Content-Security-Policy, and no
  network. The manifest asks for no capabilities, worker or commands.
- It reads the document Orca sends and never edits it, saves it or calls any other Orca API.
- URIs inside a model never reach a loader: only `data:` and the frame's own `blob:` URLs pass.
- Text from a model is shown with `textContent`, never parsed as HTML.
- CI runs the viewer in Chromium under Orca's frame policy with hostile and fuzzed models, checks the
  committed bundle is reproducible, and scans dependencies, workflows, history and commit messages.
