#!/bin/sh
set -eu

cd -- "$(dirname -- "$0")"

if [ ! -f dist/index.html ]; then
  printf '%s\n' 'Ошибка: не найден dist/index.html.' >&2
  exit 1
fi

deploy_version=$(date +%s)
repo_url=$(git remote get-url origin)
author_name=$(git config user.name)
author_email=$(git config user.email)
branch_ref=$(git ls-remote --heads origin refs/heads/gh-pages)
deploy_dir=$(mktemp -d /tmp/martin-gh-pages.XXXXXX)
trap 'rm -rf "$deploy_dir"' 0
trap 'exit 1' HUP INT TERM

git init -q "$deploy_dir"
git -C "$deploy_dir" remote add origin "$repo_url"

if [ -n "$branch_ref" ]; then
  git -C "$deploy_dir" fetch -q --depth=1 origin gh-pages
  git -C "$deploy_dir" checkout -q -b gh-pages FETCH_HEAD
  git -C "$deploy_dir" rm -qr --ignore-unmatch .
else
  git -C "$deploy_dir" checkout -q --orphan gh-pages
fi

cp -R dist/. "$deploy_dir/"
sed "s/{{version}}/$deploy_version/g" dist/index.html > "$deploy_dir/index.html"
touch "$deploy_dir/.nojekyll"
git -C "$deploy_dir" add -A

if git -C "$deploy_dir" diff --cached --quiet; then
  printf '%s\n' 'Изменений нет, сайт уже опубликован в этой версии.'
  exit 0
fi

git -C "$deploy_dir" -c user.name="$author_name" -c user.email="$author_email" \
  commit -qm 'Deploy website'
git -C "$deploy_dir" push origin gh-pages
