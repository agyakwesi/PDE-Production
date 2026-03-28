const axios = require('axios');
const { callAI } = require('../services/aiHelpers');

exports.getPricingStrategy = async (req, res) => {
  const { name, brand, supplierCost } = req.body;
  if (!name || !supplierCost) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Fetch Live Exchange Rate (Free Open API)
    let liveRate = 11.00; // Fallback
    try {
      const fxData = await axios.get('https://open.er-api.com/v6/latest/USD');
      if (fxData.data && fxData.data.rates && fxData.data.rates.GHS) {
        liveRate = fxData.data.rates.GHS;
      }
    } catch(fxErr) {
      console.warn("Failed to fetch live FX rate, using fallback:", fxErr.message);
    }

    // 2. Query Llama 3 for Pricing Strategy
    const systemPrompt = `You are a Chief Pricing Strategist for a luxury MERN-stack perfume platform in Ghana.
You analyze raw supplier costs and market parameters to generate hyper-accurate retail prices in Cedis (GHS).

Rules & Guidelines:
- Live Rate: 1 USD = ${liveRate} GHS.
- Cedi Volatility Buffer: Typically 10-20% (e.g. 1.15 to 1.20) to guard against inflation.
- Shipping Cost: $9 to $12 per kg.
- Weight Estimation: Niche perfumes (like Nishane, Xerjoff) have heavy glass and caps (~0.4kg - 0.5kg). Designer perfumes (~0.35kg). Calculate estimated shipping.
- Luxury Margin: 35% to 50% (1.35 to 1.50 multiplier) depending on the brand prestige.

Output must be ONLY a valid minified JSON object matching this structure:
{
  "liveRate": ${liveRate},
  "estimatedWeightKg": 0.4,
  "shippingRateUSD": 9,
  "suggestedBuffer": 1.17,
  "suggestedMargin": 1.45,
  "retailPriceGHS": 3200,
  "reasoning": "Brief 2-sentence explanation of why you chose these exact margins and weights for this specific brand."
}`;

    const userMessage = `Calculate the optimal retail strategy for:
Brand: ${brand || 'Unknown'}
Name: ${name}
Supplier Cost: $${supplierCost} USD`;

    const responseText = await callAI(systemPrompt, userMessage, 0.4, 500, true);
    let pricingData;
    
    try {
      pricingData = JSON.parse(responseText);
    } catch(parseErr) {
      // Fallback manual JS calculation if AI fails to return strict JSON
      const weight = 0.35;
      const ship = weight * 9;
      const landed = Number(supplierCost) + ship;
      const safe = landed * liveRate * 1.17;
      const retail = safe * 1.45;
      
      pricingData = {
        liveRate,
        estimatedWeightKg: weight,
        shippingRateUSD: 9,
        suggestedBuffer: 1.17,
        suggestedMargin: 1.45,
        retailPriceGHS: Math.round(retail),
        reasoning: "AI payload failed, fell back to default static engine calculation utilizing live forex rate."
      };
    }

    res.json(pricingData);
  } catch (error) {
    console.error("Pricing Intel Error:", error);
    res.status(500).json({ error: "Failed to generate market strategy." });
  }
};
