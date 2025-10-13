import React from 'react';
import { Package, Send, BarChart3, History, TrendingUp, ArrowRight } from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  const dashboardCards = [
    {
      id: 'inward',
      title: 'Inward Management',
      description: 'Record incoming inventory from vendors/manufacturers',
      icon: Package,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      features: ['Upload Excel files', 'Search items', 'Add to inward list', 'Push to Google Sheets']
    },
    {
      id: 'po',
      title: 'Purchase Orders',
      description: 'Manage outgoing inventory to customers',
      icon: Send,
      color: '#10B981',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      features: ['Create PO entries', 'Track quantities', 'View recent orders', 'Auto-timestamping']
    },
    {
      id: 'stock',
      title: 'Live Stock',
      description: 'Real-time inventory calculation',
      icon: BarChart3,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      borderColor: '#C4B5FD',
      features: ['Live stock calculation', 'Inward vs PO tracking', 'Item-wise analysis', 'Auto-updates']
    },
    {
      id: 'transaction',
      title: 'Transaction History',
      description: 'View all inward and PO transactions',
      icon: History,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      features: ['View transaction logs', 'Filter by type', 'Timestamp details', 'Export history']
    }
  ];

  const handleCardClick = (cardId) => {
    if (onNavigate) {
      onNavigate(cardId);
    } else {
      console.log(`Navigating to ${cardId}`);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #eff6ff 100%)',
      padding: '48px 16px'
    },
    maxWidth: {
      maxWidth: '1280px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#6B7280',
      maxWidth: '768px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '48px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      border: '1px solid #E5E7EB'
    },
    statFlex: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      marginBottom: '4px'
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px',
      marginBottom: '64px'
    },
    card: {
      position: 'relative',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '2px solid',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    cardContent: {
      padding: '24px'
    },
    iconWrapper: {
      display: 'inline-flex',
      padding: '12px',
      borderRadius: '12px',
      marginBottom: '16px'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px'
    },
    cardDescription: {
      color: '#6B7280',
      marginBottom: '24px',
      lineHeight: '1.5'
    },
    featuresTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px'
    },
    featuresList: {
      marginBottom: '24px'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      color: '#6B7280',
      marginBottom: '8px'
    },
    featureDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '12px'
    },
    button: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s ease'
    },
    overview: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E5E7EB',
      padding: '32px'
    },
    overviewTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '24px',
      textAlign: 'center'
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '32px'
    },
    overviewItem: {
      textAlign: 'center'
    },
    overviewIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    },
    overviewItemTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px'
    },
    overviewItemDescription: {
      color: '#6B7280',
      lineHeight: '1.5'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <h1 style={styles.title}>Inventory Management Dashboard</h1>
          <p style={styles.subtitle}>
            Streamline your inventory operations with our comprehensive management system. 
            Track inward stock, manage purchase orders, monitor live inventory, and review transaction history.
          </p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statFlex}>
              <div>
                <p style={styles.statLabel}>Total Modules</p>
                <p style={styles.statNumber}>4</p>
              </div>
              <div style={{...styles.overviewIcon, backgroundColor: '#DBEAFE'}}>
                <TrendingUp size={32} color="#2563EB" />
              </div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statFlex}>
              <div>
                <p style={styles.statLabel}>Active Features</p>
                <p style={styles.statNumber}>4</p>
              </div>
              <div style={{...styles.overviewIcon, backgroundColor: '#DCFCE7'}}>
                <Package size={32} color="#16A34A" />
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statFlex}>
              <div>
                <p style={styles.statLabel}>Recent Updates</p>
                <p style={styles.statNumber}>4</p>
              </div>
              <div style={{...styles.overviewIcon, backgroundColor: '#F3E8FF'}}>
                <BarChart3 size={32} color="#9333EA" />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.cardsGrid}>
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                style={{
                  ...styles.card,
                  borderColor: card.borderColor,
                  backgroundColor: card.bgColor // ✅ Fix applied here
                }}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.cardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.cardContent}>
                  <div style={{...styles.iconWrapper, backgroundColor: card.color}}>
                    <Icon size={32} color="white" />
                  </div>
                  <h3 style={styles.cardTitle}>{card.title}</h3>
                  <p style={styles.cardDescription}>{card.description}</p>
                  <div style={styles.featuresList}>
                    <p style={styles.featuresTitle}>Key Features:</p>
                    {card.features.map((feature, index) => (
                      <div key={index} style={styles.feature}>
                        <div style={{...styles.featureDot, backgroundColor: card.color}}></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCardClick(card.id)}
                    style={{...styles.button, backgroundColor: card.color}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Open
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.overview}>
          <h2 style={styles.overviewTitle}>How It Works</h2>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewItem}>
              <div style={{...styles.overviewIcon, backgroundColor: '#DBEAFE'}}>
                <Package size={32} color="#2563EB" />
              </div>
              <h3 style={styles.overviewItemTitle}>1. Inward Management</h3>
              <p style={styles.overviewItemDescription}>
                Record all incoming inventory from vendors and manufacturers with detailed tracking.
              </p>
            </div>
            <div style={styles.overviewItem}>
              <div style={{...styles.overviewIcon, backgroundColor: '#DCFCE7'}}>
                <Send size={32} color="#16A34A" />
              </div>
              <h3 style={styles.overviewItemTitle}>2. Purchase Orders</h3>
              <p style={styles.overviewItemDescription}>
                Manage outgoing inventory to customers with comprehensive order tracking.
              </p>
            </div>
            <div style={styles.overviewItem}>
              <div style={{...styles.overviewIcon, backgroundColor: '#F3E8FF'}}>
                <BarChart3 size={32} color="#9333EA" />
              </div>
              <h3 style={styles.overviewItemTitle}>3. Live Stock</h3>
              <p style={styles.overviewItemDescription}>
                Real-time calculation of available stock based on inward and outward movements.
              </p>
            </div>
            <div style={styles.overviewItem}>
              <div style={{...styles.overviewIcon, backgroundColor: '#FEF3C7'}}>
                <History size={32} color="#D97706" />
              </div>
              <h3 style={styles.overviewItemTitle}>4. Transaction History</h3>
              <p style={styles.overviewItemDescription}>
                View a complete log of all inward and PO transactions with detailed timestamps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
