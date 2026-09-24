const Material = require('../models/Material');
const Match = require('../models/Match');
const AuditLog = require('../models/AuditLog');
const { compareEngineeringSpecs } = require('./nlpNormalizer');

/**
 * High-Performance Bulk AI Matching Engine
 * Pre-indexes all records in memory and performs single-roundtrip bulk operations.
 * Completely immune to cloud network latency and serverless execution timeouts.
 */
async function runMatching() {
  const materials = await Material.find({});
  if (materials.length < 2) return 0;

  // 1. Pre-fetch and index all existing matches in-memory (O(1) lookups)
  const existingMatches = await Match.find({});
  const matchMap = new Map();
  const seenPairKeys = new Set();
  const duplicateIdsToDelete = [];

  for (const m of existingMatches) {
    const k1 = `${m.material_a}_${m.material_b}`;
    const k2 = `${m.material_b}_${m.material_a}`;
    const canonicalKey = (String(m.material_a) < String(m.material_b)) ? k1 : k2;

    if (seenPairKeys.has(canonicalKey)) {
      duplicateIdsToDelete.push(m._id);
    } else {
      seenPairKeys.add(canonicalKey);
      matchMap.set(k1, m);
      matchMap.set(k2, m);
    }
  }

  const bulkOps = [];
  let matchCount = 0;

  // Clean up any historical duplicate entries in DB
  if (duplicateIdsToDelete.length > 0) {
    duplicateIdsToDelete.forEach(id => {
      bulkOps.push({ deleteOne: { filter: { _id: id } } });
    });
  }

  // 2. Perform lightning-fast in-memory pairwise engineering comparisons
  for (let i = 0; i < materials.length; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      const matA = materials[i];
      const matB = materials[j];

      // Match across different CPSEs
      if (matA.cpse_name === matB.cpse_name) continue;

      const catA = (matA.category || '').toLowerCase();
      const catB = (matB.category || '').toLowerCase();

      // Skip completely disjoint categories if neither is general
      if (catA && catB && catA !== 'general' && catB !== 'general' && catA !== catB) {
        continue;
      }

      const result = compareEngineeringSpecs(matA, matB);

      const isAFirst = String(matA._id) < String(matB._id);
      const id1 = isAFirst ? matA._id : matB._id;
      const id2 = isAFirst ? matB._id : matA._id;
      const pairKey = `${id1}_${id2}`;

      const existingMatch = matchMap.get(pairKey);

      if (result.match_score >= 50) {
        matchCount++;
        if (existingMatch) {
          // Update existing match if pending or if score improved
          if (existingMatch.status === 'pending' || existingMatch.match_score < result.match_score) {
            bulkOps.push({
              updateOne: {
                filter: { _id: existingMatch._id },
                update: {
                  $set: {
                    material_a: id1,
                    material_b: id2,
                    match_score: result.match_score,
                    match_type: result.match_type,
                    field_comparison: result.field_comparison,
                    ai_reasoning: result.reasoning
                  }
                }
              }
            });
          }
        } else {
          // Stage new match for bulk insert
          const newDoc = {
            material_a: id1,
            material_b: id2,
            match_score: result.match_score,
            match_type: result.match_type,
            field_comparison: result.field_comparison,
            ai_reasoning: result.reasoning,
            status: 'pending'
          };
          bulkOps.push({ insertOne: { document: newDoc } });
          matchMap.set(pairKey, newDoc);
          matchMap.set(`${id2}_${id1}`, newDoc);
        }
      } else if (existingMatch && existingMatch.status === 'pending') {
        bulkOps.push({ deleteOne: { filter: { _id: existingMatch._id } } });
        matchMap.delete(pairKey);
        matchMap.delete(`${id2}_${id1}`);
      }
    }
  }

  // 3. Execute bulk write in a single network round-trip
  if (bulkOps.length > 0) {
    await Match.bulkWrite(bulkOps, { ordered: false });
  }

  await AuditLog.create({
    action: 'match_run',
    details: `Generated/Updated ${matchCount} matches across CPSEs`,
  });

  return matchCount;
}

module.exports = { runMatching };
