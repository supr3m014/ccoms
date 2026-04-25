# Hostinger Ghost Directory Cleanup Guide

As we identified, Hostinger's Git Deployment system often fails to delete empty directories when files are moved or removed in the repository. These are known as **Ghost Directories**.

Because Apache processes physical directories *before* it processes most `.htaccess` rewrite rules, the presence of an empty `case-studies` folder on your server will immediately trigger a 403 Forbidden error, completely ignoring our `case-studies.html` file and our `.htaccess` bypass rules.

Since Git cannot delete directories on the remote server, **you must delete these Ghost Directories manually.**

## Step-by-Step Instructions

1. **Log in to Hostinger**: Go to your Hostinger hPanel for `ccoms.ph`.
2. **Open File Manager**: Navigate to **Files > File Manager**.
3. **Go to the Public HTML Directory**: Open the directory where your site is deployed (usually `public_html`).
4. **Locate the Ghost Directories**: Look for the following folders that should no longer exist at the root level:
   - `case-studies`
   - `admin` (if you are experiencing similar issues there)
   - Any other page name that you have converted from a folder to a root `.html` file.
5. **Delete the Folders**: Right-click the empty `case-studies` folder (ensure it is empty or only contains an empty `proofs` folder, as we moved the real images to `assets/case-studies`) and click **Delete**.
6. **Clear Server Cache**: If you are using Hostinger's built-in Cache Manager or LSCache, clear it.
7. **Test**: Open an incognito window and visit `https://ccoms.ph/case-studies/`. The 403 error should be permanently gone.
