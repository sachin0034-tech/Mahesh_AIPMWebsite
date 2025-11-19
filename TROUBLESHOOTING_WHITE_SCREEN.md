# Troubleshooting White Screen on Netlify

## Common Causes and Solutions

### 1. Check Build Logs in Netlify
- Go to your site dashboard → Deploys → Click on the latest deploy
- Check if the build succeeded
- Look for any errors in the build logs

### 2. Verify Build Settings in Netlify Dashboard

**If netlify.toml is in the ROOT of your repo:**
- Base directory: `client`
- Build command: `npm run build` (or leave empty if in netlify.toml)
- Publish directory: `client/dist`

**If netlify.toml is in the CLIENT folder:**
- Base directory: `client`
- Build command: Leave empty (use netlify.toml)
- Publish directory: `dist` (relative to client folder)

### 3. Check Browser Console
- Open your deployed site
- Press F12 to open DevTools
- Check Console tab for JavaScript errors
- Check Network tab to see if files are loading

### 4. Verify File Paths
Common issues:
- Assets not loading (check if paths are absolute `/assets/...` not relative)
- Missing environment variables
- API calls failing

### 5. Test Build Locally
```bash
cd client
npm run build
npm run preview
```
If this works locally but not on Netlify, it's a configuration issue.

### 6. Check Environment Variables
- Go to Netlify → Site settings → Environment variables
- Make sure all required variables are set
- Restart the build after adding variables

### 7. Clear Cache and Redeploy
- In Netlify dashboard: Deploys → Trigger deploy → Clear cache and deploy site

## Quick Fixes to Try

### Fix 1: Update netlify.toml location
Move `netlify.toml` to the ROOT of your repository (not in client folder)

### Fix 2: Check Vite Base Path
Make sure vite.config.ts doesn't have a base path set (should be `/` for root deployment)

### Fix 3: Verify index.html
Make sure script src is `/src/main.tsx` (absolute path, not relative)

### Fix 4: Check for Build Errors
Look for TypeScript errors, missing dependencies, or import issues in build logs

