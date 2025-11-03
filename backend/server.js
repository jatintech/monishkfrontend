import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Google Sheets configuration
const SHEET_ID = process.env.SHEET_ID || "1P564glQhuNZ0EVvOw4cD0McGRVrUEfSTp_13CPbTxgM";
const INWARD_SHEET_NAME = "Inward";
const PO_SHEET_NAME = "PO";
const TRANSACTION_HISTORY_SHEET_NAME = "TransactionHistory";

// Initialize Google Sheets API
let sheets;
let auth;

async function initializeGoogleSheets() {
  try {
    // Create auth client from service account credentials
    let credentials;
    const credKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}';

    try {
      // Try to parse as base64 first (for Render compatibility)
      const decoded = Buffer.from(credKey, 'base64').toString('utf8');
      credentials = JSON.parse(decoded);
      console.log('📝 Using base64-encoded credentials');
    } catch (base64Error) {
      // Fall back to regular JSON parsing
      try {
        credentials = JSON.parse(credKey);
        console.log('📝 Using JSON credentials');
      } catch (jsonError) {
        throw new Error('Failed to parse credentials: ' + jsonError.message);
      }
    }

    auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Google Sheets API:', error.message);
    throw error;
  }
}

// Helper function to get or create worksheet
async function getWorksheet(sheetName) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });

    const sheet = spreadsheet.data.sheets.find(
      s => s.properties.title === sheetName
    );

    if (!sheet) {
      // Create the worksheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            }
          }]
        }
      });

      // Add headers based on sheet type
      let headers = [];
      if (sheetName === PO_SHEET_NAME) {
        headers = ["Timestamp", "Item Name", "Quantity", "Unit", "Customer Name"];
      } else if (sheetName === INWARD_SHEET_NAME) {
        headers = ["Timestamp", "Item Name", "Quantity", "Unit"];
      } else if (sheetName === TRANSACTION_HISTORY_SHEET_NAME) {
        headers = ["Timestamp", "Type", "Item Name", "Quantity", "Unit", "Customer Name"];
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      console.log(`✅ Created worksheet: ${sheetName}`);
    }

    return sheetName;
  } catch (error) {
    console.error(`❌ Error accessing worksheet ${sheetName}:`, error.message);
    return null;
  }
}

// Helper function to append row to sheet
async function appendRow(sheetName, values) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      resource: {
        values: [values]
      }
    });
    return true;
  } catch (error) {
    console.error(`❌ Error appending row to ${sheetName}:`, error.message);
    return false;
  }
}

// Helper function to get all records from sheet
async function getAllRecords(sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const records = rows.slice(1).map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    });

    return records;
  } catch (error) {
    console.error(`❌ Error getting records from ${sheetName}:`, error.message);
    return [];
  }
}

