const Material = require('../models/Material');
const Match = require('../models/Match');
const AuditLog = require('../models/AuditLog');
const { compareEngineeringSpecs } = require('./nlpNormalizer');

async function runMatching() {
  const materials = await Material.find({});
  let matchCount = 0;

  for (let i = 0; i < materials.length; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      const matA = materials[i];
      const matB = materials[j];

      // Only match across different CPSEs
      if (matA.cpse_name === matB.cpse_name) continue;

      const catA = (matA.category || '').toLowerCase();
      const catB = (matB.category || '').toLowerCase();

      // Don't compare completely disjoint explicit categories (e.g. Drilling vs Safety or Pipes vs Electrical)
      if (catA && catB && catA !== 'general' && catB !== 'general' && catA !== catB) {
        continue;
      }

      try {
        const result = compareEngineeringSpecs(matA, matB);

        // Check if match already exists
        const existingMatch = await Match.findOne({
          $or: [
            { material_a: matA._id, material_b: matB._id },
            { material_a: matB._id, material_b: matA._id }
          ]
        });

        if (result.match_score >= 50) {
          if (existingMatch) {
            // Update existing pending match with precision engineering specs
            if (existingMatch.status === 'pending') {
              existingMatch.match_score = result.match_score;
              existingMatch.match_type = result.match_type;
              existingMatch.field_comparison = result.field_comparison;
              existingMatch.ai_reasoning = result.reasoning;
              await existingMatch.save();
              matchCount++;
            }
          } else {
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
        } else if (existingMatch && existingMatch.status === 'pending') {
          // If previously saved by buggy logic but true score < 50, clean it up
          await Match.findByIdAndDelete(existingMatch._id);
        }
      } catch (err) {
        console.error('Error comparing materials:', err);
      }
    }
  }

  await AuditLog.create({
    action: 'match_run',
    details: `Generated/Updated ${matchCount} matches across CPSEs`,
  });

  return matchCount;
}

module.exports = { runMatching };
