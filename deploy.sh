#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "🍺 The Last Cold Beer — deploy to GitHub + Vercel"
echo ""

# Remove any broken .git from sandbox attempts
if [ -d ".git" ]; then
  echo "Removing existing .git folder..."
  rm -rf .git
fi

# Fresh git init
git init
git branch -M main
git config user.email "posthusene@gmail.com"
git config user.name "Jonas Bergmann"

# Stage and commit
git add -A
git commit -m "Initial commit — The Last Cold Beer v1"

# Push to GitHub
git remote add origin https://github.com/jb-jonasberqmann/the-last-cold-beer.git
git push -u origin main

echo ""
echo "✅ Pushed to GitHub!"
echo ""
echo "Now opening Vercel to deploy..."
open "https://vercel.com/new/import?s=https://github.com/jb-jonasberqmann/the-last-cold-beer"
