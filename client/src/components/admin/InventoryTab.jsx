import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { calculateRetailGHS, formatGHS, calculateLandedUSD, formatUSD } from '../../utils/pricingEngine';
import API_BASE_URL from '../../config';

const InventoryTab = () => {
  const [form, setForm] = useState({ 
    name: '', brand: '', supplierCost: '',
    scrapeUrl: '', image: '', description: '', notes: '', stockQuantity: '', 
    category: 'Niche', gender: 'Unisex', wardrobeCategory: 'None'
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [bulkUrls, setBulkUrls] = useState('');
  const [activeMode, setActiveMode] = useState('single');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id || product._id);
    setForm({
      name: product.name || '',
      brand: product.brand || '',
      supplierCost: String(product.supplierCost || ''),
      image: product.image || '',
      description: product.description || '',
      notes: product.notes || '',
      stockQuantity: String(product.stockQuantity || 0),
      category: product.category || 'Niche',
      gender: product.gender || 'Unisex',
      wardrobeCategory: product.wardrobeCategory || 'None',
      scrapeUrl: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDiscoverySearch = async (query) => {
    if (!query) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/scrape/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async (urlToScrape) => {
    const url = urlToScrape || form.scrapeUrl;
    if(!url) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if(res.ok) {
        setForm({
          ...form,
          name: data.name || form.name,
          brand: data.brand || form.brand,
          image: data.image || form.image,
          description: data.description || form.description,
          notes: data.notes || (data.accords ? data.accords : form.notes),
          gender: data.gender || form.gender,
          scrapeUrl: url
        });
        setSearchResults([]);
      } else {
        alert("Scrape failed. Check URL format.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during scraping");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkScrape = async () => {
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/scrape/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      const data = await res.json();
      // For each success, we'll try to save it automatically if it has basic data
      // but per user's instruction "Wait for final review", we might just list them
      // for review? Actually, let's process them and show them as "Pending Review" items if possible,
      // or just alert the summary.
      console.log("Bulk Results:", data);
      alert(`Bulk processing complete. ${data.filter(r => r.status === 'success').length} succeeded.`);
      // Refresh inventory
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Bulk operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keeping handleCancelEdit, handleDelete, handleSave, handleEdit as they were) ...

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ 
      name: '', brand: '', supplierCost: '',
      scrapeUrl: '', image: '', description: '', notes: '', stockQuantity: '', 
      category: 'Niche', gender: 'Unisex', wardrobeCategory: 'None'
    });
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Reference will be purged from the Vault. Proceed?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if(!form.name || !form.brand || !form.supplierCost) {
      alert("Please fill in reference name, brand, and supplier cost.");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: form.name, 
          brand: form.brand, 
          supplierCost: Number(form.supplierCost),
          image: form.image,
          description: form.description,
          notes: form.notes,
          stockQuantity: Number(form.stockQuantity) || 0,
          category: form.category,
          gender: form.gender,
          wardrobeCategory: form.wardrobeCategory
        })
      });
      if(res.ok) {
        alert(editingId ? "Product Updated!" : "Successfully saved to the Vault!");
        setForm({ 
          name: '', brand: '', supplierCost: '',
          scrapeUrl: '', image: '', description: '', notes: '', stockQuantity: '', 
          category: 'Niche', gender: 'Unisex', wardrobeCategory: 'None'
        });
        setEditingId(null);
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert("Failed to save: " + errorData.message);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const cost = parseFloat(form.supplierCost) || 0;
  const targetRetail = calculateRetailGHS(cost);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
          {editingId ? 'Edit Reference' : 'Archival Inventory'}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface-container)', padding: '0.25rem', borderRadius: '4px' }}>
          <button 
            onClick={() => setActiveMode('single')}
            style={{ 
              padding: '0.5rem 1rem', border: 'none', borderRadius: '4px',
              background: activeMode === 'single' ? 'var(--color-primary)' : 'transparent',
              color: activeMode === 'single' ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
              cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600
            }}
          >
            Discovery
          </button>
          <button 
            onClick={() => setActiveMode('bulk')}
            style={{ 
              padding: '0.5rem 1rem', border: 'none', borderRadius: '4px',
              background: activeMode === 'bulk' ? 'var(--color-primary)' : 'transparent',
              color: activeMode === 'bulk' ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
              cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600
            }}
          >
            Bulk Ingest
          </button>
        </div>
      </div>
      
      {/* Search / Discovery Section */}
      {activeMode === 'single' ? (
        <div style={{ background: 'var(--color-surface-container-low)', padding: '2rem', marginBottom: '3rem', border: '1px solid var(--color-outline-variant)', position: 'relative' }}>
          <h3 style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Scent Discovery Core</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Input 
                placeholder="Search perfume name (e.g. Baccarat Rouge 540)..."
                value={form.scrapeUrl}
                onChange={(e) => {
                  setForm({...form, scrapeUrl: e.target.value});
                  // Optionally trigger search on debounce, but for now we'll use the button
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleDiscoverySearch(form.scrapeUrl)}
              />
              {searchResults.length > 0 && (
                <div style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  background: 'var(--color-surface)', border: '1px solid var(--color-outline-variant)',
                  zIndex: 100, marginTop: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}>
                  {searchResults.map((result, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleScrape(result.link)}
                      style={{ 
                        padding: '1rem', borderBottom: i < searchResults.length - 1 ? '1px solid var(--color-outline-variant)' : 'none',
                        cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-container)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{result.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)' }}>{result.link}</div>
                    </div>
                  ))}
                  <div 
                    onClick={() => setSearchResults([])}
                    style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-primary)', cursor: 'pointer', background: 'var(--color-surface-container-low)' }}
                  >
                    Close Results
                  </div>
                </div>
              )}
            </div>
            <Button variant="secondary" onClick={() => handleDiscoverySearch(form.scrapeUrl)}>{isLoading ? 'Finding...' : 'Discover'}</Button>
            <Button variant="secondary" onClick={() => handleScrape()}>{isLoading ? 'Scraping...' : 'Scan URL'}</Button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--color-on-surface-variant)' }}>
            Enter a perfume name to discover its dossier, or paste a direct Fragrantica link.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface-container-low)', padding: '2rem', marginBottom: '3rem', border: '1px solid var(--color-outline-variant)' }}>
          <h3 style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Bulk Archival Ingestion</h3>
          <textarea 
            placeholder="Paste multiple Fragrantica URLs (one per line)..."
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            style={{ 
              width: '100%', minHeight: '120px', padding: '1rem', 
              background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
              resize: 'vertical', marginBottom: '1.5rem'
            }}
          />
          <Button onClick={handleBulkScrape} disabled={isLoading || !bulkUrls}>
            {isLoading ? 'Processing Batch...' : 'Begin Bulk Acquisition'}
          </Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        
        {/* Form Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input label="Reference Name" placeholder="Perfume Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <Input label="Atelier / Brand" placeholder="Brand Name" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input label="Supplier Cost (USD)" placeholder="Raw Cost" type="number" value={form.supplierCost} onChange={(e) => setForm({...form, supplierCost: e.target.value})} />
            <Input label="Batch Capacity" placeholder="Slots" type="number" value={form.stockQuantity} onChange={(e) => setForm({...form, stockQuantity: e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Category</label>
              <select 
                value={form.category} 
                onChange={(e) => setForm({...form, category: e.target.value})}
                style={{ padding: '0.75rem', background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
              >
                <option value="Niche">Niche</option>
                <option value="Designer">Designer</option>
                <option value="Artisan">Artisan</option>
                <option value="Indie">Indie</option>
              </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>Wardrobe Segment (AI Consultant)</label>
            <select 
              value={form.wardrobeCategory} 
              onChange={(e) => setForm({...form, wardrobeCategory: e.target.value})}
              style={{ padding: '0.75rem', background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
            >
              <option value="None">Not Assigned</option>
              <option value="Day">Day (Fresh, Citrus, Clean)</option>
              <option value="Night">Night (Deep, Sexy, Oriental)</option>
              <option value="Office">Office (Professional, Subtle, Crisp)</option>
              <option value="Rainy Day">Rainy Day (Warm, Spicy, Cozy)</option>
            </select>
          </div>

          {/* Image Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>
              Product Image (Transparent PNG)
            </label>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = async () => {
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/upload`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ imageBase64: reader.result })
                    });
                    const data = await res.json();
                    if(res.ok) setForm(prev => ({...prev, image: data.url}));
                    else alert("Upload failed.");
                  } catch(err) { alert("Network error uploading."); }
                };
                reader.readAsDataURL(file);
              }}
              style={{ padding: '0.5rem', background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', cursor: 'pointer' }}
            />
            {form.image && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={form.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'contain', background: 'var(--color-surface-container)', borderRadius: '4px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>✓ Image linked</span>
              </div>
            )}
          </div>

          <Input label="Accords / Notes" placeholder="Comma separated (e.g. Oud, Amber, Musk)" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={handleSave} disabled={isLoading} style={{ flex: 1 }}>
              {isLoading ? 'Saving...' : editingId ? 'Update Reference' : 'Save to Vault'}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
            )}
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-outline-variant)', padding: '2rem', background: 'var(--color-surface)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '2rem', fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-primary)' }}>Pricing Intelligence</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Supplier Cost (USD)</p>
            <p style={{ fontSize: '1.25rem' }}>{formatUSD(cost)}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Target Retail (GHS)</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: 'var(--color-primary-container)' }}>{formatGHS(targetRetail)}</p>
          </div>
        </div>
      </div>

      {/* ============ INVENTORY LIST ============ */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>
            Vault Inventory <span style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>({products.length})</span>
          </h3>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-on-surface-variant)', border: '1px dashed var(--color-outline-variant)' }}>
            No references in the vault yet. Add your first perfume above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.map(product => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                  padding: '1.5rem', 
                  background: 'var(--color-surface-container-low)',
                  border: '1px solid var(--color-outline-variant)',
                  transition: 'border-color 0.3s'
                }}
              >
                {/* Product Image */}
                <div style={{ width: '60px', height: '60px', background: 'var(--color-surface-container)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: 'var(--color-outline-variant)', fontSize: '1.5rem' }}>🧴</span>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.brand} · {product.category || 'Niche'} · <span style={{ color: product.wardrobeCategory !== 'None' ? 'var(--color-primary)' : 'inherit' }}>{product.wardrobeCategory}</span>
                  </p>
                </div>

                {/* Batch Capacity */}
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch Cap</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: product.stockQuantity > 0 ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
                    {product.stockQuantity || 0}
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Supplier</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{formatUSD(product.supplierCost)}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>{formatGHS(calculateRetailGHS(product.supplierCost))}</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button 
                    onClick={() => handleEdit(product)}
                    style={{ 
                      padding: '0.5rem 1rem', background: 'transparent',
                      border: '1px solid var(--color-outline-variant)', 
                      color: 'var(--color-on-surface)', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'var(--color-outline-variant)'}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    style={{ 
                      padding: '0.5rem 1rem', background: 'transparent',
                      border: '1px solid rgba(200,50,50,0.3)', 
                      color: '#c83232', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(200,50,50,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default InventoryTab;
