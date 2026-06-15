# Azure Backend Deployment Guide

**Stack:** Node.js + Express + TypeScript  
**Database:** Supabase / Neon (external — no migration needed on Azure)  
**Frontend:** Netlify (already deployed)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Level 1 — Basic: Deploy via Azure Portal (GUI)](#level-1--basic-deploy-via-azure-portal-gui)
3. [Level 2 — Intermediate: Deploy via Azure CLI](#level-2--intermediate-deploy-via-azure-cli)
4. [Level 3 — Advanced: Docker + Azure Container Apps](#level-3--advanced-docker--azure-container-apps)
5. [Level 4 — Pro: CI/CD with GitHub Actions](#level-4--pro-cicd-with-github-actions)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Custom Domain + SSL](#custom-domain--ssl)
8. [Monitoring & Logs](#monitoring--logs)
9. [Scaling](#scaling)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install these tools before starting:

```bash
# 1. Azure CLI
brew install azure-cli         # macOS
# OR: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# 2. Verify installation
az --version

# 3. Log in
az login
# This opens a browser — sign in with your Azure account

# 4. (Optional) Docker — only needed for Level 3+
brew install docker
```

Create a free Azure account at https://azure.microsoft.com/free if you don't have one.  
You get $200 credit for 30 days + always-free tier services.

---

## Level 1 — Basic: Deploy via Azure Portal (GUI)

Best for: first-time Azure users, quick proof of concept.

### Step 1 — Create an App Service

1. Go to https://portal.azure.com
2. Click **Create a resource** → search **Web App** → click **Create**
3. Fill in the form:

| Field | Value |
|-------|-------|
| Subscription | Your subscription |
| Resource Group | Create new → `mahesh-aipm-rg` |
| Name | `mahesh-aipm-backend` (must be globally unique) |
| Publish | **Code** |
| Runtime stack | **Node 20 LTS** |
| Operating System | **Linux** |
| Region | `East US` (or closest to you) |
| Pricing Plan | **B1 Basic** ($13/mo) or **F1 Free** (limited) |

4. Click **Review + Create** → **Create**
5. Wait ~2 minutes for deployment

### Step 2 — Set Environment Variables

1. In your new App Service, go to **Settings → Environment variables**
2. Click **+ Add** for each variable:

```
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-here
DATABASE_URL=your-neon-or-supabase-connection-string
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=8080
```

3. Click **Apply** → **Confirm**

### Step 3 — Configure Startup Command

1. Go to **Settings → Configuration → General settings**
2. Set **Startup Command**:
   ```
   npm install --include=dev && npm run build && npm start
   ```
3. Click **Save**

### Step 4 — Deploy Your Code (Zip Deploy)

```bash
# From the server/ directory
cd /Users/kaizen/HQ/Mahesh_AIPMWebsite/server

# Build first
npm install && npm run build

# Zip the necessary files
zip -r deploy.zip dist/ package.json package-lock.json node_modules/ -x "node_modules/.cache/*"

# Deploy via Azure CLI (or use the Portal's "Deployment Center")
az webapp deploy \
  --resource-group mahesh-aipm-rg \
  --name mahesh-aipm-backend \
  --src-path deploy.zip \
  --type zip
```

Your backend will be live at:  
`https://mahesh-aipm-backend.azurewebsites.net`

### Step 5 — Update CORS in Your Backend

Add your Azure URL to the CORS list in `server/src/index.ts`:

```ts
origin: [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://maheshaicommunity.netlify.app',
  'https://myaicommunity.org',
  'https://www.myaicommunity.org',
  'https://mahesh-aipm-backend.azurewebsites.net',  // add this
],
```

---

## Level 2 — Intermediate: Deploy via Azure CLI

Best for: repeatable deployments, developers who prefer the terminal.

### Step 1 — Login and Set Subscription

```bash
az login

# List subscriptions
az account list --output table

# Set active subscription (copy the ID from the list)
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2 — Create Resources

```bash
# Create resource group
az group create \
  --name mahesh-aipm-rg \
  --location eastus

# Create App Service Plan (B1 = Basic tier, Linux)
az appservice plan create \
  --name mahesh-aipm-plan \
  --resource-group mahesh-aipm-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --plan mahesh-aipm-plan \
  --runtime "NODE:20-lts"
```

### Step 3 — Set Environment Variables via CLI

```bash
az webapp config appsettings set \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --settings \
    NODE_ENV=production \
    SESSION_SECRET="your-super-secret-key" \
    DATABASE_URL="your-connection-string" \
    SUPABASE_URL="https://yourproject.supabase.co" \
    SUPABASE_ANON_KEY="your-anon-key" \
    SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
    PORT=8080 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Step 4 — Configure Startup

```bash
az webapp config set \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --startup-file "npm run build && npm start"
```

### Step 5 — Deploy from Local Git

```bash
# Enable local git deployment
az webapp deployment source config-local-git \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg

# This returns a Git URL like:
# https://mahesh-aipm-backend.scm.azurewebsites.net/mahesh-aipm-backend.git

# Add it as a remote (from server/ directory)
cd /Users/kaizen/HQ/Mahesh_AIPMWebsite/server
git init   # if not already a git repo
git remote add azure "PASTE_GIT_URL_HERE"

# Deploy by pushing
git add -A
git commit -m "Deploy to Azure"
git push azure main
```

### Step 6 — Verify Deployment

```bash
# Check app status
az webapp show \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --query "state"

# Stream live logs
az webapp log tail \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg

# Open in browser
az webapp browse \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg
```

---

## Level 3 — Advanced: Docker + Azure Container Apps

Best for: production apps, better resource control, no cold starts.

### Step 1 — Create a Dockerfile

Create `server/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

Create `server/.dockerignore`:

```
node_modules
dist
*.ts
tsconfig.json
.env
```

### Step 2 — Create Azure Container Registry (ACR)

```bash
# Create the registry
az acr create \
  --name maheshaipmregistry \
  --resource-group mahesh-aipm-rg \
  --sku Basic \
  --admin-enabled true

# Get login credentials
az acr credential show --name maheshaipmregistry

# Log in to the registry
az acr login --name maheshaipmregistry
```

### Step 3 — Build and Push Docker Image

```bash
cd /Users/kaizen/HQ/Mahesh_AIPMWebsite/server

# Build image
docker build -t maheshaipmregistry.azurecr.io/backend:latest .

# Push to ACR
docker push maheshaipmregistry.azurecr.io/backend:latest

# OR: Build directly in Azure (no local Docker needed)
az acr build \
  --registry maheshaipmregistry \
  --image backend:latest \
  .
```

### Step 4 — Deploy to Azure Container Apps

```bash
# Create Container Apps environment
az containerapp env create \
  --name mahesh-aipm-env \
  --resource-group mahesh-aipm-rg \
  --location eastus

# Get ACR password
ACR_PASSWORD=$(az acr credential show \
  --name maheshaipmregistry \
  --query "passwords[0].value" -o tsv)

# Deploy the container
az containerapp create \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --environment mahesh-aipm-env \
  --image maheshaipmregistry.azurecr.io/backend:latest \
  --registry-server maheshaipmregistry.azurecr.io \
  --registry-username maheshaipmregistry \
  --registry-password $ACR_PASSWORD \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --env-vars \
    NODE_ENV=production \
    SESSION_SECRET=secretref:session-secret \
    PORT=8080

# Get the public URL
az containerapp show \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv
```

### Step 5 — Store Secrets in Azure Key Vault (Recommended)

```bash
# Create Key Vault
az keyvault create \
  --name mahesh-aipm-vault \
  --resource-group mahesh-aipm-rg \
  --location eastus

# Store secrets
az keyvault secret set --vault-name mahesh-aipm-vault --name "SESSION-SECRET" --value "your-secret"
az keyvault secret set --vault-name mahesh-aipm-vault --name "DATABASE-URL" --value "your-connection-string"
az keyvault secret set --vault-name mahesh-aipm-vault --name "SUPABASE-SERVICE-ROLE-KEY" --value "your-key"

# Grant Container App access to Key Vault
az containerapp identity assign \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --system-assigned
```

---

## Level 4 — Pro: CI/CD with GitHub Actions

Best for: teams, automatic deploys on every push to main.

### Step 1 — Create a Service Principal

```bash
az ad sp create-for-rbac \
  --name "mahesh-aipm-github" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/mahesh-aipm-rg \
  --sdk-auth
```

Copy the entire JSON output — you'll need it next.

### Step 2 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** → add:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | The full JSON from Step 1 |
| `AZURE_WEBAPP_NAME` | `mahesh-aipm-backend` |
| `SESSION_SECRET` | Your session secret |
| `DATABASE_URL` | Your DB connection string |
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |

### Step 3 — Create GitHub Actions Workflow

Create `.github/workflows/azure-deploy.yml` in your repo root:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'server/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        working-directory: ./server
        run: npm ci

      - name: Build TypeScript
        working-directory: ./server
        run: npm run build

      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Set App Settings
        uses: azure/appservice-settings@v1
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          app-settings-json: |
            [
              {"name": "NODE_ENV", "value": "production"},
              {"name": "SESSION_SECRET", "value": "${{ secrets.SESSION_SECRET }}"},
              {"name": "DATABASE_URL", "value": "${{ secrets.DATABASE_URL }}"},
              {"name": "SUPABASE_URL", "value": "${{ secrets.SUPABASE_URL }}"},
              {"name": "SUPABASE_ANON_KEY", "value": "${{ secrets.SUPABASE_ANON_KEY }}"},
              {"name": "SUPABASE_SERVICE_ROLE_KEY", "value": "${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"}
            ]

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          package: ./server

  health-check:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    steps:
      - name: Wait for app to start
        run: sleep 30

      - name: Health check
        run: |
          curl -f https://${{ secrets.AZURE_WEBAPP_NAME }}.azurewebsites.net/health || exit 1
```

### Step 4 — Add a Health Check Endpoint

Add to `server/src/index.ts` before `registerRoutes(app)`:

```ts
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Azure uses `8080` by default |
| `SESSION_SECRET` | Yes | Random string, min 32 chars |
| `DATABASE_URL` | Yes | Neon/Supabase postgres URL |
| `SUPABASE_URL` | Yes | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | From Supabase dashboard (keep secret) |

Generate a strong session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Custom Domain + SSL

### Point your domain to Azure

```bash
# Get the Azure app's IP / hostname
az webapp show \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --query "defaultHostName" -o tsv

# Add custom domain
az webapp config hostname add \
  --webapp-name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --hostname api.myaicommunity.org
```

In your DNS provider, add a `CNAME` record:
```
api.myaicommunity.org  →  mahesh-aipm-backend.azurewebsites.net
```

### Enable Free Managed SSL

```bash
az webapp config ssl bind \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --certificate-thumbprint $(az webapp config ssl create \
    --name mahesh-aipm-backend \
    --resource-group mahesh-aipm-rg \
    --hostname api.myaicommunity.org \
    --query "thumbprint" -o tsv) \
  --ssl-type SNI
```

Or do it in the Portal: **App Service → Custom domains → Add custom domain → Managed certificate**.

---

## Monitoring & Logs

### View Live Logs

```bash
# Stream logs in terminal
az webapp log tail \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg

# Download logs
az webapp log download \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --log-file logs.zip
```

### Enable Application Insights (Recommended)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app mahesh-aipm-insights \
  --location eastus \
  --resource-group mahesh-aipm-rg \
  --kind web

# Get instrumentation key
az monitor app-insights component show \
  --app mahesh-aipm-insights \
  --resource-group mahesh-aipm-rg \
  --query "instrumentationKey" -o tsv

# Set it as an env var in your app
az webapp config appsettings set \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key-here"
```

You can then view real-time metrics, request traces, and errors in the Azure Portal under **Application Insights**.

---

## Scaling

### Scale Up (bigger machine)

```bash
# Upgrade from B1 to B2
az appservice plan update \
  --name mahesh-aipm-plan \
  --resource-group mahesh-aipm-rg \
  --sku B2
```

### Scale Out (more instances)

```bash
# Manually set 3 instances
az webapp scale \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --instance-count 3

# Enable auto-scale (scales 1-5 based on CPU)
az monitor autoscale create \
  --resource-group mahesh-aipm-rg \
  --resource mahesh-aipm-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-policy \
  --min-count 1 \
  --max-count 5 \
  --count 1

az monitor autoscale rule create \
  --resource-group mahesh-aipm-rg \
  --autoscale-name autoscale-policy \
  --condition "CpuPercentage > 70 avg 5m" \
  --scale out 1

az monitor autoscale rule create \
  --resource-group mahesh-aipm-rg \
  --autoscale-name autoscale-policy \
  --condition "CpuPercentage < 30 avg 5m" \
  --scale in 1
```

---

## Troubleshooting

### App won't start

```bash
# Check logs for errors
az webapp log tail --name mahesh-aipm-backend --resource-group mahesh-aipm-rg

# Common fix: make sure PORT is read from env
# Your index.ts already does: const PORT = process.env.PORT || 5000 ✓
```

### 500 errors after deploy

```bash
# SSH into the container
az webapp ssh --name mahesh-aipm-backend --resource-group mahesh-aipm-rg

# Check if dist/ was built
ls /home/site/wwwroot/dist/

# Check env vars are set
printenv | grep SUPABASE
```

### CORS errors from Netlify

Make sure your Azure URL is in the CORS list in `server/src/index.ts` and you redeployed after adding it.

### Build fails on Azure

Set this app setting to force Azure to run your build:

```bash
az webapp config appsettings set \
  --name mahesh-aipm-backend \
  --resource-group mahesh-aipm-rg \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Session not persisting

Your app uses `memorystore` for sessions — this resets on restart. For production, switch to a persistent session store (Redis or PostgreSQL). Use Azure Cache for Redis:

```bash
az redis create \
  --name mahesh-aipm-redis \
  --resource-group mahesh-aipm-rg \
  --location eastus \
  --sku Basic \
  --vm-size C0
```

Then swap `memorystore` for `connect-redis` in `server/src/index.ts`.

---

## Cost Estimate

| Tier | Price | Use Case |
|------|-------|----------|
| F1 Free | $0/mo | Testing only (60 CPU min/day limit) |
| B1 Basic | ~$13/mo | Small production app |
| B2 Basic | ~$27/mo | Moderate traffic |
| P1v3 Premium | ~$75/mo | High traffic + auto-scale |
| Container Apps | Pay per use | Best for variable traffic |

**Recommendation:** Start with **B1** (~$13/mo). Upgrade to P1v3 + auto-scale when you need it.

---

## Quick Reference Commands

```bash
# Deploy (zip method)
cd server && npm run build
zip -r deploy.zip dist/ package.json package-lock.json
az webapp deploy --resource-group mahesh-aipm-rg --name mahesh-aipm-backend --src-path deploy.zip --type zip

# View logs
az webapp log tail --name mahesh-aipm-backend --resource-group mahesh-aipm-rg

# Restart app
az webapp restart --name mahesh-aipm-backend --resource-group mahesh-aipm-rg

# Open app in browser
az webapp browse --name mahesh-aipm-backend --resource-group mahesh-aipm-rg

# Delete everything (careful!)
az group delete --name mahesh-aipm-rg --yes
```
