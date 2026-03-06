#!/bin/bash
# Sync Help Scout Docs articles to local markdown files
# Usage: HELPSCOUT_DOCS_API_KEY=xxx ./scripts/sync-docs.sh

set -euo pipefail

API_KEY="${HELPSCOUT_DOCS_API_KEY:?Set HELPSCOUT_DOCS_API_KEY}"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)/knowledge"
COLLECTION_ID="5acb573a2c7d3a0e93671f35"

# Category ID to folder mapping
declare -A CAT_MAP=(
  ["664c7045463661770bfaf0aa"]="administratief"
  ["664c704f463661770bfaf0ab"]="directadmin"
  ["5acccf172c7d3a0e93672f4f"]="domeinnamen"
  ["5acb57952c7d3a0e93671f40"]="e-mail"
  ["664c706e804514782072afcf"]="mijn-keurigonline"
  ["5acb57a42c7d3a0e93671f42"]="technisch"
  ["5acb573a2c7d3a0e93671f36"]="uncategorized"
)

# Ensure directories exist
for folder in "${CAT_MAP[@]}"; do
  mkdir -p "$BASE_DIR/$folder"
done

# Fetch all published articles
echo "Fetching articles from Help Scout Docs API..."
ARTICLES=$(curl -sf "https://docsapi.helpscout.net/v1/collections/$COLLECTION_ID/articles?pageSize=100&status=published" \
  -u "$API_KEY:X")

COUNT=$(echo "$ARTICLES" | jq '.articles.count')
echo "Found $COUNT articles"

# Process each article
SYNCED=0
echo "$ARTICLES" | jq -r '.articles.items[] | .id' | while read -r ARTICLE_ID; do
  ARTICLE=$(curl -sf "https://docsapi.helpscout.net/v1/articles/$ARTICLE_ID" -u "$API_KEY:X")

  NAME=$(echo "$ARTICLE" | jq -r '.article.name')
  SLUG=$(echo "$ARTICLE" | jq -r '.article.slug')
  TEXT=$(echo "$ARTICLE" | jq -r '.article.text')
  URL=$(echo "$ARTICLE" | jq -r '.article.publicUrl')

  # Determine folder from category
  FOLDER="uncategorized"
  for CID in "${!CAT_MAP[@]}"; do
    if echo "$ARTICLE" | jq -r '.article.categories[]?' | grep -q "$CID"; then
      FOLDER="${CAT_MAP[$CID]}"
      break
    fi
  done

  # Convert HTML to markdown (best-effort)
  FILEPATH="$BASE_DIR/$FOLDER/$SLUG.md"
  {
    echo "# $NAME"
    echo ""
    echo "> Bron: $URL"
    echo ""
    echo "$TEXT" | sed \
      -e 's/<br\s*\/?>/\n/g' \
      -e 's/<\/p>/\n\n/g' \
      -e 's/<p[^>]*>//g' \
      -e 's/<strong>\([^<]*\)<\/strong>/**\1**/g' \
      -e 's/<em>\([^<]*\)<\/em>/*\1*/g' \
      -e 's/<code>\([^<]*\)<\/code>/`\1`/g' \
      -e 's/<h1[^>]*>\([^<]*\)<\/h1>/# \1/g' \
      -e 's/<h2[^>]*>\([^<]*\)<\/h2>/## \1/g' \
      -e 's/<h3[^>]*>\([^<]*\)<\/h3>/### \1/g' \
      -e 's/<li>/- /g' \
      -e 's/<\/li>//g' \
      -e 's/<ul>//g' \
      -e 's/<\/ul>//g' \
      -e 's/<ol>//g' \
      -e 's/<\/ol>//g' \
      -e 's/<a href="\([^"]*\)"[^>]*>\([^<]*\)<\/a>/[\2](\1)/g' \
      -e 's/<img[^>]*src="\([^"]*\)"[^>]*alt="\([^"]*\)"[^>]*>/![\2](\1)/g' \
      -e 's/<img[^>]*src="\([^"]*\)"[^>]*>/![](\1)/g' \
      -e 's/<[^>]*>//g' \
      -e 's/&amp;/\&/g' \
      -e 's/&lt;/</g' \
      -e 's/&gt;/>/g' \
      -e 's/&nbsp;/ /g' \
      -e 's/&quot;/"/g' \
      -e "s/&#39;/'/g"
  } > "$FILEPATH"

  echo "  $FOLDER/$SLUG.md"
  sleep 0.1
done

echo ""
echo "Sync complete! Articles saved to $BASE_DIR/"
