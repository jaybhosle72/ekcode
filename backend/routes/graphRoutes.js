const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Match = require('../models/Match');
const UnifiedMaterial = require('../models/UnifiedMaterial');

router.get('/', async (req, res) => {
  try {
    const materials = await Material.find({}).limit(100);
    const matches = await Match.find({ match_score: { $gte: 65 } }).limit(100);
    const unified = await UnifiedMaterial.find({}).limit(50);

    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Color map for CPSEs
    const cpseColors = {
      'ONGC': { bg: '#ef4444', border: '#b91c1c' },
      'BPCL': { bg: '#3b82f6', border: '#1d4ed8' },
      'IOC': { bg: '#10b981', border: '#047857' },
      'NATIONAL': { bg: '#8b5cf6', border: '#6d28d9' }
    };

    // Category coordinates for visual clustering
    const categoryOffsets = {
      'Pipes': { cx: 200, cy: 200 },
      'Valves': { cx: 800, cy: 200 },
      'Fasteners': { cx: 200, cy: 700 },
      'Fittings': { cx: 800, cy: 700 },
      'Electrical': { cx: 1400, cy: 200 },
      'Instruments': { cx: 1400, cy: 700 },
      'Safety': { cx: 500, cy: 1200 },
      'Chemicals': { cx: 1100, cy: 1200 },
      'General': { cx: 500, cy: 500 }
    };

    const categoryCounters = {};

    materials.forEach((m) => {
      const cat = m.category || 'General';
      if (!categoryCounters[cat]) categoryCounters[cat] = 0;
      const count = categoryCounters[cat]++;
      const center = categoryOffsets[cat] || { cx: 500, cy: 500 };
      
      const angle = (count * 0.7) + (m.cpse_name === 'ONGC' ? 0 : m.cpse_name === 'BPCL' ? 2.1 : 4.2);
      const radius = 120 + (count % 3) * 45;
      const x = center.cx + Math.cos(angle) * radius;
      const y = center.cy + Math.sin(angle) * radius;

      const cpseColor = cpseColors[m.cpse_name] || { bg: '#64748b', border: '#475569' };

      const nodeObj = {
        id: m._id.toString(),
        data: {
          label: `${m.original_code}\n${m.description.substring(0, 24)}...`,
          rawDescription: m.description,
          code: m.original_code,
          cpse: m.cpse_name,
          category: m.category,
          price: m.unit_price,
          unit: m.unit_of_measure
        },
        position: { x: Math.round(x), y: Math.round(y) },
        style: {
          background: cpseColor.bg,
          color: '#ffffff',
          border: `2px solid ${cpseColor.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          width: 150,
          whiteSpace: 'pre-line',
          textAlign: 'center'
        }
      };

      nodes.push(nodeObj);
      nodeMap.set(m._id.toString(), true);
    });

    // Add edges for verified matches
    matches.forEach(m => {
      const srcId = m.material_a.toString();
      const tgtId = m.material_b.toString();

      if (nodeMap.has(srcId) && nodeMap.has(tgtId)) {
        edges.push({
          id: `e-${m._id.toString()}`,
          source: srcId,
          target: tgtId,
          label: `${m.match_score}% ${m.match_type === 'identical' ? '≡' : '≈'}`,
          animated: m.match_score >= 80,
          style: {
            stroke: m.match_score >= 80 ? '#38bdf8' : '#eab308',
            strokeWidth: m.match_score >= 80 ? 2.5 : 1.5
          },
          labelStyle: {
            fill: '#f8fafc',
            fontSize: '10px',
            fontWeight: '600',
            background: '#0f172a',
            padding: '2px 4px',
            borderRadius: '4px'
          }
        });
      }
    });

    res.json({ nodes, edges, totalNodes: nodes.length, totalEdges: edges.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
