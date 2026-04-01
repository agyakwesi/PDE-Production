const Product = require('../models/Product');
const { getGlobalPrice } = require('../utils/pricing');

const createProduct = async (req, res) => {
  try {
    const { name, brand, supplierCost, localRetailPrice, image, description, notes, stockQuantity, category, gender, perfumer, rating, season } = req.body;
    
    // Convert string notes to an array
    const parsedNotes = notes ? notes.split(',').map(n => n.trim()).filter(n => n.length > 0) : [];

    const newProduct = await Product.create({
      name,
      brand,
      supplierCost: Number(supplierCost),
      scentProfile: parsedNotes,
      images: image ? [image] : [],
      description: description || '',
      stockQuantity: Number(stockQuantity) || 0,
      localRetailPrice: localRetailPrice ? Number(localRetailPrice) : undefined,
      category: category || 'Niche',
      wardrobeCategory: req.body.wardrobeCategory || 'None',
      gender: gender || 'Unisex',
      perfumer: perfumer || '',
      rating: Number(rating) || 0,
      season: season || ''
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isArchive: false }).sort({ createdAt: -1 }).lean();
    
    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      supplierCost: p.supplierCost,
      price: getGlobalPrice(p.supplierCost),
      localRetailPrice: p.localRetailPrice,
      savings: p.savings,
      stockQuantity: p.stockQuantity || 0,
      category: p.category || 'Niche',
      wardrobeCategory: p.wardrobeCategory || 'None',
      gender: p.gender || 'Unisex',
      status: p.stockQuantity > 0 ? `${p.stockQuantity} SLOTS AVAILABLE` : 'BE THE FIRST TO REQUEST',
      badge: null,
      image: p.images && p.images.length > 0 ? p.images[0] : null,
      description: p.description || '',
      notes: p.scentProfile && p.scentProfile.length > 0 ? p.scentProfile.join(', ') : ''
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Reference not found' });
    }
    
    const formattedProduct = {
      id: product._id,
      name: product.name,
      brand: product.brand,
      supplierCost: product.supplierCost,
      price: getGlobalPrice(product.supplierCost),
      localRetailPrice: product.localRetailPrice,
      savings: product.savings,
      description: product.description || 'A rare extrait de parfum curated for the discerning collector.',
      batchTotal: product.moq || 2,
      stockQuantity: product.stockQuantity || 0,
      wardrobeCategory: product.wardrobeCategory || 'None',
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      notes: product.scentProfile && product.scentProfile.length > 0 ? product.scentProfile : null,
    };
    
    res.status(200).json(formattedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, brand, supplierCost, localRetailPrice, image, description, notes, stockQuantity, category, gender, perfumer, rating, season } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (brand) updateData.brand = brand;
    if (supplierCost) updateData.supplierCost = Number(supplierCost);
    if (localRetailPrice !== undefined) updateData.localRetailPrice = Number(localRetailPrice);
    if (description !== undefined) updateData.description = description;
    if (stockQuantity !== undefined) updateData.stockQuantity = Number(stockQuantity);
    if (category) updateData.category = category;
    if (req.body.wardrobeCategory) updateData.wardrobeCategory = req.body.wardrobeCategory;
    if (gender) updateData.gender = gender;
    if (perfumer !== undefined) updateData.perfumer = perfumer;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (season !== undefined) updateData.season = season;
    if (image) updateData.images = [image];
    if (notes) {
      updateData.scentProfile = notes.split(',').map(n => n.trim()).filter(n => n.length > 0);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product removed from vault.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };

