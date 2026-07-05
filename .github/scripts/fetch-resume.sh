#!/bin/bash
set -e

REPO="ARC345/resume"
OUTPUT_DIR="assets/pdf"
OUTPUT_FILE="$OUTPUT_DIR/Arnav_Rastogi_CV.pdf"

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
