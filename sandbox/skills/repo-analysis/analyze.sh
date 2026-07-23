#!/usr/bin/env bash
# analyze.sh <repo-path>
# Outputs a single JSON object with all analysis data.
set -uo pipefail

REPO="${1:-/workspace/repo}"
# Resolve to absolute path so lizard output can be filtered to this tree only.
REPO="$(cd "$REPO" 2>/dev/null && pwd)" || { echo '{"error":"repo not found"}'; exit 1; }

# Shared find exclusions (vendor/build/cache dirs)
EXCLUDE=(
  -not -path "*/node_modules/*"
  -not -path "*/.git/*"
  -not -path "*/dist/*"
  -not -path "*/.next/*"
  -not -path "*/build/*"
  -not -path "*/coverage/*"
  -not -path "*/vendor/*"
  -not -path "*/__pycache__/*"
  -not -path "*/.venv/*"
  -not -path "*/venv/*"
  -not -name "*.d.ts"
  -not -name "*.min.js"
  -not -name "*.min.css"
  -not -name "*.map"
)

# --- Language breakdown: count files by extension ---
LANG_JSON=$(
  find "$REPO" -type f "${EXCLUDE[@]}" \
    | sed 's/.*\.//' | tr '[:upper:]' '[:lower:]' \
    | sort | uniq -c | sort -rn | head -15 \
    | awk '{printf "{\"ext\":\"%s\",\"count\":%d},", $2, $1}' \
    | sed 's/,$//'
)

# --- Package.json (cap at 100 lines) ---
PKG_JSON=$(cat "$REPO/package.json" 2>/dev/null | head -100 || echo '{}')

# --- Top 30 source files by line count (no declaration/minified files) ---
FILES_JSON=$(
  find "$REPO" -type f "${EXCLUDE[@]}" \
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

# --- Lizard complexity: CSV parse, filter noise, max-CCN per file, top 10 ---
COMPLEXITY_RAW=$(
  lizard "$REPO" \
    --exclude "*/node_modules/*" \
    --exclude "*/dist/*" \
    --exclude "*/.git/*" \
    --exclude "*/.next/*" \
    --exclude "*/build/*" \
    --exclude "*/coverage/*" \
    --exclude "*/vendor/*" \
    --exclude "*/__pycache__/*" \
    --exclude "*/.venv/*" \
    --exclude "*/venv/*" \
    --exclude "*.d.ts" \
    --exclude "*.min.js" \
    --csv 2>/dev/null || echo ""
)

COMPLEXITY_JSON=$(
  echo "$COMPLEXITY_RAW" \
    | awk -F',' -v repo="$REPO/" '
        NR>1 && NF>=7 {
          # CSV: NLOC,CCN,token,PARAM,length,location,file,function,start,end
          ccn=$2+0
          file=$7
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", file)
          # Keep only files inside the cloned repo tree
          if (index(file, repo) != 1) next
          rel = file
          sub(repo, "", rel)
          # Drop declaration files and empty paths
          if (rel == "" || rel ~ /\.d\.ts$/) next
          if (ccn > max[rel]) max[rel] = ccn
        }
        END {
          n = 0
          for (f in max) {
            n++
            files[n] = f
            scores[n] = max[f]
          }
          # Sort descending by score (simple selection sort; n is small)
          for (i = 1; i <= n; i++) {
            for (j = i + 1; j <= n; j++) {
              if (scores[j] > scores[i]) {
                t = scores[i]; scores[i] = scores[j]; scores[j] = t
                t = files[i]; files[i] = files[j]; files[j] = t
              }
            }
          }
          limit = (n < 10) ? n : 10
          for (i = 1; i <= limit; i++) {
            printf "{\"file\":\"%s\",\"score\":%d}%s", files[i], scores[i], (i < limit ? "," : "")
          }
        }'
)

echo "{\"langCounts\":[${LANG_JSON}],\"packageJson\":${PKG_JSON},\"topFiles\":[${FILES_JSON}],\"complexity\":[${COMPLEXITY_JSON}]}"
