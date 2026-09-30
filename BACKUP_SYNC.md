# Backup sync via git submodules

`fts-admin` and `fts-employee` in this repo are **git submodules** linked to:

- https://github.com/brainandco/fts-admin (`main`)
- https://github.com/brainandco/fts-employee (`main`)

When either source repo gets a push to `main`, Actions bumps the submodule pointer here and commits.

## Clone this backup repo

```bash
git clone --recurse-submodules git@github.com:BrainAndCompany/fasttechsolutions.git
# or after a normal clone:
git submodule update --init --recursive
```

## One-time secret setup

Create a GitHub PAT that can write to `BrainAndCompany/fasttechsolutions`, then add:

| Repo | Secret | Purpose |
|------|--------|---------|
| `brainandco/fts-admin` | `BACKUP_DISPATCH_TOKEN` | Trigger backup update on push |
| `brainandco/fts-employee` | `BACKUP_DISPATCH_TOKEN` | Trigger backup update on push |
| `BrainAndCompany/fasttechsolutions` | `BACKUP_SYNC_TOKEN` (optional) | Only if branch protection blocks `GITHUB_TOKEN` pushes |

## Workflows

- This repo: `.github/workflows/update-app-submodules.yml`
- Source repos: `.github/workflows/notify-backup-sync.yml`

Manual test: Actions → **Update app submodules** → Run workflow → `both`.
