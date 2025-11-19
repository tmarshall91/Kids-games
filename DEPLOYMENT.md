# Deployment Guide

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Automatic Deployment Setup

### Prerequisites

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys the site when changes are pushed to the main branch.

### Enable GitHub Pages

1. **Go to Repository Settings:**
   - Navigate to your repository on GitHub
   - Click on **Settings** tab
   - Scroll down to **Pages** in the left sidebar

2. **Configure GitHub Pages:**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy on the next push to main

3. **Verify Deployment:**
   - Go to the **Actions** tab to see the deployment workflow running
   - Once complete, your site will be available at:
     ```
     https://YOUR-USERNAME.github.io/Kids-games/
     ```

### Manual Deployment

You can also trigger a deployment manually:

1. Go to the **Actions** tab
2. Select **Deploy Kids Games to GitHub Pages** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## What Gets Deployed

The GitHub Actions workflow deploys the entire repository as static files:

- `index.html` - Main catalog page listing all games
- `games/` - Directory containing all 147+ games
- `template/` - Game template for developers
- All documentation files (README.md, CONTRIBUTING.md, etc.)

## Accessing Your Deployed Site

Once deployed, you can:

- **Browse the catalog:** Visit the main page to see all games
- **Play games:** Click on any game card to play
- **Share with others:** Send the GitHub Pages URL to friends and family
- **Play on mobile:** The site is fully mobile-responsive

## Site URL Format

Your site will be available at:
```
https://[YOUR-GITHUB-USERNAME].github.io/[REPOSITORY-NAME]/
```

For example:
- `https://tmarshall91.github.io/Kids-games/`

## Troubleshooting

### Deployment Failed

If the deployment fails:

1. Check the **Actions** tab for error messages
2. Ensure GitHub Pages is enabled in Settings > Pages
3. Verify the workflow has proper permissions (should be set automatically)

### Pages Not Updating

If changes don't appear:

1. Wait a few minutes for propagation
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache

### 404 Errors

If you get 404 errors on game pages:

1. Ensure all game paths in `index.html` are relative (e.g., `games/whack-a-mole/index.html`)
2. Check that game files exist in the repository
3. Verify there are no typos in file paths

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the root directory with your domain
2. Configure DNS settings at your domain provider
3. Update GitHub Pages settings to use your custom domain

## Local Testing

Before deployment, test locally:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000
```

Then visit `http://localhost:8000` in your browser.

## Security Notes

- All games run entirely in the browser (client-side only)
- No server-side code or database
- No user data collection or tracking
- Safe for kids to use

## Updates

To update the deployed site:

1. Make changes to your code
2. Commit changes to your branch
3. Push to GitHub or merge to main
4. GitHub Actions will automatically redeploy

---

**Questions?** Check the main README.md or open an issue on GitHub.
