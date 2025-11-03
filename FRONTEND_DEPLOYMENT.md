# Frontend Deployment Guide

Complete guide to deploy your React inventory management frontend to Vercel, Netlify, or other platforms.

## Prerequisites

- Backend deployed and running (Render URL from backend deployment)
- GitHub account with repository access
- Node.js installed locally for testing

## Step 1: Update Backend URL

Before deploying, you need to update the backend URL:

### Option A: Using .env.production (Recommended)

Edit `.env.production` file and replace the URL with your deployed backend:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**Important:** Replace `https://your-backend-url.onrender.com` with your actual Render backend URL!

### Option B: Set during deployment (platform-specific)

You can also set the environment variable directly in your deployment platform (shown in steps below).

## Deployment Options

Choose one of the following platforms:

---

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Step 1: Install Vercel CLI (Optional - can also use web interface)

```bash
npm i -g vercel
```

### Step 2A: Deploy via CLI

```bash
# Login
vercel login

# Deploy
vercel

# When prompted, answer:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? inventory-frontend (or your choice)
# - In which directory is your code? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 2B: Deploy via Web Interface

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import from GitHub: `jatintech/monishkfrontend`
4. Configure project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

5. **Add Environment Variable:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com`

6. Click "Deploy"

### Step 3: Get Your URL

After deployment completes, Vercel will provide a URL like:
```
https://inventory-frontend.vercel.app
```

---

## Option 2: Deploy to Netlify

### Step 1: Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
```

### Step 2A: Deploy via CLI

```bash
# Login
netlify login

# Initialize
netlify init

# Follow prompts:
# - Create & configure a new site
# - Team: Select your team
# - Site name: inventory-frontend
# - Build command: npm run build
# - Directory to deploy: build

# Deploy
netlify deploy --prod
```

### Step 2B: Deploy via Web Interface

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select `jatintech/monishkfrontend`
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Environment variables:**
     - Key: `REACT_APP_API_URL`
     - Value: `https://your-backend-url.onrender.com`

5. Click "Deploy site"

### Step 3: Get Your URL

After deployment, Netlify provides a URL like:
```
https://inventory-frontend.netlify.app
```

You can also set a custom domain in settings.

---

## Option 3: Deploy to GitHub Pages

### Step 1: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 2: Update package.json

Add the following to `package.json`:

```json
{
  "homepage": "https://jatintech.github.io/monishkfrontend",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Step 3: Update .env.production

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Step 4: Deploy

```bash
npm run deploy
```

Your site will be live at: `https://jatintech.github.io/monishkfrontend`

---

## Testing Your Deployment

### 1. Test Local Build First

Before deploying, test the production build locally:

```bash
# Set production environment
export REACT_APP_API_URL=https://your-backend-url.onrender.com

# Or on Windows:
set REACT_APP_API_URL=https://your-backend-url.onrender.com

# Build
npm run build

# Serve locally
npx serve -s build

# Open http://localhost:3000 and test
```

### 2. Test Deployed App

After deployment, test all features:

1. **Inward Page:**
   - Upload Excel file
   - Search items
   - Add items to inward
   - Push to sheets

2. **PO Page:**
   - Upload Excel file
   - Search items
   - Add items with customer name
   - Push to sheets

3. **Transaction History:**
   - View all transactions
   - Check data is loading from backend

4. **Live Stock:**
   - View live stock data
   - Verify calculations are correct

---

## Troubleshooting

### API Calls Failing

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Verify backend is running (test `/health` endpoint)
2. Check `REACT_APP_API_URL` is set correctly
3. Verify CORS is enabled on backend (already configured)
4. Check browser console for errors

### Environment Variable Not Working

**Problem:** App still using localhost

**Solutions:**
1. Rebuild the app: `npm run build`
2. Environment variables in React must start with `REACT_APP_`
3. Restart dev server after changing `.env`
4. On deployment platforms, add env vars in dashboard
5. Clear browser cache

### Build Fails

**Problem:** Deployment build errors

**Solutions:**
1. Test build locally: `npm run build`
2. Fix any ESLint warnings/errors
3. Check all dependencies are installed
4. Verify Node version: `node --version` (should be >= 14)

### 404 on Page Refresh

**Problem:** Page not found when refreshing on routes

**Solutions:**
- **Vercel:** Already configured (vercel.json)
- **Netlify:** Already configured (netlify.toml)
- **GitHub Pages:** Use HashRouter instead of BrowserRouter in React

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://inventory-backend.onrender.com` |

**Important Notes:**
- Environment variables must start with `REACT_APP_` in Create React App
- Changes require rebuild (`npm run build`)
- Variables are embedded at build time, not runtime

---

## Update Your Deployed App

When you make changes:

### For Vercel:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys on push to main
```

### For Netlify:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Netlify auto-deploys on push to main
```

### For GitHub Pages:
```bash
npm run deploy
```

---

## Production Checklist

Before going live, ensure:

- [ ] Backend is deployed and accessible
- [ ] `REACT_APP_API_URL` points to production backend
- [ ] All pages load correctly
- [ ] API calls work from deployed frontend
- [ ] Excel upload works
- [ ] Google Sheets integration works
- [ ] Tested on mobile devices
- [ ] HTTPS is enabled (automatic on Vercel/Netlify)
- [ ] Custom domain configured (optional)

---

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records as instructed

### Netlify:
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Configure DNS records as instructed

---

## Performance Tips

1. **Optimize Build:**
   ```bash
   # Analyze bundle size
   npm run build
   npx source-map-explorer 'build/static/js/*.js'
   ```

2. **Enable Caching:**
   - Vercel and Netlify handle this automatically
   - Assets are cached at CDN edge locations

3. **Monitor Performance:**
   - Use Lighthouse in Chrome DevTools
   - Check Web Vitals in deployment platform analytics

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Create React App:** https://create-react-app.dev/docs/deployment

---

## Quick Start Summary

The fastest way to deploy:

```bash
# 1. Update backend URL
# Edit .env.production with your Render backend URL

# 2. Test locally
npm run build
npx serve -s build

# 3. Deploy to Vercel (easiest)
npx vercel --prod

# Done! 🚀
```

Your frontend is now live and connected to your backend!
