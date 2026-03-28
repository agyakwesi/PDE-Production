import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const VaultPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/users/me').then(res => res.json()).then(data => setUser(data)).catch(console.error);
    fetch('/api/orders/me').then(res => res.json()).then(data => setOrders(data || [])).catch(console.error);
  }, []);

  if (!user) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--color-primary)' }}>Accessing Dossier...</div>;

  const hasOrders = orders.length > 0;
  const totalAcquisitions = orders.length;

  // Determine Founder 50 Milestones
  const getMilestoneInfo = () => {
    if (totalAcquisitions >= 10) return { 
      tier: "The Vault Architect", 
      reward: 'Landed Cost Access', 
      desc: 'You pay zero profit to PDE. Only supplier cost + shipping.',
      next: null 
    };
    if (totalAcquisitions >= 5) return { 
      tier: 'Founder Elite', 
      reward: '15% Applied Discount', 
      desc: 'A permanent reduction on your 5th acquisition.',
      next: { count: 10, label: 'Vault Access' } 
    };
    if (totalAcquisitions >= 3) return { 
      tier: 'Founder Member', 
      reward: 'Discovery Perk Unlocked', 
      desc: 'Free Deodorant/Body Spray with your 3rd order.',
      next: { count: 5, label: '15% Discount' } 
    };
    return { 
      tier: 'Founder Candidate', 
      reward: 'Initial Allocation', 
      desc: 'Complete your first few acquisitions to unlock perks.',
      next: { count: 3, label: 'Discovery Perk' } 
    };
  };

  const milestone = getMilestoneInfo();

  return (
    <div style={{ padding: '6rem 4rem' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '4rem', fontFamily: 'var(--font-display)' }}>
        My <span style={{ color: 'var(--color-primary)' }}>Archives</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '4rem' }}>
        {/* Profile Sidebar */}
        <div>
          <div style={{ background: 'var(--color-surface-container-low)', padding: '2rem', border: '1px solid var(--color-outline-variant)' }}>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Acquisitions</p>
            <p style={{ fontSize: '3rem', fontFamily: 'var(--font-display)' }}>{totalAcquisitions}</p>
          </div>
        </div>

        {/* My Collection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>My Collection</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {orders.length === 0 ? (
            <div style={{ color: 'var(--color-on-surface-variant)', gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-outline-variant)' }}>
              No acquisitions yet. Your collection starts with your first pre-order.
            </div>
          ) : orders.map((order) => (
            <motion.div 
              key={order._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ cursor: 'pointer' }} 
              onClick={() => navigate(`/catalog/${order.product?._id}`)}
            >
              <div style={{ background: 'var(--color-surface-container-lowest)', aspectRatio: '4/5', position: 'relative', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute', top: '1rem', left: '1rem',
                  background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)',
                  padding: '0.25rem 0.5rem', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', zIndex: 2
                }}>{order.orderStatus}</div>
                {order.product?.image ? (
                  <img src={order.product.image} alt={order.product?.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ color: 'var(--color-outline-variant)', fontSize: '4rem' }}>🧴</div>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>{order.product?.name}</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{order.product?.house}</p>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Sidebar — Only show roadmap if user has active orders */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          background: 'var(--color-surface-container-low)', 
          padding: '3rem 2rem',
          position: 'sticky',
          top: '6rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '3rem' }}>
            {hasOrders ? 'Order Status' : 'Getting Started'}
          </h2>
          
          {hasOrders ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '1px', background: 'var(--color-outline-variant)', zIndex: 0 }} />
              {orders.slice(0, 1).map(order => {
                const steps = [
                  { status: 'Confirmed', title: 'Pre-Order Placed', desc: 'Your slot has been secured in the current batch.', active: true },
                  { status: 'Processing', title: 'Supplier Consolidation', desc: 'Batch filled. Your order is being consolidated at the supplier hub.', active: order.orderStatus !== 'pending' },
                  { status: 'Shipped', title: 'In Transit', desc: 'Your order is being shipped to Ghana.', active: order.orderStatus === 'shipped' || order.orderStatus === 'delivered' },
                  { status: 'Ready', title: 'Ready for Pickup', desc: 'Your authenticated bottle is ready for collection.', active: order.orderStatus === 'delivered' }
                ];
                const currentIdx = steps.findLastIndex(s => s.active);
                return steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1, opacity: step.active ? 1 : 0.4 }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      background: i === currentIdx ? 'var(--color-surface-container-low)' : (step.active ? 'var(--color-primary)' : 'var(--color-surface-container-highest)'),
                      border: i === currentIdx ? '1px solid var(--color-primary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: i === currentIdx ? 'var(--color-primary)' : 'var(--color-surface-container-lowest)',
                      fontSize: '0.6rem'
                    }}>
                      {i === currentIdx ? '○' : (step.active ? '✓' : '')}
                    </div>
                    <div>
                      <p style={{ color: step.active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                        {step.status}
                      </p>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', lineHeight: 1.5 }}>{step.desc}</p>
                    </div>
                  </div>
                ));
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { num: '01', title: 'Browse the Catalog', desc: 'Find the niche perfume you want to pre-order.' },
                { num: '02', title: 'Place Your Pre-Order', desc: 'Secure your slot and pay your deposit.' },
                { num: '03', title: 'Unlock Founder Status', desc: 'Your first purchase unlocks Curator tier with 5% off all future orders.' }
              ].map(step => (
                <div key={step.num} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '0.15rem 0.4rem', fontSize: '0.65rem', height: 'fit-content' }}>{step.num}</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{step.title}</h4>
                    <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', lineHeight: 1.4 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
              <Button onClick={() => navigate('/catalog')} style={{ marginTop: '1rem' }}>Start Browsing</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultPage;
