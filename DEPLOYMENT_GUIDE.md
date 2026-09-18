# 🚀 RKD School Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide walks you through deploying your full-stack application to **Render** (Node.js/Express API) and **Vercel** (React/Vite Frontend).

---

## 📋 Prerequisites

1. **MongoDB Atlas Network Access**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/) → **Network Access**.
   - Ensure an IP Access entry exists for **`0.0.0.0/0` (Allow access from anywhere)**.
   - *Why?* Render instances run on dynamic cloud IPs; without `0.0.0.0/0`, Render cannot connect to your MongoDB database.

2. Accounts:
   - [GitHub](https://github.com/)
   - [Render](https://render.com/)
   - [Vercel](https://vercel.com/)

---

## Step 1: Push Your Code to GitHub

Open a terminal in the project root (`c:\Users\ADMIN\Desktop\RKD School`) and run:

```bash
# Initialize git repository (if not already initialized)
git init

# Check status to verify .env and node_modules are ignored
git status

# Add files and commit
git add .
git commit -m "Configure project for Render and Vercel deployment"

# Set branch name to main
git branch -M main

# Link to your GitHub repository (create a new empty repo on github.com first)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `rkd-school-backend` (or your preferred name)
   - **Region**: Choose the region closest to you (e.g., Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(⚠️ Critical! Do not leave empty)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Scroll down to **Environment Variables** and add the following keys:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `MONGO_URI` | `mongodb+srv://admin:vxam6r3kn8lXij03@sms.3cnx7xo.mongodb.net/` | Your Atlas MongoDB URI |
   | `JWT_SECRET` | `a0f5f62f8ba3af86d3de7e431edd1ce523f83e078f15625094dc31ce0a215a08` | Secret key for JWT |
   | `JWT_EXPIRE` | `7d` | Token expiration |
   | `FRONTEND_URL` | `https://*.vercel.app` *(or add your exact Vercel URL in Step 4)* | Allowed CORS origin |

6. Click **Deploy Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, copy your Render Web Service URL at the top:
   > Example: `https://rkd-school-backend.onrender.com`
   > Test it by opening `https://rkd-school-backend.onrender.com/` in your browser. You should see:
   > `{"message": "🎓 RKD School API is running!"}`

---

## Step 3: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. Under **Configure Project**:
   - **Project Name**: `rkd-school` (or preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend` *(⚠️ Critical!)*
   - **Build and Output Settings**: Leave defaults (`npm run build` and `dist`)
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-backend-name.onrender.com/api` |
   *(⚠️ Make sure to include `https://` and `/api` at the end!)*

6. Click **Deploy**.
7. Vercel will build the frontend in ~30 seconds and provide your live URL:
   > Example: `https://rkd-school.vercel.app`

---

## Step 4: Final Link (CORS update on Render)

1. Copy your live Vercel URL (e.g., `https://rkd-school.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com/) → your backend service → **Environment**.
3. Set or update `FRONTEND_URL`:
   - `FRONTEND_URL`: `https://rkd-school.vercel.app`
4. Render will automatically redeploy with the updated setting.

---

## ✅ Verification Checklist

- [ ] Open your Vercel URL (`https://your-frontend.vercel.app`).
- [ ] Direct page refresh test: Refresh on `/login` or `/admin` to verify routing works smoothly without 404 errors.
- [ ] Sign in / Register test: Log in with an admin or student account to verify API communication between Vercel and Render.
- [ ] Check Network tab in DevTools: API requests should target `https://your-backend.onrender.com/api/...` with HTTP 200 OK.
