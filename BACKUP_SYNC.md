# Backup sync via git submodules (no PAT)

`fts-admin` and `fts-employee` in this repo are **git submodules** linked to:

- https://github.com/brainandco/fts-admin (`main`)
- https://github.com/brainandco/fts-employee (`main`)

## How backup updates (company-friendly)

No personal access tokens. A GitHub Action in **this** repo:

- Runs **hourly** and bumps submodule pointers to latest `main`
- Can also be run **manually**: Actions → **Update app submodules** → Run workflow

Uses the default `GITHUB_TOKEN` only (same-repo push).

## Clone this backup repo

```bash
git clone --recurse-submodules git@github.com:BrainAndCompany/fasttechsolutions.git
# or after a normal clone:
git submodule update --init --recursive
```

## Workflow

- `.github/workflows/update-app-submodules.yml`
