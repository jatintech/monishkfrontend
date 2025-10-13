import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const UNITS = ['Kg', 'Nos', 'Pcs', 'Pkts', 'Boxes', 'Cases', 'Ltrs', 'Sets'];

const InwardPage = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inwardList, setInwardList] = useState([]);
  const [isInwardOpen, setIsInwardOpen] = useState(false);
  const [quantityInput, setQuantityInput] = useState({});
  const [unitInput, setUnitInput] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const processed = json.map((row, i) => ({
        id: i + 1,
        fullText: row.item || Object.values(row)[0],
      }));
      setItems(processed);
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return items.filter(item => item.fullText.toLowerCase().includes(query));
  }, [searchQuery, items]);

  const addToInward = (item) => {
    const qty = Number(quantityInput[item.id] || 0);
    const unit = unitInput[item.id];

    if (!qty || qty <= 0 || !unit) return alert('Enter quantity and select unit');

    setInwardList(prev => {
      const existing = prev.find(i => i.fullText === item.fullText && i.unit === unit);
      if (existing) {
        return prev.map(i =>
          i.fullText === item.fullText && i.unit === unit
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...item, quantity: qty, unit }];
    });

    setQuantityInput(prev => ({ ...prev, [item.id]: '' }));
    setUnitInput(prev => ({ ...prev, [item.id]: '' }));
  };

  const updateQuantity = (item, newQty) => {
    if (newQty <= 0) return removeFromInward(item);
    setInwardList(prev =>
      prev.map(i => (i.id === item.id && i.unit === item.unit ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromInward = (item) => {
    setInwardList(prev => prev.filter(i => !(i.id === item.id && i.unit === item.unit)));
  };

  const clearInward = () => setInwardList([]);

  const pushToSheet = async () => {
    if (inwardList.length === 0) return alert('No items to push');
    try {
      const response = await fetch("http://localhost:5000/push-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inwardList),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert("✅ Data pushed to Google Sheet!");
        setInwardList([]);
      } else {
        alert("❌ Push failed: " + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("❌ Network error while pushing data.");
    }
  };

  const totalItems = inwardList.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Item Search & Inward</h1>
          <div className="flex gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="bg-white p-2 rounded-lg border border-gray-300 shadow-sm text-sm"
            />
            <button
              onClick={() => setIsInwardOpen(!isInwardOpen)}
              className="relative bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Inward ({totalItems})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Items</h2>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3 max-h-[28rem] overflow-y-auto">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="text-gray-800 font-medium">{item.fullText}</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        className="w-24 px-3 py-2 border rounded"
                        value={quantityInput[item.id] || ''}
                        onChange={(e) =>
                          setQuantityInput(prev => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                      <select
                        className="px-2 py-2 border rounded"
                        value={unitInput[item.id] || ''}
                        onChange={(e) =>
                          setUnitInput(prev => ({ ...prev, [item.id]: e.target.value }))
                        }
                      >
                        <option value="">Unit</option>
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => addToInward(item)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inward Section */}
          <div className={`${isInwardOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Inward</h2>
                {inwardList.length > 0 && (
                  <button
                    onClick={clearInward}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                )}
              </div>

              {inwardList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No items inwarded yet.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[24rem] overflow-y-auto">
                    {inwardList.map((item) => (
                      <div key={`${item.id}-${item.unit}`} className="border-b border-gray-200 pb-4">
                        <div className="text-sm font-semibold text-gray-800">{item.fullText}</div>
                        <div className="text-sm text-gray-600">Unit: {item.unit}</div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromInward(item)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={pushToSheet}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mt-4"
                    >
                      Push to Sheet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InwardPage;
