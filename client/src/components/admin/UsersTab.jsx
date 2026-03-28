import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const UsersTab = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const toggleFounder = (id) => {
    setUsers(users.map(u => u._id === id ? { ...u, isFounder: !u.isFounder } : u));
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '2rem' }}>Founders Roster</h2>
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1rem', marginBottom: '3rem', maxWidth: '600px' }}>
        Control network access layers. Granting "Founder" status applies a permanent 15% reduction across all archival releases.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 1.5fr 1fr 1fr', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--color-outline-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>
        <div>Patron</div>
        <div>Contact</div>
        <div>Origin</div>
        <div>Status Control</div>
      </div>

      {users.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Scanning network for patrons...</div>
      ) : users.map(user => (
        <div key={user._id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 1.5fr 1fr 1fr', gap: '1rem', padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-surface-container-highest)', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{user.email}</div>
          <div style={{ fontSize: '0.875rem' }}>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
          <div>
            <button 
              onClick={() => toggleFounder(user._id)}
              style={{
                background: user.isFounder ? 'var(--color-primary)' : 'transparent',
                color: user.isFounder ? 'var(--color-surface)' : 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                padding: '0.5rem 1rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {user.isFounder ? 'Revoke Founder' : 'Grant Founder'}
            </button>
          </div>
        </div>
      ))}

    </div>
  );
};

export default UsersTab;
