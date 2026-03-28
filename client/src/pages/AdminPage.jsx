import React, { useState } from 'react';
import InventoryTab from '../components/admin/InventoryTab';
import BatchTab from '../components/admin/BatchTab';
import UsersTab from '../components/admin/UsersTab';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  const NavItem = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        background: activeTab === id ? 'var(--color-surface-container-low)' : 'transparent',
        border: '1px solid transparent',
        borderLeft: activeTab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
        color: activeTab === id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
        padding: '1rem',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'inventory': return <InventoryTab />;
      case 'batch': return <BatchTab />;
      case 'users': return <UsersTab />;
      default: return <InventoryTab />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', borderTop: '1px solid var(--color-outline-variant)' }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: '250px', 
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-outline-variant)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--color-outline-variant)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-on-surface)' }}>Control Room</h2>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Curator Access</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem 0' }}>
          <NavItem id="inventory" label="Inventory Intelligence" />
          <NavItem id="batch" label="Batch Operations" />
          <NavItem id="users" label="Founders Roster" />
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem 4rem', background: 'var(--color-background)' }}>
        {renderContent()}
      </div>

    </div>
  );
};

export default AdminPage;
