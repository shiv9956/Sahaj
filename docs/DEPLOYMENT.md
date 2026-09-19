# SAHAJ — PRODUCTION DEPLOYMENT GUIDE

This guide provides step-by-step instructions to deploy **Sahaj**:
- **Frontend (`apps/web`):** Next.js PWA deployed to **Vercel**
- **Backend (`apps/api`):** Fastify Node.js API deployed to **Render**

---

## 1. Deploying Backend (`apps/api`) to Render

### Step 1: Create a New Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/shiv9956/Sahaj`.

### Step 2: Configure Render Build & Service Settings
- **Name:** `sahaj-api` (or preferred name)
- **Environment:** `Node`
- **Region:** Singapore / Oregon (or closest region)
- **Branch:** `main`
- **Root Directory:** *(leave blank for root)*
- **Build Command:**
  ```bash
  pnpm install && pnpm --filter @sahaj/api build
  ```
- **Start Command:**
  ```bash
  pnpm --filter @sahaj/api start
  ```

### Step 3: Add Render Environment Variables
In the Render dashboard **Environment** tab, set:
```env
PORT=4000
NODE_ENV=production
HMAC_SECRET=your_production_hmac_secret_key_2026
SARVAM_API_KEY=your_sarvam_dashboard_key
COGNEE_API_KEY=your_cognee_cloud_key
COGNEE_TENANT_URL=https://api.cognee.ai
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

### Step 4: Verify Deployment
Once deployed, verify by opening:
`https://sahaj-api.onrender.com/ready` (should return `{"status":"READY", ...}`).

---

## 2. Deploying Frontend (`apps/web`) to Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `https://github.com/shiv9956/Sahaj`.

### Step 2: Configure Vercel Project Settings
- **Framework Preset:** `Next.js`
- **Root Directory:** Click **Edit** and select `apps/web`
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)

### Step 3: Add Vercel Environment Variables
Under **Environment Variables**, add:
```env
NEXT_PUBLIC_API_URL=https://sahaj-api.onrender.com
FF_VOICE=true
FF_JUDGE_MODE=true
FF_CHAOS=true
```
*(Replace `https://sahaj-api.onrender.com` with your actual Render API service URL)*

### Step 4: Deploy & Verify
Click **Deploy**. Once complete, Vercel will assign a live URL (e.g., `https://sahaj-web.vercel.app`).

---

## 3. Post-Deployment Verification Checklist

1. **API Readiness Check:** `GET https://sahaj-api.onrender.com/ready` returns `200 OK`.
2. **SSE Streaming Check:** Open Vercel app, send a Hinglish message, verify status chips & live streaming tokens.
3. **Judge Mode:** Append `?judge=1` to the Vercel URL to verify live telemetry feeds.
4. **Chaos Toggle:** Append `?chaos=1` to verify degraded mode fallback.
