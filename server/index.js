const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wardrobeRoutes = require('./routes/wardrobeRoutes');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 image payload
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/scrape', require('./routes/scraperRoutes'));

app.post('/api/pricing-intel', require('./controllers/pricingController').getPricingStrategy);

app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return res.status(400).json({ error: 'Invalid base64 format.' });

    const ext = matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `upload_${Date.now()}.${ext}`;
    
    // Ensure uploads folder exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    res.status(200).json({ url: `http://localhost:5000/uploads/${filename}` });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: 'Upload sequence failed.' });
  }
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
