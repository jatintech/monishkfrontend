from flask import Flask, request, jsonify
from flask_cors import CORS
import gspread
import datetime
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__)
CORS(app)

# Setup Google Sheet credentials
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("service_account.json", scope)
client = gspread.authorize(creds)

# Replace with your Sheet ID
SHEET_ID = "1P564glQhuNZ0EVvOw4cD0McGRVrUEfSTp_13CPbTxgM"
INWARD_SHEET_NAME = "Inward"
PO_SHEET_NAME = "PO"
TRANSACTION_HISTORY_SHEET_NAME = "TransactionHistory"

def get_worksheet(sheet_name):
    """Get or create a worksheet"""
    try:
        spreadsheet = client.open_by_key(SHEET_ID)
        try:
            worksheet = spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            # Create the worksheet if it doesn't exist
            worksheet = spreadsheet.add_worksheet(title=sheet_name, rows="1000", cols="10")
            # Add headers based on sheet type
            if sheet_name == "PO":
                headers = ["Timestamp", "Item Name", "Quantity", "Unit", "Customer Name"]
                worksheet.append_row(headers)
            elif sheet_name == "Inward":
                headers = ["Timestamp", "Item Name", "Quantity", "Unit"]
                worksheet.append_row(headers)
            elif sheet_name == "TransactionHistory":
                headers = ["Timestamp", "Type", "Item Name", "Quantity", "Unit", "Customer Name"]
                worksheet.append_row(headers)
        return worksheet
    except Exception as e:
        print(f"Error accessing worksheet {sheet_name}: {str(e)}")
        return None

