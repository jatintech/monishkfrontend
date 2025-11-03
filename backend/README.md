# Inventory Management Backend API

Node.js + Express backend for Inventory Management System with Google Sheets integration.

## Features

- Inward inventory management
- Purchase Order (PO) management
- Transaction history tracking
- Live stock calculation
- Google Sheets integration for data storage

## Tech Stack

- Node.js
- Express.js
- Google Sheets API (googleapis)
- CORS enabled

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Cloud Project with Sheets API enabled
- Google Service Account credentials

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
PORT=5000
SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 3. Get Google Service Account Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create Service Account
   - Download the JSON key file
5. Share your Google Sheet with the service account email
6. Copy the entire JSON content as a single-line string and paste it in `.env` as `GOOGLE_SERVICE_ACCOUNT_KEY`

### 4. Run the Server

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Inward Management
- `POST /push-data` - Add inward entries

### PO Management
- `POST /api/po-entry` - Create new PO entry
- `GET /api/po-entries` - Get all PO entries
- `GET /api/po-summary` - Get PO summary statistics

### Reporting
- `GET /api/transaction-history` - Get all transactions (Inward + PO)
- `GET /api/live-stock` - Calculate live stock (Inward - PO)

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard:
   - `SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `PORT` (optional, defaults to 5000)

**Note:** Make sure to set environment variables as secrets in the Vercel dashboard.

### Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" > "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** inventory-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables:
   - `SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `PORT` (optional)
7. Click "Create Web Service"

### Deploy to Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize and deploy:
```bash
railway init
railway up
```

4. Set environment variables:
```bash
railway variables set SHEET_ID=your-sheet-id
railway variables set GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Deploy to Heroku

1. Install Heroku CLI

2. Login:
```bash
heroku login
```

3. Create app:
```bash
heroku create your-app-name
```

4. Set environment variables:
```bash
heroku config:set SHEET_ID=your-sheet-id
heroku config:set GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

5. Deploy:
```bash
git push heroku main
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 5000) |
| `SHEET_ID` | Google Sheet ID from the sheet URL | Yes |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Service Account credentials as JSON string | Yes |

## Google Sheet Structure

The application uses three sheets:

### Inward Sheet
| Timestamp | Item Name | Quantity | Unit |
|-----------|-----------|----------|------|

### PO Sheet
| Timestamp | Item Name | Quantity | Unit | Customer Name |
|-----------|-----------|----------|------|---------------|

### TransactionHistory Sheet
| Timestamp | Type | Item Name | Quantity | Unit | Customer Name |
|-----------|------|-----------|----------|------|---------------|

## Security Notes

- Never commit `.env` file or service account credentials to version control
- Always use environment variables for sensitive data
- The `.gitignore` file is configured to exclude sensitive files
- When deploying, use the platform's secret/environment variable features

## Troubleshooting

### Google Sheets API Errors

If you get authentication errors:
1. Verify your service account email has access to the sheet
2. Check that the Google Sheets API is enabled in your GCP project
3. Ensure `GOOGLE_SERVICE_ACCOUNT_KEY` is properly formatted as a single-line JSON string

### Port Already in Use

Change the port in `.env`:
```env
PORT=3000
```

### Module Not Found Errors

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Migration from Python

This is a Node.js conversion of the original Python/Flask backend. All endpoints and functionality remain the same.

## License

ISC