// ============ INWARD ROUTES ============
app.post('/push-data', async (req, res) => {
  try {
    const data = req.body;
    console.log('📥 Received inward data:', data);

    const sheetName = await getWorksheet(INWARD_SHEET_NAME);
    if (!sheetName) {
      return res.status(500).json({ status: 'error', message: 'Unable to access Inward sheet' });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    for (const item of data) {
      await appendRow(sheetName, [
        timestamp,
        item.fullText,
        item.quantity,
        item.unit
      ]);

      // Log transaction to TransactionHistory
      const transactionSheetName = await getWorksheet(TRANSACTION_HISTORY_SHEET_NAME);
      if (transactionSheetName) {
        await appendRow(transactionSheetName, [
          timestamp,
          'Inward',
          item.fullText,
          item.quantity,
          item.unit,
          ''
        ]);
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ PO ROUTES ============
app.post('/api/po-entry', async (req, res) => {
  try {
    const data = req.body;
    console.log('📥 Received PO data:', data);

    // Validate required fields
    const requiredFields = ['itemName', 'quantity', 'unit', 'customerName'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const sheetName = await getWorksheet(PO_SHEET_NAME);
    if (!sheetName) {
      return res.status(500).json({ error: 'Unable to access PO sheet' });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const rowData = [
      timestamp,
      data.itemName,
      parseFloat(data.quantity),
      data.unit,
      data.customerName
    ];

    await appendRow(sheetName, rowData);

    // Log transaction to TransactionHistory
    const transactionSheetName = await getWorksheet(TRANSACTION_HISTORY_SHEET_NAME);
    if (transactionSheetName) {
      await appendRow(transactionSheetName, [
        timestamp,
        'PO',
        data.itemName,
        parseFloat(data.quantity),
        data.unit,
        data.customerName
      ]);
    }

    const responseData = {
      timestamp,
      itemName: data.itemName,
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      customerName: data.customerName
    };

    console.log('✅ PO entry and transaction logged successfully:', responseData);
    res.status(201).json(responseData);
  } catch (error) {
    console.error(`❌ Error adding PO entry: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/po-entries', async (req, res) => {
  try {
    const sheetName = await getWorksheet(PO_SHEET_NAME);
    if (!sheetName) {
      return res.status(500).json({ error: 'Unable to access PO sheet' });
    }

    const records = await getAllRecords(sheetName);

    // Sort by timestamp (newest first)
    records.sort((a, b) => {
      const dateA = new Date(a.Timestamp || 0);
      const dateB = new Date(b.Timestamp || 0);
      return dateB - dateA;
    });

    // Format the response
    const formattedRecords = records.map(record => ({
      timestamp: record.Timestamp || '',
      itemName: record['Item Name'] || '',
      quantity: parseFloat(record.Quantity || 0),
      unit: record.Unit || '',
      customerName: record['Customer Name'] || ''
    }));

    console.log(`📊 Retrieved ${formattedRecords.length} PO entries`);
    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error(`❌ Error fetching PO entries: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/po-summary', async (req, res) => {
  try {
    const sheetName = await getWorksheet(PO_SHEET_NAME);
    if (!sheetName) {
      return res.status(500).json({ error: 'Unable to access PO sheet' });
    }

    const records = await getAllRecords(sheetName);

    // Calculate summary statistics
    const totalEntries = records.length;
    const uniqueItems = new Set(records.map(r => r['Item Name'])).size;

    // Group by item, unit, and customer for quantities
    const itemQuantities = {};
    for (const record of records) {
      const itemName = record['Item Name'] || '';
      const unit = record.Unit || '';
      const quantity = parseFloat(record.Quantity || 0);
      const customerName = record['Customer Name'] || '';

      const key = `${itemName}_${unit}_${customerName}`;
      if (itemQuantities[key]) {
        itemQuantities[key].quantity += quantity;
      } else {
        itemQuantities[key] = {
          itemName,
          unit,
          quantity,
          customerName
        };
      }
    }

    const summary = {
      totalEntries,
      uniqueItems,
      itemQuantities: Object.values(itemQuantities)
    };

    console.log('📈 PO Summary:', summary);
    res.status(200).json(summary);
  } catch (error) {
    console.error(`❌ Error fetching PO summary: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ TRANSACTION HISTORY ROUTE ============
app.get('/api/transaction-history', async (req, res) => {
  try {
    const sheetName = await getWorksheet(TRANSACTION_HISTORY_SHEET_NAME);
    if (!sheetName) {
      return res.status(500).json({ error: 'Unable to access TransactionHistory sheet' });
    }

    const records = await getAllRecords(sheetName);

    // Sort by timestamp (newest first)
    records.sort((a, b) => {
      const dateA = new Date(a.Timestamp || 0);
      const dateB = new Date(b.Timestamp || 0);
      return dateB - dateA;
    });

    // Format the response
    const formattedRecords = records.map(record => ({
      timestamp: record.Timestamp || '',
      type: record.Type || '',
      itemName: record['Item Name'] || '',
      quantity: parseFloat(record.Quantity || 0),
      unit: record.Unit || '',
      customerName: record['Customer Name'] || ''
    }));

    console.log(`📊 Retrieved ${formattedRecords.length} transactions`);
    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error(`❌ Error fetching transaction history: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ LIVE STOCK ROUTE ============
app.get('/api/live-stock', async (req, res) => {
  try {
    const inwardSheetName = await getWorksheet(INWARD_SHEET_NAME);
    const poSheetName = await getWorksheet(PO_SHEET_NAME);

    if (!inwardSheetName || !poSheetName) {
      return res.status(500).json({ error: 'Unable to access Inward or PO sheet' });
    }

    const inwardRecords = await getAllRecords(inwardSheetName);
    const poRecords = await getAllRecords(poSheetName);

    // Aggregate Inward quantities
    const inwardMap = {};
    for (const record of inwardRecords) {
      const key = `${record['Item Name']}_${record.Unit}`;
      const quantity = parseFloat(record.Quantity || 0);
      inwardMap[key] = (inwardMap[key] || 0) + quantity;
    }

    // Aggregate PO quantities
    const poMap = {};
    for (const record of poRecords) {
      const key = `${record['Item Name']}_${record.Unit}`;
      const quantity = parseFloat(record.Quantity || 0);
      poMap[key] = (poMap[key] || 0) + quantity;
    }

    // Calculate live stock
    const liveStockData = [];
    const allKeys = new Set([...Object.keys(inwardMap), ...Object.keys(poMap)]);

    for (const key of allKeys) {
      const [itemName, unit] = key.split('_');
      const inwardQty = inwardMap[key] || 0;
      const poQty = poMap[key] || 0;
      const liveStock = inwardQty - poQty;

      liveStockData.push({
        itemName,
        unit,
        inwardQuantity: inwardQty,
        poQuantity: poQty,
        liveStock
      });
    }

    // Sort by item name
    liveStockData.sort((a, b) => a.itemName.localeCompare(b.itemName));

    console.log(`📊 Calculated ${liveStockData.length} live stock entries`);
    res.status(200).json(liveStockData);
  } catch (error) {
    console.error(`❌ Error calculating live stock: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ HEALTH CHECK & ROOT ============
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Inventory Management API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      inward: 'POST /push-data',
      po: {
        create: 'POST /api/po-entry',
        list: 'GET /api/po-entries',
        summary: 'GET /api/po-summary'
      },
      reports: {
        transactions: 'GET /api/transaction-history',
        liveStock: 'GET /api/live-stock'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    available_endpoints: [
      '/push-data (POST) - Inward entries',
      '/api/po-entry (POST) - Add PO entry',
      '/api/po-entries (GET) - Get all PO entries',
      '/api/po-summary (GET) - Get PO summary',
      '/api/transaction-history (GET) - Get transaction history',
      '/api/live-stock (GET) - Live stock calculation'
    ]
  });
});

// ============ ERROR HANDLERS (MUST BE LAST) ============
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ============ SERVER STARTUP ============
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeGoogleSheets();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Starting Inventory Management Backend...');
      console.log('📋 Available sheets: Inward, PO, TransactionHistory');
      console.log(`🌐 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
