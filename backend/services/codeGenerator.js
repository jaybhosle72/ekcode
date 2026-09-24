const Match = require('../models/Match');
const Material = require('../models/Material');
const UnifiedMaterial = require('../models/UnifiedMaterial');
const { generateNationalCode } = require('./geminiService');

async function generateCode(matchId) {
  const match = await Match.findById(matchId).populate('material_a material_b');
  if (!match) throw new Error('Match not found');

  const { material_a, material_b } = match;

  // Calculate annual expenditure across both CPSEs
  const costA = (material_a.unit_price || 0) * (material_a.annual_quantity || 0);
  const costB = (material_b.unit_price || 0) * (material_b.annual_quantity || 0);
  const totalCost = costA + costB;
  const savings = Math.round(totalCost * 0.15); // 15% demand aggregation bulk discount
  const totalQty = (material_a.annual_quantity || 0) + (material_b.annual_quantity || 0);

  // Check if either material is already mapped to an existing National Code
  let existingUnified = await UnifiedMaterial.findOne({
    $or: [
      { 'mapped_codes.material_id': material_a._id },
      { 'mapped_codes.material_id': material_b._id }
    ]
  });

  if (existingUnified) {
    // Add new mapping if not present
    const hasA = existingUnified.mapped_codes.some(m => m.material_id?.toString() === material_a._id.toString());
    const hasB = existingUnified.mapped_codes.some(m => m.material_id?.toString() === material_b._id.toString());

    if (!hasA) {
      existingUnified.mapped_codes.push({
        cpse: material_a.cpse_name,
        code: material_a.original_code,
        material_id: material_a._id
      });
    }
    if (!hasB) {
      existingUnified.mapped_codes.push({
        cpse: material_b.cpse_name,
        code: material_b.original_code,
        material_id: material_b._id
      });
    }

    existingUnified.total_annual_quantity = (existingUnified.total_annual_quantity || 0) + (hasA ? 0 : material_a.annual_quantity || 0) + (hasB ? 0 : material_b.annual_quantity || 0);
    existingUnified.estimated_savings = (existingUnified.estimated_savings || 0) + savings;
    await existingUnified.save();
    return existingUnified;
  }

  // Generate new national code
  const result = await generateNationalCode(
    material_a.category || material_b.category || 'General',
    { ...material_a.specifications, ...material_b.specifications }
  );

  const unifiedMaterial = new UnifiedMaterial({
    national_code: result.national_code,
    standard_description: material_a.description,
    category: material_a.category || 'General',
    mapped_codes: [
      { cpse: material_a.cpse_name, code: material_a.original_code, material_id: material_a._id },
      { cpse: material_b.cpse_name, code: material_b.original_code, material_id: material_b._id }
    ],
    total_annual_quantity: totalQty,
    estimated_savings: savings
  });

  await unifiedMaterial.save();
  return unifiedMaterial;
}

module.exports = { generateCode };

