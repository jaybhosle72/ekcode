const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Match = require('../models/Match');
const UnifiedMaterial = require('../models/UnifiedMaterial');
const { calculateSavings } = require('../services/savingsCalculator');

router.get('/stats', async (req, res) => {
  try {
    const totalMaterials = await Material.countDocuments();
    const totalMatches = await Match.countDocuments();
    const pendingMatches = await Match.countDocuments({ status: 'pending' });
    const approvedMatches = await Match.countDocuments({ status: 'approved' });
    const totalUnified = await UnifiedMaterial.countDocuments();

    // Aggregations
    const matchesByType = await Match.aggregate([
      { $group: { _id: "$match_type", count: { $sum: 1 } } }
    ]);

    const materialsByCategory = await Material.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const materialsByCpse = await Material.aggregate([
      { $group: { _id: "$cpse_name", count: { $sum: 1 } } }
    ]);

    const duplicatesFound = await Match.countDocuments({ match_type: { $in: ['identical', 'near-duplicate'] } });

    const savingsData = await calculateSavings();

    res.json({
      totalMaterials,
      totalMatches,
      pendingMatches,
      approvedMatches,
      totalUnified,
      duplicatesFound,
      savingsEstimate: savingsData.totalSavings,
      savingsByCategory: savingsData.savingsByCategory,
      matchesByType,
      materialsByCategory,
      materialsByCpse
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
