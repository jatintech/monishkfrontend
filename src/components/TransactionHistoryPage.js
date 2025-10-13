import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/api/transaction-history");
        setTransactions(response.data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to load transaction history. Please try again later.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
    listContainer: {
      maxHeight: '500px',
      overflowY: 'auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    listItem: {
      fontSize: '1rem',
      color: '#374151',
      marginBottom: '12px',
      lineHeight: '1.5'
    },
    typeIcon: {
      fontWeight: 'bold',
      marginRight: '6px'
    }
  };

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
          <h1 style={styles.title}>Transaction History</h1>
          <p style={styles.subtitle}>Loading recent transactions...</p>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Fetching transaction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Transaction History</h1>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Transaction History</h1>
        <p style={styles.subtitle}>Inwards and Purchase Orders Log</p>
      </div>

      {transactions.length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={styles.noDataText}>No transaction history available.</p>
        </div>
      ) : (
        <div style={styles.listContainer}>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            {transactions.map((transaction, index) => (
              <li key={index} style={styles.listItem}>
                <span
                  style={{
                    ...styles.typeIcon,
                    color: transaction.type === 'Inward' ? '#10b981' : '#ef4444'
                  }}
                >
                  {transaction.type === "Inward" ? "▲" : "▼"}
                </span>
                <strong>{transaction.type}</strong>: {transaction.itemName} - {transaction.quantity} {transaction.unit}
                {transaction.customerName && ` (Customer: ${transaction.customerName})`}
                {" "}at {new Date(transaction.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
