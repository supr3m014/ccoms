# Deployment Guide: Local Dev → GitHub → Hostinger

This guide explains the "Build-First" deployment strategy established for QR Seal. This workflow ensures that your live site is clean, fast, and secure while keeping your source code safe.

---

## 1. Resetting Git (Detaching & Re-attaching)

If you need to change which GitHub repository your project is "attached" to, follow these steps:

### Check Current Remote
```bash
git remote -v
```

### Detach/Remove Old Remote
```bash
git remote remove origin
```

### Attach New Remote
```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

---

## 2. The Branch Strategy
We use two distinct branches to separate "Blueprints" from the "Finished House."

1.  **`main` branch**: Contains your raw source code (`.tsx`, `.ts`, `tailwind.config.js`, etc.). This is what you work on.
2.  **`production` branch**: Contains ONLY the built files (`index.html`, `assets/`, `.htaccess`). This is what Hostinger serves to the world.

---

## 3. The Deployment Script (`deploy.sh`)

To automate the process of building the site and pushing it to the production branch, we use a custom script located at the root of the project.

### The Script Content
```bash
#!/bin/bash
# 1. Build the project (clean build)
npm run build

# 2. Navigate to the build output
cd dist

# 3. Initialize a temporary git repository inside 'dist'
git init -b main
git add .
git commit -m "Production deploy $(date)"

# 4. Force push the build to the 'production' branch
git remote add origin https://github.com/supr3m014/qrseal-app.git
git push -f origin main:production
```

### How to use it
We've linked this to an `npm` command in `package.json`. To update your live site, simply run:
```bash
npm run deploy
```

---

## 4. Hostinger Configuration (Advanced > GIT)

To make the site update automatically when you run the deploy script:

### A. Link the Repository
1.  Go to **Hostinger Panel > Advanced > GIT**.
2.  Add your Repository URL: `git@github.com:supr3m014/qrseal-app.git`
3.  **Branch**: Type `production` (lowercase).
4.  **Install Path**: Leave as `/` (to install in `public_html`).

### B. Enable Auto-Deployment (Webhooks)
1.  In Hostinger, click **Auto Deployment** and copy the **Webhook URL**.
2.  Go to your **GitHub Repo > Settings > Webhooks > Add webhook**.
3.  **Payload URL**: Paste the Hostinger URL.
4.  **Content type**: `application/json`.
5.  **Events**: Select "Just the push event."
6.  Save.

---

## 5. Security & Credentials

### Personal Access Tokens (PAT)
If GitHub denies permission (Error 403), use a PAT to authenticate:
```bash
git remote set-url origin https://USERNAME:TOKEN@github.com/USERNAME/REPO.git
```

### Environment Variables
Vite needs your Supabase keys during the build.
*   **Locally**: Stored in `.env`.
*   **Hostinger**: Set these in **Advanced > Node.js > Environment Variables** if you ever decide to build on the server (though we currently build locally for reliability).

---

## Summary of Workflow
1.  **Make changes** to code on your Mac.
2.  **Test** locally with `npm run dev`.
3.  **Deploy** to the world with `npm run deploy`.
4.  **Wait 10 seconds** and check your URL. 🚀
