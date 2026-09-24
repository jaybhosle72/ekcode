const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const AuditLog = require('../models/AuditLog');
const { generateCode } = require('../services/codeGenerator');

router.patch('/:id/approve', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.status = 'approved';
    match.reviewed_by = req.body.user || 'Admin';
    match.reviewed_at = new Date();
    await match.save();

    const unifiedMaterial = await generateCode(match._id);

    await AuditLog.create({
      action: 'approve',
      entity_type: 'match',
      entity_id: match._id,
      details: `Approved match and generated unified code ${unifiedMaterial.national_code}`
    });

    res.json({ success: true, match, unifiedMaterial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/reject', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.status = 'rejected';
    match.reviewed_by = req.body.user || 'Admin';
    match.reviewed_at = new Date();
    await match.save();

    await AuditLog.create({
      action: 'reject',
      entity_type: 'match',
      entity_id: match._id,
      details: 'Rejected match'
    });

    res.json({ success: true, match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
