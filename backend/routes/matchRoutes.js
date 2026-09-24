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
    const count = await runMatching();
    res.json({
      success: true,
      message: `AI Matching complete. Generated/updated ${count} matches.`,
      matchesCount: count
    });
  } catch (err) {
    console.error('Error during matching run:', err);
    res.status(500).json({ error: err.message });
  }
});

// TIER 1: Technical Equivalence Endorsement (by CPSE Domain Officer e.g. ONGC / BPCL)
const handleEndorse = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const officerName = req.body.officer_name || req.body.user || 'CPSE Procurement Officer';
    const cpse = req.body.cpse || 'CPSE';
    const designation = req.body.designation || 'Materials & Procurement Specialist';

    match.status = 'endorsed';
    match.technical_endorsement = {
      endorsed_by: officerName,
      cpse: cpse,
      designation: designation,
      endorsed_at: new Date(),
      notes: req.body.notes || 'Verified metallurgical, pressure, and operational equivalence.'
    };
    await match.save();

    await AuditLog.create({
      action: 'technical_endorsement',
      entity_type: 'match',
      entity_id: match._id,
      user: `${officerName} (${cpse})`,
      details: `Technical equivalence verified & endorsed by ${officerName} (${cpse} - ${designation}). Forwarded to MoPNG Central Authority for sovereign ratification.`
    });

    res.json({ success: true, match });
  } catch (err) {
    console.error('Endorse error:', err);
    res.status(500).json({ error: err.message });
  }
};

// TIER 2: Sovereign Standardization & National Code Minting (by Central Government Authority - MoPNG)
const handleApprove = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const reviewingUser = req.body.user || 'Dr. Rajesh Verma (MoPNG Central Standardization Committee)';
    match.status = 'approved';
    match.reviewed_by = reviewingUser;
    match.reviewed_at = new Date();

    const unifiedMaterial = await generateCode(match._id);
    if (unifiedMaterial?.national_code) {
      match.suggested_national_code = unifiedMaterial.national_code;
    }
    await match.save();

    await AuditLog.create({
      action: 'sovereign_ratification',
      entity_type: 'match',
      entity_id: match._id,
      user: reviewingUser,
      details: `Sovereign Ratification issued by ${reviewingUser}. Official National Code ${unifiedMaterial?.national_code || 'N/A'} minted and scheduled for SAP/Oracle ERP broadcast across all CPSEs.`
    });

    res.json({ success: true, match, unifiedMaterial });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reject a match (Flagged as non-substitutable or technical mismatch)
const handleReject = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const reviewingUser = req.body.user || 'Authorized Officer';
    match.status = 'rejected';
    match.reviewed_by = reviewingUser;
    match.reviewed_at = new Date();
    await match.save();

    await AuditLog.create({
      action: 'reject',
      entity_type: 'match',
      entity_id: match._id,
      user: reviewingUser,
      details: `Match rejected by ${reviewingUser}: Flagged as non-substitutable due to engineering specification variance.`
    });

    res.json({ success: true, match });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Endpoints
router.post('/:id/endorse', handleEndorse);
router.patch('/:id/endorse', handleEndorse);

router.post('/:id/approve', handleApprove);
router.patch('/:id/approve', handleApprove);

router.post('/:id/reject', handleReject);
router.patch('/:id/reject', handleReject);

module.exports = router;
