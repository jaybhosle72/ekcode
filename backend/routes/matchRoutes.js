const express = require('express');
const router = express.Router();
const { runMatching } = require('../services/matchingService');
const Match = require('../models/Match');
const AuditLog = require('../models/AuditLog');
const { generateCode } = require('../services/codeGenerator');

// List matches with optional filters
router.get(['/', '/all'], async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.match_type && req.query.match_type !== 'all') filter.match_type = req.query.match_type;

    const matches = await Match.find(filter)
      .populate('material_a')
      .populate('material_b')
      .sort({ match_score: -1 })
      .limit(100);
      
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger cross-CPSE matching
router.post('/run', async (req, res) => {
  try {
    res.json({ message: 'Matching process started.' });
    
    runMatching().then(count => {
      console.log(`Matching complete. Generated ${count} matches.`);
    }).catch(err => {
      console.error('Error during matching:', err);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a match -> generates unified national code
const handleApprove = async (req, res) => {
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
      details: `Approved match and generated unified code ${unifiedMaterial?.national_code || 'N/A'}`
    });

    res.json({ success: true, match, unifiedMaterial });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reject a match
const handleReject = async (req, res) => {
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
    console.error('Reject error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/:id/approve', handleApprove);
router.patch('/:id/approve', handleApprove);

router.post('/:id/reject', handleReject);
router.patch('/:id/reject', handleReject);

module.exports = router;

