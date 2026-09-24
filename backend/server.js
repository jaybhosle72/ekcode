const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Models for quick endpoints
const Material = require('./models/Material');
const UnifiedMaterial = require('./models/UnifiedMaterial');
const AuditLog = require('./models/AuditLog');

// Routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/graph', require('./routes/graphRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/erp', require('./routes/erpRoutes'));

// Direct helpers & aliases for frontend
app.get('/api/materials', async (req, res) => {
  try {
    const filter = {};
    if (req.query.cpse) filter.cpse_name = req.query.cpse;
    const materials = await Material.find(filter).sort({ uploaded_at: -1 }).limit(100);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get(['/api/master', '/api/unified'], async (req, res) => {
  try {
    const unified = await UnifiedMaterial.find({}).populate('mapped_codes.material_id').sort({ created_at: -1 });
    
    // Auto-calculate savings and totals if missing
    for (const item of unified) {
      if (!item.estimated_savings || item.estimated_savings === 0) {
        let totalCost = 0;
        let totalQty = 0;
        for (const m of item.mapped_codes) {
          const mat = m.material_id;
          if (mat) {
            const p = mat.unit_price || 0;
            const q = mat.annual_quantity || 0;
            totalCost += p * q;
            totalQty += q;
          }
        }
        item.estimated_savings = Math.round(totalCost * 0.15);
        if (!item.total_annual_quantity || item.total_annual_quantity === 0) {
          item.total_annual_quantity = totalQty;
        }
        await item.save();
      }
    }

    res.json(unified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit', async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