# ============ UPDATED INWARD ROUTES ============
@app.route('/push-data', methods=['POST'])
def push_data():
    """Original inward data push route with transaction logging"""
    try:
        data = request.get_json()
        print("📥 Received inward data:", data)

        sheet = get_worksheet(INWARD_SHEET_NAME)
        if not sheet:
            return jsonify({"status": "error", "message": "Unable to access Inward sheet"}), 500

        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        for item in data:
            sheet.append_row([
                timestamp,
                item['fullText'],   # Item Name
                item['quantity'],   # Quantity
                item['unit']        # Unit
            ])

            # Log transaction to TransactionHistory
            transaction_sheet = get_worksheet(TRANSACTION_HISTORY_SHEET_NAME)
            if transaction_sheet:
                transaction_sheet.append_row([
                    timestamp,
                    "Inward",
                    item['fullText'],
                    item['quantity'],
                    item['unit'],
                    ""  # No customer name for Inward
                ])

        return jsonify({"status": "success"}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# ============ UPDATED PO ROUTES ============
@app.route('/api/po-entry', methods=['POST'])
def add_po_entry():
    """Add a new PO entry with transaction logging"""
    try:
        data = request.get_json()
        print("📥 Received PO data:", data)
        
        # Validate required fields
        required_fields = ['itemName', 'quantity', 'unit', 'customerName']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get or create PO worksheet
        worksheet = get_worksheet(PO_SHEET_NAME)
        if not worksheet:
            return jsonify({'error': 'Unable to access PO sheet'}), 500
        
        # Prepare the data
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        row_data = [
            timestamp,
            data['itemName'],
            float(data['quantity']),
            data['unit'],
            data['customerName']
        ]
        
        # Add to Google Sheets
        worksheet.append_row(row_data)
        
        # Log transaction to TransactionHistory
        transaction_sheet = get_worksheet(TRANSACTION_HISTORY_SHEET_NAME)
        if transaction_sheet:
            transaction_sheet.append_row([
                timestamp,
                "PO",
                data['itemName'],
                float(data['quantity']),
                data['unit'],
                data['customerName']
            ])
        
        # Return the created entry
        response_data = {
            'timestamp': timestamp,
            'itemName': data['itemName'],
            'quantity': float(data['quantity']),
            'unit': data['unit'],
            'customerName': data['customerName']
        }
        
        print("✅ PO entry and transaction logged successfully:", response_data)
        return jsonify(response_data), 201
        
    except ValueError as e:
        return jsonify({'error': 'Invalid quantity value'}), 400
    except Exception as e:
        print(f"❌ Error adding PO entry: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/po-entries', methods=['GET'])
def get_po_entries():
    """Get all PO entries"""
    try:
        worksheet = get_worksheet(PO_SHEET_NAME)
        if not worksheet:
            return jsonify({'error': 'Unable to access PO sheet'}), 500
        
        # Get all records
        records = worksheet.get_all_records()
        
        # Sort by timestamp (newest first)
        records.sort(key=lambda x: x.get('Timestamp', ''), reverse=True)
        
        # Format the response
        formatted_records = []
        for record in records:
            formatted_record = {
                'timestamp': record.get('Timestamp', ''),
                'itemName': record.get('Item Name', ''),
                'quantity': float(record.get('Quantity', 0)) if record.get('Quantity') else 0,
                'unit': record.get('Unit', ''),
                'customerName': record.get('Customer Name', '')
            }
            formatted_records.append(formatted_record)
        
        print(f"📊 Retrieved {len(formatted_records)} PO entries")
        return jsonify(formatted_records), 200
        
    except Exception as e:
        print(f"❌ Error fetching PO entries: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/po-summary', methods=['GET'])
def get_po_summary():
    """Get PO summary statistics"""
    try:
        worksheet = get_worksheet(PO_SHEET_NAME)
        if not worksheet:
            return jsonify({'error': 'Unable to access PO sheet'}), 500
        
        records = worksheet.get_all_records()
        
        # Calculate summary statistics
        total_entries = len(records)
        unique_items = len(set(record.get('Item Name', '') for record in records))
        
        # Group by item and unit for quantities
        item_quantities = {}
        for record in records:
            item_name = record.get('Item Name', '')
            unit = record.get('Unit', '')
            quantity = float(record.get('Quantity', 0)) if record.get('Quantity') else 0
            customer_name = record.get('Customer Name', '')
            
            key = f"{item_name}_{unit}_{customer_name}"
            if key in item_quantities:
                item_quantities[key]['quantity'] += quantity
            else:
                item_quantities[key] = {
                    'itemName': item_name,
                    'unit': unit,
                    'quantity': quantity,
                    'customerName': customer_name
                }
        
        summary = {
            'totalEntries': total_entries,
            'uniqueItems': unique_items,
            'itemQuantities': list(item_quantities.values())
        }
        
        print("📈 PO Summary:", summary)
        return jsonify(summary), 200
        
    except Exception as e:
        print(f"❌ Error fetching PO summary: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# ============ NEW TRANSACTION HISTORY ROUTE ============
@app.route('/api/transaction-history', methods=['GET'])
def get_transaction_history():
    """Get all transaction history (Inward + PO)"""
    try:
        transaction_worksheet = get_worksheet(TRANSACTION_HISTORY_SHEET_NAME)
        if not transaction_worksheet:
            return jsonify({'error': 'Unable to access TransactionHistory sheet'}), 500
        
        # Get all records
        records = transaction_worksheet.get_all_records()
        
        # Sort by timestamp (newest first)
        records.sort(key=lambda x: x.get('Timestamp', ''), reverse=True)
        
        # Format the response
        formatted_records = []
        for record in records:
            formatted_record = {
                'timestamp': record.get('Timestamp', ''),
                'type': record.get('Type', ''),
                'itemName': record.get('Item Name', ''),
                'quantity': float(record.get('Quantity', 0)) if record.get('Quantity') else 0,
                'unit': record.get('Unit', ''),
                'customerName': record.get('Customer Name', '')
            }
            formatted_records.append(formatted_record)
        
        print(f"📊 Retrieved {len(formatted_records)} transactions")
        return jsonify(formatted_records), 200
        
    except Exception as e:
        print(f"❌ Error fetching transaction history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# ============ FUTURE: LIVE STOCK ROUTES ============
# ... (previous imports and setup remain the same)

@app.route('/api/live-stock', methods=['GET'])
def get_live_stock():
    """Calculate live stock (Inward - PO) grouped by Item Name and Unit"""
    try:
        inward_worksheet = get_worksheet(INWARD_SHEET_NAME)
        po_worksheet = get_worksheet(PO_SHEET_NAME)
        if not inward_worksheet or not po_worksheet:
            return jsonify({'error': 'Unable to access Inward or PO sheet'}), 500

        # Get all records
        inward_records = inward_worksheet.get_all_records()
        po_records = po_worksheet.get_all_records()

        # Aggregate Inward quantities
        inward_map = {}
        for record in inward_records:
            key = f"{record.get('Item Name', '')}_{record.get('Unit', '')}"
            quantity = float(record.get('Quantity', 0)) if record.get('Quantity') else 0
            inward_map[key] = inward_map.get(key, 0) + quantity

        # Aggregate PO quantities
        po_map = {}
        for record in po_records:
            key = f"{record.get('Item Name', '')}_{record.get('Unit', '')}"
            quantity = float(record.get('Quantity', 0)) if record.get('Quantity') else 0
            po_map[key] = po_map.get(key, 0) + quantity

        # Calculate live stock
        live_stock_data = []
        for key in set(inward_map.keys()).union(po_map.keys()):
            item_name, unit = key.split('_')
            inward_qty = inward_map.get(key, 0)
            po_qty = po_map.get(key, 0)
            live_stock = inward_qty - po_qty
            live_stock_data.append({
                'itemName': item_name,
                'unit': unit,
                'inwardQuantity': inward_qty,
                'poQuantity': po_qty,
                'liveStock': live_stock
            })

        # Sort by item name
        live_stock_data.sort(key=lambda x: x['itemName'])

        print(f"📊 Calculated {len(live_stock_data)} live stock entries")
        return jsonify(live_stock_data), 200

    except Exception as e:
        print(f"❌ Error calculating live stock: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# ... (rest of the code remains the same)

# ============ ERROR HANDLERS ============
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============ HEALTH CHECK ============
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'available_endpoints': [
            '/push-data (POST) - Inward entries',
            '/api/po-entry (POST) - Add PO entry',
            '/api/po-entries (GET) - Get all PO entries',
            '/api/po-summary (GET) - Get PO summary',
            '/api/transaction-history (GET) - Get transaction history',
            '/api/live-stock (GET) - Live stock calculation (Coming Soon)'
        ]
    }), 200

if __name__ == '__main__':
    print("🚀 Starting Inventory Management Backend...")
    print("📋 Available sheets: Inward, PO, TransactionHistory")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
    