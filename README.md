# Mahesh AI Community — Backend Deployment Guide (AWS)

This guide walks you through deploying the Express + TypeScript backend to AWS using **Elastic Beanstalk** — the easiest AWS service for Node.js apps. No prior AWS experience needed.

---

## What You Have

- **Backend:** `server/` — Node.js + Express + TypeScript
- **Frontend:** `client/` — React + Vite (already on Netlify)
- **Database:** Supabase (cloud, no change needed)

---

## Prerequisites — Do These First

### 1. Create an AWS Account
1. Go to https://aws.amazon.com
2. Click **Create an AWS Account**
3. Enter email, password, account name
4. Add a credit card (you won't be charged for small usage — Free Tier covers this)
5. Choose **Basic Support (Free)**
6. Verify your phone number
7. Sign in to the **AWS Console**

### 2. Install AWS CLI on your Mac
Open Terminal and run:
```bash
brew install awscli
```
Then verify:
```bash
aws --version
```

### 3. Install Elastic Beanstalk CLI
```bash
brew install awsebcli
```
Verify:
```bash
eb --version
```

### 4. Create an IAM User (so you don't use root account)
1. In AWS Console, search for **IAM** → click it
2. Click **Users** → **Create user**
3. Username: `mahesh-deploy`
4. Click **Next** → **Attach policies directly**
5. Search and check these policies:
   - `AdministratorAccess-AWSElasticBeanstalk`
   - `AmazonEC2FullAccess`
   - `IAMFullAccess`
6. Click **Create user**
7. Click on the user → **Security credentials** tab
8. Scroll to **Access keys** → **Create access key**
9. Choose **CLI** → click Next → **Create access key**
10. **COPY BOTH KEYS — you won't see them again**

### 5. Configure AWS CLI with your keys
```bash
aws configure
```
Enter when prompted:
```
AWS Access Key ID: <paste your key>
AWS Secret Access Key: <paste your secret>
Default region name: us-east-1
Default output format: json
```

---

## Step 1 — Prepare the Backend for Deployment

Navigate to the server folder:
```bash
cd /Users/sachin/Documents/Webiste/Mahesh_AIPMWebsite/server
```

Make sure the build works:
```bash
npm install
npm run build
```
You should see a `dist/` folder with compiled JS files. If there are errors, fix them before continuing.

---

## Step 2 — Create a `.env` File for Production Values

In the `server/` folder, you already use these environment variables. Make a list of them — you will enter them in AWS, **not** in a file:

```
PORT=8080
NODE_ENV=production
SESSION_SECRET=<a long random string — make one up>
SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_KEY=<your Supabase service role key>
```

> **Never commit `.env` to GitHub.** AWS will store these securely.

---

## Step 3 — Create a `Procfile`

AWS Elastic Beanstalk needs a `Procfile` to know how to start your app.

Create a file called `Procfile` (no extension) inside `server/`:
```
web: node dist/index.js
```

---

## Step 4 — Create a `.ebignore` File

This tells EB what NOT to upload (keeps the package small).

Create `server/.ebignore`:
```
node_modules/
src/
tsconfig.json
*.ts
.env
```

---

## Step 5 — Initialize Elastic Beanstalk

Inside the `server/` folder, run:
```bash
eb init
```

Answer the prompts:
```
Select a default region: 1 (us-east-1)
Enter Application Name: mahesh-aipm-backend   [press Enter]
It appears you are using Node.js. Is this correct?: Y
Select a platform branch: Node.js 20 running on 64bit Amazon Linux 2023
Do you want to set up SSH?: Y (optional but recommended)
Select a keypair: Create new KeyPair → name it "mahesh-key"
```

---

## Step 6 — Create the Environment and Deploy

```bash
eb create mahesh-backend-prod
```

This will:
- Spin up an EC2 server
- Install your app
- Configure a load balancer
- Give you a public URL

**This takes 5–10 minutes.** Watch the logs — it shows progress.

When done you'll see:
```
INFO: Successfully launched environment: mahesh-backend-prod
```

---

## Step 7 — Add Environment Variables in AWS Console

1. Go to https://console.aws.amazon.com
2. Search **Elastic Beanstalk** → click your environment `mahesh-backend-prod`
3. Left sidebar → **Configuration**
4. Find **Updates, monitoring, and logging** → **Edit**
5. Scroll to **Environment properties**
6. Add each variable one by one:

| Key | Value |
|-----|-------|
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | `your-random-secret` |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...` |

7. Click **Apply** — the environment will restart (2–3 min)

---

## Step 8 — Get Your Live Backend URL

In the Elastic Beanstalk dashboard, at the top of your environment page you'll see:
```
Domain: mahesh-backend-prod.us-east-1.elasticbeanstalk.com
```

Test it in your browser:
```
http://mahesh-backend-prod.us-east-1.elasticbeanstalk.com/api/cohort-projects
```

---

## Step 9 — Update Frontend to Use the Live Backend URL

Open `client/.env` (create it if it doesn't exist):
```
VITE_API_URL=http://mahesh-backend-prod.us-east-1.elasticbeanstalk.com
```

Then update the CORS in `server/src/index.ts` to also allow your Netlify domain (it already does — confirm `https://maheshaicommunity.netlify.app` is in the list).

Redeploy frontend on Netlify.

---

## Step 10 — Future Deploys (After Code Changes)

Whenever you change the backend code:
```bash
cd server
npm run build
eb deploy
```

That's it — it pushes the new build live in ~2 minutes.

---

## Troubleshooting

### Check live logs
```bash
eb logs
```

### SSH into the server (if needed)
```bash
eb ssh
```

### App crashed / not starting
```bash
eb logs --all
```
Look for the error message near the bottom.

### Environment variables not loading
Double-check them in the AWS Console → Elastic Beanstalk → Configuration → Environment properties.

---

## Cost Estimate

Using the **t3.micro** instance (default):
- Free Tier: **750 hours/month free** for the first 12 months
- After free tier: ~$10–15/month

To avoid charges if you're just testing:
```bash
eb terminate mahesh-backend-prod
```

---

## Summary

| Step | What you did |
|------|-------------|
| 1 | Created AWS account + IAM user |
| 2 | Installed AWS CLI + EB CLI |
| 3 | Built the TypeScript project |
| 4 | Added Procfile + .ebignore |
| 5 | `eb init` — linked to AWS |
| 6 | `eb create` — deployed live |
| 7 | Added env variables in console |
| 8 | Got live URL |
| 9 | Updated frontend to use live URL |
| 10 | Future: `npm run build && eb deploy` |
