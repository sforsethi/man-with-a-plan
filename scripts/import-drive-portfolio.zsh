#!/bin/zsh
set -euo pipefail

root_dir="${0:A:h:h}"
manifest="${0:A:h}/drive-portfolio-assets.tsv"

export root_dir

cat "${manifest}" | xargs -P 8 -n 3 zsh -c '
  relative_path="$1"
  file_name="$2"
  file_id="$3"
  destination="${root_dir}/assets/portfolio/${relative_path}"
  mkdir -p "${destination}"
  curl -L --fail --silent --show-error --retry 3 \
    "https://drive.usercontent.google.com/download?id=${file_id}&export=download&confirm=t" \
    -o "${destination}/${file_name}"
' _
