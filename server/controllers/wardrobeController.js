const Order = require('../models/Order');
const Product = require('../models/Product');
const Batch = require('../models/Batch');
const User = require('../models/User');

const getWardrobeAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('externalCollection');
    
    // 1. Fetch Internal Collection (Completed Orders)
    const orders = await Order.find({ 
      user: userId, 
      orderStatus: { $in: ['Ready for Pickup', 'Completed', 'Confirmed'] } // Including Confirmed as it's an 'acquisition'
    }).populate('product');

    const internalScents = orders.map(o => ({
      id: o.product?._id,
      name: o.product?.name,
      brand: o.product?.brand,
      category: o.product?.wardrobeCategory,
      type: 'internal'
    })).filter(s => s.category && s.category !== 'None');

    // 2. Map External Collection
    const externalScents = user.externalCollection.map(s => ({
      id: s._id,
      name: s.name,
      brand: s.brand,
      category: s.category,
      type: 'external'
    }));

    const fullCollection = [...internalScents, ...externalScents];

    // 3. Aggregate Categories
    const categories = ['Day', 'Night', 'Office', 'Rainy Day'];
    const analysis = categories.map(cat => ({
      category: cat,
      scents: fullCollection.filter(s => s.category === cat),
      count: fullCollection.filter(s => s.category === cat).length
    }));

    // 4. Identify Gaps
    const sortedAnalysis = [...analysis].sort((a, b) => a.count - b.count);
    const primaryGap = sortedAnalysis[0]; // Category with fewest scents

    // 5. Find Recommendations from Active Batches
    // We'll search for products tagged with the gap category that are currently available for pre-order
    const openBatches = await Batch.find({ status: 'Open' });
    const openBatchIds = openBatches.map(b => b._id);

    // This part is a bit tricky: we need products associated with open batches.
    // In this system, products don't necessarily have a batchId, but Orders link them.
    // However, the Catalog displays products. Let's assume any product not in archive is available.
    // Or we can look for products that have been recently added to 'Open' batches.
    
    const recommendations = await Product.find({ 
      wardrobeCategory: primaryGap.category,
      isArchive: false 
    }).limit(1);

    const recommendation = recommendations[0];

    // 6. Generate Consultant Pitch
    let pitch = "";
    if (primaryGap.count === 0) {
      pitch = `Your collection has a total void in the **${primaryGap.category}** department. This is a critical gap. `;
    } else {
      pitch = `While your collection is growing, your **${primaryGap.category}** rotation is your weakest link. `;
    }

    if (recommendation) {
      pitch += `To fix this, we recommend **${recommendation.name}** by **${recommendation.brand}**. It's the perfect solution for your current profile.`;
    } else {
      pitch += `We're currently scouting the next batch for a world-class ${primaryGap.category} scent to fill this void. Stay tuned.`;
    }

    res.status(200).json({
      analysis,
      primaryGap: primaryGap.category,
      recommendation,
      pitch
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWardrobeAnalysis };
