# Render Deployment Guide

## Step-by-Step Instructions to Deploy on Render

### Prerequisites
- GitHub account with your repository pushed
- Google Service Account JSON credentials
- Your Google Sheet ID

### Step 1: Prepare Your Service Account Credentials

1. Open your `service_account.json` file (or download it from Google Cloud Console)
2. Copy the **entire JSON content**
3. Convert it to a **single line** by removing all line breaks (you can use an online JSON minifier)
4. Keep this ready - you'll need to paste it as an environment variable

Example single-line format:
```
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"..."}
```

### Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** button in the top right
3. Select **"Web Service"**

### Step 3: Connect Your Repository

1. Click **"Connect a repository"**
2. If this is your first time:
   - Click **"Configure GitHub"**
   - Authorize Render to access your GitHub account
   - Select which repositories Render can access
3. Find and select your repository: `jatintech/monishkfrontend`
4. Click **"Connect"**

### Step 4: Configure Your Web Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `inventory-backend` (or any name you prefer)
- **Region:** Choose the closest region to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (or paid plan if you prefer)

### Step 5: Add Environment Variables

Scroll down to the **Environment Variables** section and click **"Add Environment Variable"**

Add the following variables:

1. **Variable 1:**
   - Key: `PORT`
   - Value: `5000`

2. **Variable 2:**
   - Key: `SHEET_ID`
   - Value: `1P564glQhuNZ0EVvOw4cD0McGRVrUEfSTp_13CPbTxgM` (or your Sheet ID)

3. **Variable 3:** (MOST IMPORTANT)
   - Key: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Paste your **single-line JSON** from Step 1
   - Example: `{"type":"service_account","project_id":"your-project",...}`

**IMPORTANT:** Make sure the JSON is on a single line with NO line breaks!

### Step 6: Deploy

1. Click **"Create Web Service"** at the bottom
2. Render will now:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait for deployment to complete (usually 2-5 minutes)

### Step 7: Verify Deployment

Once deployed, you'll see a URL like: `https://inventory-backend.onrender.com`

Test your deployment:
1. Click on your service URL
2. Add `/health` to the end: `https://inventory-backend.onrender.com/health`
3. You should see a JSON response with status "healthy"

Example response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03 12:34:56",
  "available_endpoints": [...]
}
```

### Step 8: Update Your Frontend

Update your frontend to use the new backend URL:

1. Open your frontend configuration
2. Replace the backend URL with your Render URL
3. Example: `https://inventory-backend.onrender.com`

### Troubleshooting

#### Build Failed
- Check the build logs in Render dashboard
- Ensure `package.json` is in the `backend` folder
- Verify Node version is >= 18.0.0

#### Service Starts but Returns Errors
- Check the logs in Render dashboard
- Verify environment variables are set correctly
- Most common issue: `GOOGLE_SERVICE_ACCOUNT_KEY` format
  - Must be single-line JSON
  - Must include all fields from service_account.json
  - Check for proper escaping of special characters

#### Google Sheets API Errors
- Verify your Google Sheet is shared with the service account email
- The email is in your service_account.json as `client_email`
- Share the sheet with this email address (Editor permissions)

#### 503 Service Unavailable
- Free tier services spin down after inactivity
- First request after inactivity may take 30-60 seconds
- Consider upgrading to paid tier for always-on service

### Render Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- 750 hours/month free (approximately)
- First request after spin-down takes longer (cold start)
- Consider paid tier ($7/month) for production use

### Updating Your Deployment

When you make changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```

2. Render will **automatically redeploy** when it detects changes on the `main` branch

### Manual Redeploy

If needed, you can manually redeploy:

1. Go to your service in Render dashboard
2. Click **"Manual Deploy"** dropdown
3. Select **"Deploy latest commit"**

## Your Deployment is Complete!

Your backend is now live on Render. Save your service URL and use it in your frontend application.

**Next Steps:**
- Update frontend API base URL
- Test all endpoints
- Monitor logs in Render dashboard
- Set up custom domain (optional, paid feature)

## Support

If you encounter issues:
- Check Render logs for error messages
- Verify all environment variables are correct
- Ensure Google Sheet permissions are set
- Review the main README.md for additional help
