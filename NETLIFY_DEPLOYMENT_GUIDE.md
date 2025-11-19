# Deploy Client Folder to Netlify using GitHub

## Prerequisites
- GitHub account with your repository
- Netlify account (free tier works)
- Your code pushed to GitHub

## Step-by-Step Guide

### Step 1: Push Your Code to GitHub
```bash
# Make sure all changes are committed
git add .
git commit -m "Your commit message"
git push origin main
```

### Step 2: Connect GitHub to Netlify

1. **Go to Netlify**
   - Visit [netlify.com](https://www.netlify.com)
   - Sign in or create a free account
   - Click "Add new site" → "Import an existing project"

2. **Connect to GitHub**
   - Click "GitHub" or "Git" button
   - Authorize Netlify to access your GitHub account
   - Select your repository from the list

### Step 3: Configure Build Settings

Since your client folder is in a subdirectory, configure these settings:

**Base directory:**
```
client
```

**Build command:**
```
npm run build
```
or if using yarn:
```
yarn build
```

**Publish directory:**
```
client/dist
```
or if using Create React App:
```
client/build
```

**Node version (if needed):**
```
18
```
or
```
20
```

### Step 4: Environment Variables (if needed)

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Add any environment variables your app needs
3. You can reference your `env.example` file for required variables

### Step 5: Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Clone your repository
   - Install dependencies
   - Run the build command
   - Deploy to a unique URL

### Step 6: Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your domain

## Important Configuration Files

### Create `netlify.toml` in your client folder (Recommended)

Create `client/netlify.toml`:

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Or use `_redirects` file

Create `client/public/_redirects`:
```
/*    /index.html   200
```

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure Node version matches your local environment
- Verify all dependencies are in `package.json`

### 404 Errors on Routes
- Add the redirects configuration above
- Ensure your router is configured for client-side routing

### Environment Variables Not Working
- Make sure they're set in Netlify dashboard
- Restart the build after adding variables
- Use `VITE_` prefix for Vite projects

## Continuous Deployment

Once connected, Netlify will automatically:
- Deploy on every push to your main branch
- Create preview deployments for pull requests
- Show build status in GitHub

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Base directory set to `client`
- [ ] Build command configured
- [ ] Publish directory set correctly
- [ ] Environment variables added (if needed)
- [ ] Redirects configured for SPA routing
- [ ] First deployment successful

## Alternative: Deploy from CLI

You can also use Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to client folder
cd client

# Initialize and deploy
netlify init
netlify deploy --prod
```

## Need Help?

- Netlify Docs: https://docs.netlify.com
- Build logs: Check in Netlify dashboard under "Deploys"
- Support: https://www.netlify.com/support/

