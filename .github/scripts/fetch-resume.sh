#!/bin/bash
set -e

REPO="ARC345/resume"
OUTPUT_DIR="assets/pdf"
OUTPUT_FILE="$OUTPUT_DIR/Arnav_Rastogi_CV.pdf"
DATA_FILE="_data/cv.yml"
TAG_FILE="assets/resume-tag.txt"

# ARC345/resume is private. Without a token that can read it (RESUME_TOKEN in
# CI), keep the copies committed in this repo rather than failing the build.
use_committed_copy() {
  if [ -s "$OUTPUT_FILE" ] && [ -s "$DATA_FILE" ]; then
    echo "::warning::Could not fetch from $REPO ($1); building with the committed resume ($(cat "$TAG_FILE" 2>/dev/null || echo unknown release))."
    exit 0
  fi
  echo "Error: $1, and no committed resume to fall back on"
  exit 1
}

echo "Fetching latest research resume from $REPO..."

# Get the latest research release tag
LATEST_TAG=$(gh release list -R "$REPO" --limit 20 --json tagName -q '.[] | select(.tagName | test("research")) | .tagName' 2>/dev/null | head -1)

if [ -z "$LATEST_TAG" ]; then
  use_committed_copy "could not find any research release"
fi

echo "Using release tag: $LATEST_TAG"

# Download into a scratch dir first so a partial failure never leaves the PDF
# and the CV data from different releases.
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT
gh release download "$LATEST_TAG" -R "$REPO" -D "$TMP_DIR" \
  -p "Arnav_Rastogi_research.pdf" -p "Arnav_Rastogi_research.source.yaml" 2>&1 ||
  use_committed_copy "could not download the $LATEST_TAG assets"

if [ ! -s "$TMP_DIR/Arnav_Rastogi_research.pdf" ] || [ ! -s "$TMP_DIR/Arnav_Rastogi_research.source.yaml" ]; then
  use_committed_copy "the $LATEST_TAG release is missing its PDF or source YAML"
fi

mkdir -p "$OUTPUT_DIR"
mv "$TMP_DIR/Arnav_Rastogi_research.pdf" "$OUTPUT_FILE"
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo "✅ Resume PDF updated successfully at $OUTPUT_FILE ($FILE_SIZE)"

# The release's rendercv source drives the /cv/ page directly (see _includes/cv/render.liquid).
mv "$TMP_DIR/Arnav_Rastogi_research.source.yaml" "$DATA_FILE"
echo "✅ CV page data updated at $DATA_FILE"

# Record which release this build used; resume-sync.yml compares it against
# the latest release to decide whether the deployed site is stale.
echo "$LATEST_TAG" > "$TAG_FILE"
