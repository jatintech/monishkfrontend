import React, { useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Search, Upload } from "lucide-react";

const UNITS = ["Kg", "Nos", "Pcs", "Pkts", "Boxes", "Cases", "Ltrs", "Sets"];

const POPage = () => {
  const [items, setItems] = useState([]);
  const [poList, setPOList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantityInput, setQuantityInput] = useState({});
  const [unitInput, setUnitInput] = useState({});
  const [customerName, setCustomerName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const processed = json.map((row, i) => ({
        id: i + 1,
        fullText: row.item || Object.values(row)[0] || "",
      }));
      setItems(processed);
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.fullText.toLowerCase().includes(query)
    );
  }, [searchQuery, items]);

  const addToPOList = (item) => {
    const qty = Number(quantityInput[item.id] || 0);
    const unit = unitInput[item.id];

    if (!qty || qty <= 0 || !unit) {
      alert("Please enter a valid quantity and select a unit");
      return;
    }

    setPOList((prev) => {
      const existing = prev.find(
        (i) => i.itemName === item.fullText && i.unit === unit
      );
      if (existing) {
        return prev.map((i) =>
          i.itemName === item.fullText && i.unit === unit
            ? { ...i, quantity: Number(i.quantity) + qty }
            : i
        );
      }
      return [...prev, { itemName: item.fullText, quantity: qty, unit }];
    });

    setQuantityInput((prev) => ({ ...prev, [item.id]: "" }));
    setUnitInput((prev) => ({ ...prev, [item.id]: "" }));
    alert("Item added to PO");
  };

  const handleSubmit = async () => {
    if (poList.length === 0) {
      alert("No items to submit");
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/submit_po`, { poList });
      alert("PO submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error submitting PO");
    }
  };

  const handlePushToSheets = async () => {
    if (poList.length === 0) {
      alert("No items to push");
      return;
    }
    if (!customerName.trim()) {
      alert("Please provide a customer name");
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      for (const item of poList) {
        await axios.post(`${API_URL}/api/po-entry`, {
          ...item,
          customerName: customerName.trim(),
        });
      }
      alert("PO pushed to sheets!");
      resetForm();
    } catch (error) {
      console.error("Push failed:", error);
      alert("Error pushing PO to sheets");
    }
  };

  const resetForm = () => {
    setPOList([]);
    setItems([]);
    setSearchQuery("");
    setQuantityInput({});
    setUnitInput({});
    setCustomerName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Purchase Order Entry</h1>

      <div className="mb-6">
        <label className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300 shadow-sm w-full max-w-xs cursor-pointer">
          <Upload size={20} className="text-gray-400" />
          <span className="text-sm text-gray-600">Upload Excel File</span>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Item selection panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Items</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredItems.length === 0 && searchQuery.trim() && (
                <p className="text-gray-500 text-center">No items found</p>
              )}
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="text-gray-800 font-medium">{item.fullText}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      className="w-24 px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      value={quantityInput[item.id] || ""}
                      onChange={(e) =>
                        setQuantityInput((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="px-2 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      value={unitInput[item.id] || ""}
                      onChange={(e) =>
                        setUnitInput((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Unit</option>
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => addToPOList(item)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PO Summary + Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">PO Summary</h2>

          {poList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items added to PO.</p>
            </div>
          ) : (
            <ul className="list-disc ml-6 space-y-2 text-gray-800">
              {poList.map((item, index) => (
                <li key={index}>
                  {item.itemName} - {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleSubmit}
            disabled={poList.length === 0}
            className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            Submit PO
          </button>

          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 mt-4"
          />

          <button
            onClick={handlePushToSheets}
            disabled={poList.length === 0 || !customerName.trim()}
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Push to Sheets
          </button>
        </div>
      </div>
    </div>
  );
};

export default POPage;
