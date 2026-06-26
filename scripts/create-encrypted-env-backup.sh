#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/Users/rogersmwombekimulima/Documents/New project/skolrfinal-restored"
SOURCE_FILE="$PROJECT_DIR/.env.local"
OUTPUT_DIR="$PROJECT_DIR/backups"
OUTPUT_FILE="$OUTPUT_DIR/skolr-env-backup.zip"

mkdir -p "$OUTPUT_DIR"

if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "Missing source file: $SOURCE_FILE"
  exit 1
fi

rm -f "$OUTPUT_FILE"

echo "Creating encrypted backup at:"
echo "  $OUTPUT_FILE"
echo
echo "You will be prompted for a password. Keep it somewhere safe."

cd "$PROJECT_DIR"
zip -j -e "$OUTPUT_FILE" "$SOURCE_FILE"

echo
echo "Done."
echo "Next: upload this file to Google Drive."
