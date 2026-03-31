import React, { useState, useEffect } from 'react';
import { calculateBatchProgress, formatGHS, FIXED_RATE } from '../../utils/pricingEngine';
import Button from '../ui/Button';

const BatchTab = () => {
  const [orders, setOrders] = useState([]);
  const targetMOV = 3000 * FIXED_RATE;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status, depositStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/update-status', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status, depositStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { 
          ...o, 
          orderStatus: status || o.orderStatus, 
          depositStatus: depositStatus || o.depositStatus 
        } : o));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const currentTotal = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const progress = calculateBatchProgress(currentTotal, targetMOV);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '2rem' }}>Dubai Batch #042</h2>

      <div style={{ 
        border: '1px solid var(--color-primary)', 
        padding: '3rem', 
        marginBottom: '3rem',
        background: 'var(--color-surface-container-low)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Container Trajectory</p>
            <p style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>{formatGHS(currentTotal)} / {formatGHS(targetMOV)}</p>
          </div>
          <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'var(--color-surface-container-highest)', marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-container), var(--color-primary))', boxShadow: 'var(--ambient-bloom)' }} />
          <div style={{ position: 'absolute', left: '100%', top: '-6px', height: '16px', width: '2px', background: 'red' }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>
            Requires {formatGHS(targetMOV - currentTotal)} more retail value to trigger cargo manifest.
          </p>
          {currentTotal >= targetMOV ? <Button>Trigger Cargo Manifest</Button> : <Button variant="secondary" disabled>Lock Cargo</Button>}
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '2rem', border: '1px solid var(--color-outline-variant)' }}>
        <h3 style={{ textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.1em', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '1rem' }}>Pre-Order Allocations (Locked)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>No active orders in this batch.</div>
          ) : orders.map(order => (
            <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid var(--color-surface-container-highest)', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{order.user?.name || 'Unknown Architect'}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>{order.product?.name} (x{order.quantity})</p>
              </div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Status</label>
                  <select 
                    value={order.orderStatus} 
                    onChange={(e) => updateStatus(order._id, e.target.value, null)}
                    style={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontSize: '0.75rem', padding: '0.25rem' }}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Deposit</label>
                  <select 
                    value={order.depositStatus} 
                    onChange={(e) => updateStatus(order._id, null, e.target.value)}
                    style={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontSize: '0.75rem', padding: '0.25rem' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>{formatGHS(order.totalPrice)}</p>
                  <p style={{ fontSize: '0.65rem', color: order.depositStatus === 'Paid' ? 'var(--color-primary)' : 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{order.depositStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BatchTab;
