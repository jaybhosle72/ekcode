const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const materials = await Material.find(
      { description: { $regex: q, $options: 'i' } }
    ).limit(50);

    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
