const UnifiedMaterial = require('../models/UnifiedMaterial');
const Material = require('../models/Material');

async function calculateSavings() {
  const unifiedMaterials = await UnifiedMaterial.find({}).populate('mapped_codes.material_id');
  let totalSavings = 0;
  const savingsByCategory = {};

  for (const um of unifiedMaterials) {
    if (um.mapped_codes.length > 1) {
      // Multiple CPSEs buying the same item -> 15% discount
      let totalCost = 0;
      for (const mapping of um.mapped_codes) {
        if (mapping.material_id && mapping.material_id.unit_price && mapping.material_id.annual_quantity) {
          totalCost += mapping.material_id.unit_price * mapping.material_id.annual_quantity;
        }
      }

      const savings = totalCost * 0.15;
      totalSavings += savings;

      um.estimated_savings = savings;
      await um.save();

      const category = um.category || 'Unknown';
      savingsByCategory[category] = (savingsByCategory[category] || 0) + savings;
    }
  }

  return { totalSavings, savingsByCategory };
}

module.exports = { calculateSavings };
