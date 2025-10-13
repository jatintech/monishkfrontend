import React, { useState, useEffect } from "react";
import axios from "axios";

const LiveStockPage = () => {
  const [liveStock, setLiveStock] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);     // Error state

  useEffect(() => {
    const fetchLiveStock = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/api/live-stock");
        setLiveStock(response.data || []); // Fallback to empty array if undefined
      } catch (error) {
        console.error("Error fetching live stock:", error);
        setError("Failed to load live stock. Please try again later.");
        setLiveStock([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLiveStock();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchLiveStock, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array for one-time setup

  const styles = {
    container: {
      padding: '32px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#6b7280',
      margin: 0
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    },
    loadingText: {
      fontSize: '1.1rem',
      color: '#6b7280'
    },
    errorContainer: {
      padding: '32px',
      textAlign: 'center',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    errorText: {
      fontSize: '1.1rem',
      color: '#dc2626',
      margin: 0
    },
    noDataContainer: {
      textAlign: 'center',
      padding: '64px 32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    noDataText: {
      fontSize: '1.2rem',
      color: '#6b7280',
      margin: 0
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    thead: {
      backgroundColor: '#f9fafb'
    },
    th: {
      padding: '16px',
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #e5e7eb'
    },
    tbody: {
      backgroundColor: 'white'
    },
    tr: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s ease'
    },
    td: {
      padding: '16px',
      fontSize: '0.95rem',
      color: '#374151',
      textAlign: 'center' 
    },
    positiveStock: {
      color: '#059669',
      fontWeight: '600'
    },
    negativeStock: {
      color: '#dc2626',
      fontWeight: '600'
    },
    zeroStock: {
      color: '#d97706',
      fontWeight: '600'
    },
    statusIndicator: {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '8px'
    },
    refreshInfo: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '0.875rem',
      color: '#6b7280',
      padding: '16px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bae6fd'
    }
  };

  // Add CSS keyframes for spinner animation
  if (loading && !document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Live Stock</h1>
          <p style={styles.subtitle}>Real-time inventory tracking</p>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading live stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Live Stock</h1>
          <p style={styles.subtitle}>Real-time inventory tracking</p>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  const getStockStyle = (stock) => {
    if (stock > 0) return styles.positiveStock;
    if (stock < 0) return styles.negativeStock;
    return styles.zeroStock;
  };

  const getStatusIndicatorColor = (stock) => {
    if (stock > 0) return '#10b981';
    if (stock < 0) return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Live Stock</h1>
        <p style={styles.subtitle}>Real-time inventory tracking • Updated every 30 seconds</p>
      </div>
      
      {liveStock.length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={styles.noDataText}>No live stock data available.</p>
        </div>
      ) : (
        <>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Inward Quantity</th>
                  <th style={styles.th}>PO Quantity</th>
                  <th style={styles.th}>Live Stock</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody style={styles.tbody}>
                {liveStock.map((item, index) => (
                  <tr 
                    key={index} 
                    style={styles.tr}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <td style={{...styles.td, fontWeight: '600'}}>{item.itemName}</td>
                    <td style={styles.td}>{item.unit}</td>
                    <td style={styles.td}>{item.inwardQuantity}</td>
                    <td style={styles.td}>{item.poQuantity}</td>
                    <td style={{...styles.td, ...getStockStyle(item.liveStock)}}>
                      {item.liveStock}
                    </td>
                    <td style={styles.td}>
                      <span 
                        style={{
                          ...styles.statusIndicator, 
                          backgroundColor: getStatusIndicatorColor(item.liveStock)
                        }}
                      ></span>
                      {item.liveStock > 0 ? 'In Stock' : item.liveStock < 0 ? 'Oversold' : 'Out of Stock'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={styles.refreshInfo}>
            📊 Live stock data refreshes automatically every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
};

export default LiveStockPage;