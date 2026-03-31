import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import WardrobeTracker from '../components/profile/WardrobeTracker';
import ConsultantNote from '../components/profile/ConsultantNote';
import { useAuth } from '../context/AuthContext';

const VaultPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchVaultData = async () => {
      try {
        const userRes = await fetch('/api/users/me', { headers });
        if (userRes.status === 401) {
          logout();
          navigate('/auth');
          return;
        }
        if (!userRes.ok) throw new Error('Failed to fetch dossier');
        const userData = await userRes.json();
        setUser(userData);

        const ordersRes = await fetch('/api/orders/me', { headers });
        if (ordersRes.status === 401) {
          logout();
          navigate('/auth');
          return;
        }
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }
    };

    fetchVaultData();
  }, [navigate, logout]);

  if (isError) return (
    <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1.5rem' }}>Dossier Access Error</h2>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>We could not verify your clearance for this sector.</p>
      <Button onClick={() => window.location.reload()}>Retry Authentication</Button>
    </div>
  );

  if (!user || !user._id) return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}
      >
        Decrypting Archives...
      </motion.div>
    </div>
  );

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

      <ConsultantNote />
      <WardrobeTracker />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '4rem' }}>
        {/* Profile Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--color-surface-container-low)', padding: '2rem', border: '1px solid var(--color-outline-variant)' }}>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Acquisitions</p>
            <p style={{ fontSize: '3rem', fontFamily: 'var(--font-display)' }}>{totalAcquisitions}</p>
          </div>

          <div style={{ background: 'var(--color-surface-container-low)', padding: '2.5rem 2rem', border: '1px solid var(--color-outline-variant)' }}>
             <p style={{ color: 'var(--color-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{milestone.tier}</p>
             <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{milestone.reward}</h4>
             <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '2.5rem' }}>{milestone.desc}</p>
             
             {milestone.next && (
               <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '1.5rem' }}>
                 <p style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', marginBottom: '1rem' }}>Next Achievement: {milestone.next.count} Orders</p>
                 <div style={{ width: '100%', height: '2px', background: 'var(--color-surface-container-highest)', marginBottom: '0.5rem' }}>
                   <div style={{ width: `${(totalAcquisitions / milestone.next.count) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
                 </div>
                 <p style={{ fontSize: '0.75rem', textAlign: 'right' }}>{milestone.next.label}</p>
               </div>
             )}
          </div>
          
          <div style={{ padding: '2rem', border: '1px solid var(--color-outline-variant)', opacity: 0.6 }}>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Network ID</p>
            <p style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>PN-{user._id?.slice(-8)?.toUpperCase() || 'ANONYMOUS'}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', marginTop: '1rem' }}>Registered {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* My Collection */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>My Collection</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
            {orders.length === 0 ? (
              <div style={{ color: 'var(--color-on-surface-variant)', gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--color-outline-variant)' }}>
                No acquisitions yet. Your collection starts with your first pre-order.
              </div>
            ) : orders.map((order) => (
              <motion.div 
                key={order._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ cursor: 'pointer' }} 
                onClick={() => order.product?._id && navigate(`/catalog/${order.product?._id}`)}
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
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{order.product?.brand}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '3rem' }}>Roadmap</h2>
            {hasOrders ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', maxWidth: '600px' }}>
                <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '1px', background: 'var(--color-outline-variant)', zIndex: 0 }} />
                {orders.slice(0, 1).map((order) => {
                  const s = order.orderStatus;
                  const steps = [
                    { status: 'Confirmed', title: 'Pre-Order Secured', desc: 'Allocation validated and reserved in Dubai manifest.', active: true },
                    { status: 'Processing', title: 'Procurement Cycle', desc: 'Consolidating retail stock at the sourcing hub.', active: ['Processing', 'Shipped', 'Ready for Pickup', 'Completed'].includes(s) },
                    { status: 'Shipped', title: 'Exfiltration', desc: 'Air cargo manifest active. Shipping to Accra hub.', active: ['Shipped', 'Ready for Pickup', 'Completed'].includes(s) },
                    { status: 'Ready for Pickup', title: 'Architect Collection', desc: 'Arrived at showroom. Quality checks complete.', active: ['Ready for Pickup', 'Completed'].includes(s) },
                    { status: 'Completed', title: 'Manifest Closed', desc: 'Reference successfully acquired by patron.', active: s === 'Completed' }
                  ];
                  const currentIdx = steps.findLastIndex(st => st.active);
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                {[
                  { num: '01', title: 'Allocation', desc: 'Find the niche reference you want to secure.' },
                  { num: '02', title: 'Manifest', desc: 'Pay your deposit and join the next cargo flight.' },
                  { num: '03', title: 'Discovery', desc: 'Collect your authenticated bottle at the showroom.' }
                ].map(step => (
                  <div key={step.num} style={{ background: 'var(--color-surface-container-low)', padding: '2rem', border: '1px solid var(--color-outline-variant)' }}>
                    <div style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginBottom: '1.5rem', display: 'inline-block' }}>{step.num}</div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{step.title}</h4>
                    <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.75rem', lineHeight: 1.4 }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultPage;
