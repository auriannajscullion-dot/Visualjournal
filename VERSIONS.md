# ✦ daydream — version naming rule ✦

## the convention: `V1.XX`

Every working branch of this app gets a version number in the form **`V1.XX`**,
where `XX` increases by **1** for each new branch/session, regardless of how big
or small the changes are. The version belongs to the *branch*, not to individual
commits — all commits on a branch share its version.

### rules

1. **One branch = one version.** When a new working branch is created, it takes
   the next unused number: `V1.<latest XX + 1>`.
2. **Record it here.** Add a row to the table below *on the same branch*, so the
   mapping is never lost.
3. **`package.json` tracks it.** The `version` field mirrors the current branch's
   number as `1.XX.0` (e.g. `V1.24` → `"version": "1.24.0"`).
4. **Reference it everywhere else.** PR titles and release notes should lead with
   the version, e.g. `V1.24 — fix collage rendering mismatches`.
5. **Numbers are never reused**, even if a branch is abandoned.

### how to pick the next number

Look at the highest `XX` in the table below and add 1. That's it.

## version history

| version | branch                            | date       | summary |
|---------|-----------------------------------|------------|---------|
| V1.23   | `claude/optimistic-franklin-rthFy`| 2026-07    | Runaway useEffect fix, random bg fix, null-stroke crash fix, kawaii sticker tab, 10 brush types, book-style scrapbook + TOC, collage preview fixes |
| V1.24   | `claude/pensive-pasteur-7vxgzh`   | 2026-07-10 | "Saved ≠ created" fixes: match editor/view rotation pivot, brush-aware saved strokes, design-unit scaling across devices, un-squashed scrapbook page, settings modal no longer reverts saved changes, kawaii stickers kept out of the photo album |
| V1.25   | `claude/v1.25-app-improvements-brainstorm` | 2026-07-12 | IMPROVEMENTS.md — extensive code + UX future-upgrades brainstorm from a full-codebase audit (docs only, no app code changes) |

*(Versions before V1.23 predate this file; their branch names were not recorded.)*
