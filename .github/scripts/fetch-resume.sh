#!/bin/bash
set -e

REPO="ARC345/resume"
OUTPUT_DIR="assets/pdf"
OUTPUT_FILE="$OUTPUT_DIR/Arnav_Rastogi_CV.pdf"
DATA_FILE="_data/resume.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Fetching latest research resume from $REPO..."

# Get the latest research release tag
LATEST_TAG=$(gh release list -R "$REPO" --limit 20 --json tagName -q '.[] | select(.tagName | test("research")) | .tagName' 2>/dev/null | head -1)

if [ -z "$LATEST_TAG" ]; then
  echo "Error: Could not find any research release"
  exit 1
fi

echo "Using release tag: $LATEST_TAG"

# Download the PDF asset using gh CLI
mkdir -p "$OUTPUT_DIR"
gh release download "$LATEST_TAG" -R "$REPO" -p "Arnav_Rastogi_research.pdf" -O "$OUTPUT_FILE" --clobber 2>&1

if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
  FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
  echo "✅ Resume PDF updated successfully at $OUTPUT_FILE ($FILE_SIZE)"
else
  echo "Error: Failed to download resume"
  exit 1
fi

# Download the rendercv source from the same release and convert it into the
# JSON Resume data that drives the /cv/ page.
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT
gh release download "$LATEST_TAG" -R "$REPO" -p "Arnav_Rastogi_research.source.yaml" -D "$TMP_DIR" 2>&1
ruby "$SCRIPT_DIR/rendercv-to-jsonresume.rb" "$TMP_DIR/Arnav_Rastogi_research.source.yaml" "$DATA_FILE"
echo "✅ CV page data updated at $DATA_FILE"
