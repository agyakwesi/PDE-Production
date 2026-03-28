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
    <div style={{ padding: '6rem 4rem', display: 'flex', gap: '4rem' }}>
      
      <div style={{ flex: 2 }}>
        <p style={{ color: 'var(--color-primary)', letterSpacing: '0.15em', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Founder 50 Protocol
        </p>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '4rem', fontFamily: 'var(--font-display)' }}>
          The <span style={{ color: 'var(--color-primary-container)', fontStyle: 'italic' }}>Founder</span> Vault
        </h1>

        {/* Milestone Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            border: '1px solid var(--color-outline-variant)', 
            padding: '3rem', 
            background: 'var(--color-surface-container-low)',
            marginBottom: '6rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--color-primary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                Active Identity
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '1rem' }}>
                {milestone.tier}
              </h2>
              <div style={{ 
                display: 'inline-block',
                background: 'var(--color-primary)',
                color: 'var(--color-background)',
                padding: '0.5rem 1rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '2rem'
              }}>
                {milestone.reward}
              </div>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.85rem', maxWidth: '400px', lineHeight: 1.6 }}>
                {milestone.desc}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Acquisitions</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', lineHeight: 1 }}>{totalAcquisitions}</div>
              
              {milestone.next && (
                <div style={{ marginTop: '2rem' }}>
                  <p style={{ color: 'var(--color-primary)', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Next: {milestone.next.label}</p>
                  <div style={{ width: '150px', height: '2px', background: 'rgba(255,255,255,0.05)', marginLeft: 'auto' }}>
                    <div style={{ width: `${(totalAcquisitions / milestone.next.count) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            marginTop: '3.5rem', 
            paddingTop: '2.5rem', 
            borderTop: '1px solid var(--color-outline-variant)',
            display: 'flex',
            gap: '3rem'
          }}>
            {[
              { count: 3, label: 'Discovery Perk', active: totalAcquisitions >= 3 },
              { count: 5, label: '15% Off order', active: totalAcquisitions >= 5 },
              { count: 10, label: 'Vault Access', active: totalAcquisitions >= 10 }
            ].map(m => (
              <div key={m.count} style={{ opacity: m.active ? 1 : 0.3, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '18px', height: '18px', borderRadius: '50%', border: `1px solid ${m.active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--color-primary)'
                }}>
                  {m.active ? '✓' : ''}
                </div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                   {m.count}: {m.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

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
