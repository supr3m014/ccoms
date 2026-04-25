#!/bin/bash
# CComs Production Deployment Script (Path B - Static Export)
# This mimics the QR Seal workflow for Hostinger Advanced > GIT

echo "🚀 Starting Production Build..."

# 1. Build the project (This creates the 'out' folder)
npm run build

# 2. Check if build was successful
if [ ! -d "out" ]; then
  echo "❌ Build failed! 'out' folder not found."
  exit 1
fi

# 3. Create a temporary deployment directory and preserve history
echo "📦 Preparing production files (preserving history)..."
rm -rf deploy_temp
git clone -b production https://soothsayerpg:REDACTED_REVOKE_THIS_TOKEN@github.com/supr3m014/ccoms.git deploy_temp

# 4. Update files (excluding .git)
cd deploy_temp
# Remove everything except .git folder
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
# Copy new build files (including hidden files like .htaccess)
cp -a ../out/. .

# 5. Commit and push
git add .
git commit -m "Production deploy $(date)"
echo "⬆️ Pushing to GitHub production branch..."
git push origin production

# 6. Cleanup
cd ..
rm -rf deploy_temp

echo "✅ Deployment Complete! Hostinger will now pull the clean HTML/CSS/JS files."
