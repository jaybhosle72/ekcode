function checkQuality(materials) {
  const results = [];
  
  // Categorize prices for anomaly detection
  const pricesByCategory = {};
  materials.forEach(m => {
    if (m.category && m.unit_price) {
      if (!pricesByCategory[m.category]) pricesByCategory[m.category] = [];
      pricesByCategory[m.category].push(m.unit_price);
    }
  });

  const avgPriceByCategory = {};
  for (const cat in pricesByCategory) {
    const sum = pricesByCategory[cat].reduce((a, b) => a + b, 0);
    avgPriceByCategory[cat] = sum / pricesByCategory[cat].length;
  }

  materials.forEach(m => {
    const flags = [];
    if (!m.unit_of_measure) flags.push('Missing unit_of_measure');
    if (m.description && m.description.split(' ').length < 5) flags.push('Short description');
    
    if (m.category && m.unit_price && avgPriceByCategory[m.category]) {
      if (m.unit_price > 3 * avgPriceByCategory[m.category]) {
        flags.push('Price anomaly (>3x average)');
      }
    }

    if (flags.length > 0) {
      results.push({ id: m._id, flags });
    }
  });

  return results;
}

module.exports = { checkQuality };
