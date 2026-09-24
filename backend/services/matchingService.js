const Material = require('../models/Material');
const Match = require('../models/Match');
const AuditLog = require('../models/AuditLog');
const { compareMaterials } = require('./geminiService');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runMatching() {
  const materials = await Material.find({});
  let matchCount = 0;

  // Group materials by category or key domain for candidate generation
  for (let i = 0; i < materials.length; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      const matA = materials[i];
      const matB = materials[j];

      // Only match across different CPSEs
      if (matA.cpse_name === matB.cpse_name) continue;

      // Quick category or word overlap heuristic pre-filter to avoid unnecessary API calls
      const catA = (matA.category || '').toLowerCase();
      const catB = (matB.category || '').toLowerCase();
      const descA = matA.description.toLowerCase();
      const descB = matB.description.toLowerCase();

      const wordsA = descA.split(/\s+/).filter(w => w.length > 3);
      const hasWordOverlap = wordsA.some(w => descB.includes(w));
      const hasCatMatch = catA && catB && (catA === catB || catA === 'general' || catB === 'general');

      if (!hasWordOverlap && !hasCatMatch) continue;

      // Check if match already exists
      const existingMatch = await Match.findOne({
        $or: [
          { material_a: matA._id, material_b: matB._id },
          { material_a: matB._id, material_b: matA._id }
        ]
      });

      if (existingMatch) continue;

      try {
        const result = await compareMaterials(matA, matB);
        
        // Save matches with a reasonable score
        if (result.match_score >= 50) {
          const match = new Match({
            material_a: matA._id,
            material_b: matB._id,
            match_score: result.match_score,
            match_type: result.match_type,
            field_comparison: result.field_comparison,
            ai_reasoning: result.reasoning
          });
          await match.save();
          matchCount++;
        }
        
        // Small delay
        await delay(100);
      } catch (err) {
        console.error('Error comparing materials:', err);
      }
    }
  }

  await AuditLog.create({
    action: 'match_run',
    details: `Generated ${matchCount} matches across CPSEs`,
  });

  return matchCount;
}

module.exports = { runMatching };

