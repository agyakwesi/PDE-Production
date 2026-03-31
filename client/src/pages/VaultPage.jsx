import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import WardrobeTracker from '../components/profile/WardrobeTracker';
import ConsultantNote from '../components/profile/ConsultantNote';
import { useAuth } from '../context/AuthContext';
import './VaultPage.css';

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
    <div className="vault-error-state">
      <h2 className="vault-error-title">Dossier Access Error</h2>
      <p className="vault-error-desc">We could not verify your clearance for this sector.</p>
      <Button onClick={() => window.location.reload()}>Retry Authentication</Button>
    </div>
  );

  if (!user || !user._id) return (
    <div className="vault-loading-state">
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="vault-loading-text"
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
    <div className="vault-page">
      <h1 className="vault-header">
        My <span>Archives</span>
      </h1>

      <ConsultantNote />
      <WardrobeTracker />

      <div className="vault-layout">
        {/* Profile Sidebar */}
        <div className="vault-sidebar">
          <div className="vault-stat-card">
            <p className="vault-stat-title">Acquisitions</p>
            <p className="vault-stat-value">{totalAcquisitions}</p>
          </div>

          <div className="vault-milestone-card">
             <p className="vault-milestone-tier">{milestone.tier}</p>
             <h4 className="vault-milestone-reward">{milestone.reward}</h4>
             <p className="vault-milestone-desc">{milestone.desc}</p>
             
             {milestone.next && (
               <div className="vault-milestone-next">
                 <p className="vault-milestone-next-title">Next Achievement: {milestone.next.count} Orders</p>
                 <div className="vault-milestone-bar-bg">
                   <div className="vault-milestone-bar-fill" style={{ width: `${(totalAcquisitions / milestone.next.count) * 100}%` }} />
                 </div>
                 <p className="vault-milestone-next-label">{milestone.next.label}</p>
               </div>
             )}
          </div>
          
          <div className="vault-id-card">
            <p className="vault-id-title">Network ID</p>
            <p className="vault-id-value">PN-{user._id?.slice(-8)?.toUpperCase() || 'ANONYMOUS'}</p>
            <p className="vault-id-date">Registered {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* My Collection */}
        <div className="vault-content">
          <div className="vault-section-header">
            <h2 className="vault-section-title">My Collection</h2>
          </div>

          <div className="vault-collection-grid">
            {orders.length === 0 ? (
              <div className="vault-empty-state">
                No acquisitions yet. Your collection starts with your first pre-order.
              </div>
            ) : orders.map((order) => (
              <motion.div 
                key={order._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="vault-collection-item"
                onClick={() => order.product?._id && navigate(`/catalog/${order.product?._id}`)}
              >
                <div className="vault-item-image-container">
                  <div className="vault-item-status">{order.orderStatus}</div>
                  {order.product?.image ? (
                    <img src={order.product.image} alt={order.product?.name} className="vault-item-image" />
                  ) : (
                    <div style={{ color: 'var(--color-outline-variant)', fontSize: '4rem' }}>🧴</div>
                  )}
                </div>
                <h3 className="vault-item-name">{order.product?.name}</h3>
                <p className="vault-item-brand">{order.product?.brand}</p>
              </motion.div>
            ))}
          </div>

          <div className="vault-roadmap-section">
            <h2 className="vault-roadmap-title">Roadmap</h2>
            {hasOrders ? (
              <div className="vault-roadmap-container">
                <div className="vault-roadmap-line" />
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
                    <div key={i} className="vault-roadmap-step" style={{ opacity: step.active ? 1 : 0.4 }}>
                      <div className="vault-roadmap-icon" style={{ 
                        background: i === currentIdx ? 'var(--color-surface-container-low)' : (step.active ? 'var(--color-primary)' : 'var(--color-surface-container-highest)'),
                        border: i === currentIdx ? '1px solid var(--color-primary)' : 'none',
                        color: i === currentIdx ? 'var(--color-primary)' : 'var(--color-surface-container-lowest)'
                      }}>
                        {i === currentIdx ? '○' : (step.active ? '✓' : '')}
                      </div>
                      <div>
                        <p className="vault-roadmap-status" style={{ color: step.active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
                          {step.status}
                        </p>
                        <h3 className="vault-roadmap-step-title">{step.title}</h3>
                        <p className="vault-roadmap-step-desc" style={{ color: 'var(--color-on-surface-variant)' }}>{step.desc}</p>
                      </div>
                    </div>
                  ));
                })}
              </div>
            ) : (
              <div className="vault-how-it-works">
                {[
                  { num: '01', title: 'Allocation', desc: 'Find the niche reference you want to secure.' },
                  { num: '02', title: 'Manifest', desc: 'Pay your deposit and join the next cargo flight.' },
                  { num: '03', title: 'Discovery', desc: 'Collect your authenticated bottle at the showroom.' }
                ].map(step => (
                  <div key={step.num} className="vault-hiw-card">
                    <div className="vault-hiw-num">{step.num}</div>
                    <h4 className="vault-hiw-title">{step.title}</h4>
                    <p className="vault-hiw-desc">{step.desc}</p>
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
