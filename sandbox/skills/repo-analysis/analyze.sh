#!/usr/bin/env bash
# analyze.sh <repo-path>
# Outputs a single JSON object with all analysis data.
set -uo pipefail

REPO="${1:-/workspace/repo}"

# --- Language breakdown: count files by extension ---
LANG_JSON=$(
  find "$REPO" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/.next/*" \
    | sed 's/.*\.//' | tr '[:upper:]' '[:lower:]' \
    | sort | uniq -c | sort -rn | head -15 \
    | awk '{printf "{\"ext\":\"%s\",\"count\":%d},", $2, $1}' \
    | sed 's/,$//'
)

# --- Package.json (cap at 100 lines) ---
PKG_JSON=$(cat "$REPO/package.json" 2>/dev/null | head -100 || echo '{}')

# --- Top 30 source files by line count ---
FILES_JSON=$(
  find "$REPO" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
       -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.md" \
       -o -name "*.css" -o -name "*.html" \) \
    | xargs wc -l 2>/dev/null \
    | grep -v "^ *0 " | grep -v " total$" \
    | sort -rn | head -30 \
    | awk -v repo="$REPO/" '{
        path = $2
        sub(repo, "", path)
        n = split(path, parts, "/")
        dir = (n > 1) ? parts[1] : "."
        printf "{\"path\":\"%s\",\"lines\":%d,\"directory\":\"%s\"},", path, $1, dir
      }' \
    | sed 's/,$//'
)

# --- Lizard complexity: use --csv for reliable parsing ---
COMPLEXITY_RAW=$(lizard "$REPO" --exclude "*/node_modules/*" --exclude "*/dist/*" --csv 2>/dev/null || echo "")

COMPLEXITY_JSON=$(
  echo "$COMPLEXITY_RAW" \
    | awk -F',' 'NR>1 && NF>=6 {
        # CSV columns: NLOC,CCN,token,PARAM,length,location,file,function,start,end
        ccn=$2+0
        file=$7
        if (ccn > 0 && file != "") {
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", file)
          printf "{\"file\":\"%s\",\"score\":%d},", file, ccn
        }
      }' \
    | sed 's/,$//'
)

echo "{\"langCounts\":[${LANG_JSON}],\"packageJson\":${PKG_JSON},\"topFiles\":[${FILES_JSON}],\"complexity\":[${COMPLEXITY_JSON}]}"
