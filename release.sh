#!/bin/bash

# ─────────────────────────────────────────
# Release Script
# ─────────────────────────────────────────
# Promotes 'staging' into 'main' and cuts a new release.
#
# HOW TO USE (step by step):
#
#   1. Make sure whatever you want released has already landed on 'staging'
#      (via the normal develop -> staging promotion) and has been tested.
#
#   2. Check out 'staging' locally and make sure it's up to date:
#        git checkout staging
#        git pull origin staging
#
#   3. Decide the next version number (semver: MAJOR.MINOR.PATCH) and run
#      this script with it, prefixed with "v":
#############################################################################
#        ./release.sh v0.0.1
#############################################################################
#
#   4. The script will show you the target version (and the previous
#      release, if any) and ask for confirmation before it changes
#      anything. Type "y" to continue, anything else aborts safely.
#
#   5. From there it runs unattended: merges 'staging' into 'main', bumps
#      package.json's version, pushes 'main', creates + pushes the git tag,
#      then leaves you back on 'staging'. See "What it does" below for the
#      full breakdown.
#
#   6. When it finishes, the release is live: 'main' has the new code and
#      an annotated tag (e.g. `git show v0.0.1`) documents exactly what
#      changed since the previous release.
#
# Requirements:
#   - Must be run from the 'staging' branch (the script refuses otherwise).
#   - Working tree must be clean (commit/stash first).
#   - The version tag must not already exist.
#   - pnpm must be installed (used to bump package.json's version).
#
# What it does, in order:
#   1. Pulls 'staging', checks out and pulls 'main'.
#   2. Looks up the previous release tag (if any) and asks for confirmation.
#   3. Merges 'staging' into 'main'.
#   4. Bumps package.json's version to match the given tag and commits it.
#   5. Pushes 'main'.
#   6. Creates an annotated tag whose message lists the commits since the
#      previous release (or "Initial release." if there isn't one yet).
#   7. Pushes the tag, then checks out 'staging' again.
# ─────────────────────────────────────────

set -euo pipefail

error() {
  echo "ERROR: $1" >&2
  exit 1
}

# The whole script body is wrapped in this function and invoked as the very
# last line. Bash parses a function's full body (up to the closing brace)
# before executing any of it, so once main() starts running it is immune to
# on-disk changes to this file caused by the `git checkout`/`git merge`
# calls below.
main() {
  local version="${1:-}"

  # Step 1: Validate the version argument and preconditions before touching
  # any branch. Fail fast and loudly rather than partway through a merge.
  [[ -n "$version" && "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] \
    || error "Usage: ./release.sh vX.Y.Z (e.g. ./release.sh v0.0.1)"

  local current_branch
  current_branch=$(git branch --show-current)
  [[ "$current_branch" == "staging" ]] \
    || error "Must be run from 'staging' (currently on '${current_branch}')"

  [[ -z $(git status --porcelain) ]] \
    || error "Working tree is not clean. Commit or stash your changes first."

  git rev-parse "${version}" >/dev/null 2>&1 \
    && error "Tag '${version}' already exists"

  # Step 2: Make sure both branches match what's on origin before merging.
  echo "Syncing branches..."
  git pull origin staging       || error "Failed to pull 'staging' from origin"
  git checkout main             || error "Failed to checkout 'main'"
  git pull origin main          || error "Failed to pull 'main' from origin"

  # Step 3: Look up the previous release tag (empty if this is the very
  # first release) and ask for confirmation before making any changes.
  local prev_tag
  prev_tag=$(git describe --tags --abbrev=0 2>/dev/null || true)

  echo ""
  echo "About to release ${version} (staging -> main)."
  if [[ -n "$prev_tag" ]]; then
    echo "Previous release: ${prev_tag}"
  else
    echo "This is the initial release."
  fi
  read -r -p "Proceed? [y/N] " confirm
  [[ "$confirm" == "y" || "$confirm" == "Y" ]] || error "Aborted by user"

  # Step 4: Merge 'staging' into 'main'.
  echo "Merging 'staging' into 'main'..."
  git merge staging || error "Failed to merge 'staging' into 'main'"

  # Step 5: Bump package.json's (and pnpm-lock.yaml's) version to match the
  # tag, then commit that change on 'main'.
  echo "Bumping package.json version to ${version#v}..."
  pnpm version --no-git-tag-version "${version#v}" >/dev/null \
    || error "Failed to bump package.json version"
  git add package.json pnpm-lock.yaml
  git commit -m "chore(release): bump version to ${version}" \
    || error "Failed to commit version bump"

  # Step 6: Push the merge + version bump to 'main'.
  echo "Pushing 'main'..."
  git push origin main || error "Failed to push 'main' to origin"

  # Step 7: Build the changelog (commits since the previous release, or a
  # simple note if there wasn't one) and create the annotated tag with it.
  local changes
  if [[ -n "$prev_tag" ]]; then
    changes=$(git log "${prev_tag}"..HEAD --oneline)
  else
    changes="Initial release."
  fi

  echo "Tagging ${version}..."
  git tag -a "${version}" -m "Release ${version}

${changes}" || error "Failed to create tag '${version}'"

  # Step 8: Push the tag so the release is visible to everyone.
  git push origin "${version}" || error "Failed to push tag '${version}' to origin"

  # Step 9: Leave the repo back on 'staging', where releases are always run from.
  git checkout staging || error "Failed to return to 'staging'"

  # Step 10: Summarize what just happened.
  echo ""
  echo "Release ${version} completed successfully."
  echo "Tag: ${version}"
  if [[ -n "$prev_tag" ]]; then
    echo ""
    echo "Changes since ${prev_tag}:"
    echo "${changes}"
  fi
}

main "$@"
