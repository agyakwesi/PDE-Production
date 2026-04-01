// Heritage Pricing Logic (Supplier Cost Centric)

export const FIXED_RATE = 10.90; 
const SHIPPING_COST_USD = 6.30;
export const BUFFER_PERCENT = 0.17; 
export const MARGIN_PERCENT = 0.45;

export const calculateLandedUSD = (supplierCost) => {
  const cost = parseFloat(supplierCost) || 0;
  return cost + SHIPPING_COST_USD;
};

export const calculateRetailGHS = (supplierCost) => {
  const landed = calculateLandedUSD(supplierCost);
  const withBuffer = landed * (1 + BUFFER_PERCENT);
  const retailUSD = withBuffer / (1 - MARGIN_PERCENT);
  return retailUSD * FIXED_RATE;
};

export const formatGHS = (amt) => `GH₵ ${Number(amt).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
export const formatUSD = (amt) => `$${Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const calculateBatchProgress = (current, target = 3000) => Math.min((current / target) * 100, 100);
