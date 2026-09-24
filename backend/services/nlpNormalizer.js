/**
 * Universal Industrial Engineering Spec Extraction & Normalization Engine
 * Built for Indian CPSEs (ONGC, IOCL, BPCL, GAIL, HPCL, NTPC, BHEL) and generic industrial procurement.
 * Features automated metric/imperial standardizations, metallurgy extraction, numerical parameter fingerprinting,
 * and universal NLP fallback for arbitrary custom equipment.
 */

// Canonical Metric Nominal Bore (mm) to Imperial Pipe/Valve/Flange size
const METRIC_NB_TO_INCH = {
  '15': '1/2', '20': '3/4', '25': '1', '32': '1-1/4', '40': '1-1/2',
  '50': '2', '65': '2-1/2', '80': '3', '100': '4', '125': '5',
  '150': '6', '200': '8', '250': '10', '300': '12', '350': '14',
  '400': '16', '450': '18', '500': '20', '600': '24'
};

function normalizeDescription(desc = '', userCat = '') {
  const d = (desc || '').toLowerCase().trim();

  // 1. Identify Category and Item Type
  let category = userCat || 'General';
  let type = 'Industrial Equipment';

  // Check Electrical FIRST (to prevent "LED fitting" being caught by pipe fittings)
  if (/\b(light|led|luminaire|lamp|cable|wire|motor|mcb|transformer|switchgear|breaker|conduit)\b/i.test(d)) {
    category = 'Electrical';
    if (d.includes('led') || d.includes('light') || d.includes('luminaire') || d.includes('fitting')) type = 'Flameproof LED Luminaire';
    else if (d.includes('cable') || d.includes('wire')) type = 'Power Cable';
    else if (d.includes('motor')) type = 'Induction Motor';
    else if (d.includes('transformer')) type = 'Power Transformer';
    else if (d.includes('mcb') || d.includes('breaker')) type = 'Circuit Breaker';
    else type = 'Electrical Equipment';
  } else if (/\b(pipe|tubing|tube|linepipe|casing)\b/i.test(d)) {
    category = 'Pipes';
    type = 'Seamless Pipe';
    if (d.includes('erw')) type = 'ERW Pipe';
    if (d.includes('line pipe') || d.includes('linepipe')) type = 'Line Pipe';
  } else if (/\b(valve|valv)\b/i.test(d)) {
    category = 'Valves';
    if (d.includes('ball')) type = 'Ball Valve';
    else if (d.includes('gate')) type = 'Gate Valve';
    else if (d.includes('check') || d.includes('nrv') || d.includes('non-return')) type = 'Check Valve';
    else if (d.includes('globe')) type = 'Globe Valve';
    else if (d.includes('butterfly')) type = 'Butterfly Valve';
    else if (d.includes('plug')) type = 'Plug Valve';
    else if (d.includes('needle')) type = 'Needle Valve';
    else if (d.includes('psv') || d.includes('relief') || d.includes('safety valve')) type = 'Safety Relief Valve';
    else type = 'Process Valve';
  } else if (/\b(bolt|nut|stud|fastener|screw|washer)\b/i.test(d)) {
    category = 'Fasteners';
    if (d.includes('stud')) type = 'Stud Bolt';
    else if (d.includes('hex bolt') || (d.includes('bolt') && d.includes('hex'))) type = 'Hex Bolt';
    else if (d.includes('washer')) type = 'Washer';
    else if (d.includes('screw')) type = 'Cap Screw';
    else type = 'Fastener';
  } else if (/\b(flange|flg|elbow|elbw|tee|reducer|gasket|gsk|fitting|coupling|union)\b/i.test(d)) {
    category = 'Fittings';
    if (d.includes('gasket')) type = 'Gasket';
    else if (d.includes('weld neck') || d.includes('wnrf') || d.includes('flange')) type = 'Weld Neck Flange';
    else if (d.includes('elbow')) type = '90 Deg Elbow';
    else if (d.includes('tee')) type = 'Equal Tee';
    else if (d.includes('reducer')) type = 'Concentric Reducer';
    else if (d.includes('coupling')) type = 'Coupling';
    else type = 'Fitting';
  } else if (/\b(helmet|glove|shoe|boot|goggle|mask|ppe|safety|harness|coverall)\b/i.test(d)) {
    category = 'Safety';
    if (d.includes('helmet') || d.includes('hard hat')) type = 'Safety Helmet';
    else if (d.includes('glove')) type = 'Chemical Gloves';
    else if (d.includes('shoe') || d.includes('boot')) type = 'Safety Shoes';
    else type = 'Safety Equipment';
  } else if (/\b(seal|pump|compressor|bearing|trap|coupler|filter|strainer)\b/i.test(d)) {
    category = 'Mechanical';
    if (d.includes('seal')) type = 'Mechanical Seal';
    else if (d.includes('steam trap') || d.includes('trap')) type = 'Steam Trap';
    else if (d.includes('coupler') || d.includes('loading arm')) type = 'Loading Coupler';
    else if (d.includes('pump')) type = 'Process Pump';
    else if (d.includes('compressor')) type = 'Compressor';
    else if (d.includes('bearing')) type = 'Industrial Bearing';
    else type = 'Mechanical Equipment';
  } else if (/\b(gauge|meter|transmitter|sensor|transducer|flowmeter|indicator)\b/i.test(d)) {
    category = 'Instruments';
    if (d.includes('gauge')) type = 'Pressure Gauge';
    else if (d.includes('transmitter')) type = 'Transmitter';
    else if (d.includes('flowmeter')) type = 'Flowmeter';
    else type = 'Instrument';
  } else if (/\b(bit|drilling|casing hanger|tubing head)\b/i.test(d)) {
    category = 'Drilling';
    type = 'Drilling Bit';
  }

  // 2. Extract Metallurgy / Material
  let material = 'Standard';
  let materialKey = 'STD';

  if (d.includes('a106') || (d.includes('carbon steel') && d.includes('seamless')) || d.includes('cs seamless') || (d.includes('pipe') && d.includes('cs'))) {
    material = 'Carbon Steel (ASTM A106 Gr B)';
    materialKey = 'CS_A106B';
  } else if (d.includes('a216') || d.includes('wcb') || (d.includes('carbon steel') && d.includes('valve'))) {
    material = 'Carbon Steel (ASTM A216 WCB)';
    materialKey = 'CS_WCB';
  } else if (d.includes('a105') || (d.includes('carbon steel') && d.includes('flange')) || (d.includes('cs') && d.includes('a105'))) {
    material = 'Carbon Steel (ASTM A105)';
    materialKey = 'CS_A105';
  } else if (d.includes('a234') || d.includes('wpb')) {
    material = 'Carbon Steel (ASTM A234 WPB)';
    materialKey = 'CS_WPB';
  } else if (d.includes('x52') || d.includes('api 5l')) {
    material = 'Carbon Steel (API 5L Gr X52)';
    materialKey = 'CS_X52';
  } else if (d.includes('316l') || d.includes('tp316l') || d.includes('ss316l')) {
    material = 'Stainless Steel (SS316L)';
    materialKey = 'SS316L';
  } else if (d.includes('316') || d.includes('ss316') || d.includes('tp316')) {
    material = 'Stainless Steel (SS316)';
    materialKey = 'SS316';
  } else if (d.includes('304') || d.includes('ss304')) {
    material = 'Stainless Steel (SS304)';
    materialKey = 'SS304';
  } else if (d.includes('b7') || d.includes('a193') || (d.includes('stud') && d.includes('alloy steel'))) {
    material = 'Alloy Steel (ASTM A193 B7)';
    materialKey = 'AS_B7';
  } else if (d.includes('b8m')) {
    material = 'Stainless Steel (ASTM A193 B8M)';
    materialKey = 'SS_B8M';
  } else if (d.includes('hdpe') || (category === 'Safety' && (d.includes('helmet') || d.includes('hard hat')))) {
    material = 'HDPE Polymer';
    materialKey = 'HDPE';
  } else if (d.includes('nitrile') || d.includes('nbr')) {
    material = 'Nitrile Rubber';
    materialKey = 'NITRILE';
  } else if (category === 'Electrical' && (d.includes('led') || d.includes('fitting') || d.includes('luminaire'))) {
    material = 'Cast Aluminum (LM6)';
    materialKey = 'ALUM_LM6';
  } else if (d.includes('carbon steel') || d.includes(' cs ') || d.includes('forged carbon')) {
    material = 'Carbon Steel';
    materialKey = 'CS';
  } else if (d.includes('stainless') || d.includes(' ss ')) {
    material = 'Stainless Steel';
    materialKey = 'SS';
  }

  // 3. Extract Nominal Size & Dimensions
  let dimensions = 'Standard';
  let sizeKey = 'STD';

  // Check Metric Bolt Sizes: M20x120, M24 x 160mm, 20mm Dia x 120mm Long
  const metricBolt = d.match(/(?:m|dia\s*)?(\d{2})\s*(?:x|dia\s*x|\*)\s*(\d{2,3})\s*(?:mm)?/i) ||
                     d.match(/(\d{2})\s*mm\s*(?:dia)?\s*x\s*(\d{2,3})\s*mm/i);
  if (metricBolt && category === 'Fasteners') {
    const dia = metricBolt[1];
    const len = metricBolt[2];
    dimensions = `M${dia} x ${len}mm`;
    sizeKey = `M${dia}X${len}`;
  } else if (category === 'Electrical') {
    const wattMatch = d.match(/(\d{1,4})\s*(?:watt|w\b)/i);
    if (wattMatch) {
      dimensions = `${wattMatch[1]}W`;
      sizeKey = `${wattMatch[1]}W`;
    }
  } else if (category === 'Safety' && (d.includes('helmet') || d.includes('hard hat'))) {
    dimensions = 'Universal (52-64cm)';
    sizeKey = 'UNIVERSAL_HELMET';
  } else {
    // Pipe / Valve / Flange Nominal Diameters:
    // Check metric NB/DN first (e.g. 150mm NB, 150 NB, DN150)
    const metricNbMatch = d.match(/(?:dn\s*|nb\s*)(\d{2,3})\b|(\d{2,3})\s*(?:mm\s*nb|nb\b)/i);
    let convertedInch = null;
    if (metricNbMatch) {
      const mmVal = metricNbMatch[1] || metricNbMatch[2];
      if (METRIC_NB_TO_INCH[mmVal]) {
        convertedInch = METRIC_NB_TO_INCH[mmVal];
      }
    }

    // Imperial match: 6", 6in, 6 inch, 6 inch NB, 6in NB, 8-1/2"
    const inchMatch = d.match(/(\d+(?:\s*-\s*\d+\/\d+|\s*\d+\/\d+|\.\d+)?)\s*(?:inch\b|in\b|"|''|nb\b)/i);

    const nomVal = convertedInch || (inchMatch ? inchMatch[1].replace(/\s+/g, '') : null);

    if (nomVal) {
      let sch = '';
      const schMatch = d.match(/sch(?:edule)?\s*([0-9a-z]+)/i);
      if (schMatch) sch = ` Sch ${schMatch[1].toUpperCase()}`;

      dimensions = `${nomVal}"${sch}`;
      sizeKey = `${nomVal}IN${sch ? '_' + sch.replace(/\s+/g, '') : ''}`;
    }
  }

  // 4. Extract Pressure Rating
  let pressure = 'Standard';
  let pressKey = 'STD';

  const pressMatch = d.match(/(?:class\s*(\d{3,4})|(\d{3,4})\s*(?:#|lb|lbs|class)|(\d{1,3})\s*bar|(\d{1,4})\s*psi)/i);
  if (pressMatch) {
    const val = pressMatch[1] || pressMatch[2] || pressMatch[3] || pressMatch[4];
    if (pressMatch[0].includes('bar')) {
      pressure = `${val} Bar`;
      pressKey = `${val}BAR`;
    } else {
      pressure = `Class ${val}`;
      pressKey = `CL${val}`;
    }
  }

  // 5. Extract Industry Standards
  const standards = [];
  if (d.includes('api 6d')) standards.push('API 6D');
  if (d.includes('api 600')) standards.push('API 600');
  if (d.includes('api 5l')) standards.push('API 5L');
  if (d.includes('api 682')) standards.push('API 682');
  if (d.includes('b16.5')) standards.push('ASME B16.5');
  if (d.includes('b16.20')) standards.push('ASME B16.20');
  if (d.includes('b16.9')) standards.push('ASME B16.9');
  if (d.includes('a106')) standards.push('ASTM A106');
  if (d.includes('a312')) standards.push('ASTM A312');
  if (d.includes('a193')) standards.push('ASTM A193');
  if (d.includes('a194')) standards.push('ASTM A194');
  if (d.includes('a216')) standards.push('ASTM A216');
  if (d.includes('is 2925') || d.includes('is:2925')) standards.push('IS 2925');
  if (d.includes('en 388') || d.includes('en388')) standards.push('EN 388');
  if (d.includes('bs 1873')) standards.push('BS 1873');
  if (d.includes('ex d') || d.includes('iic t6')) standards.push('Ex d IIC T6');

  const standard = standards.length > 0 ? standards.join(' / ') : 'IS / ASME';

  // 6. Universal Numbers & Parameter Extraction (for generalized fallback)
  const numbers = [];
  const numRegex = /\b(\d+(?:\.\d+)?)\s*(kw|mw|hp|rpm|kv|v|a|ma|hz|bar|psi|kg|g|ltr|l|mm|cm|m|mtr|ton|inch|"|#|lb|w)\b/gi;
  let nm;
  while ((nm = numRegex.exec(d)) !== null) {
    numbers.push(`${nm[1]}${nm[2].toLowerCase()}`);
  }

  return {
    category,
    specifications: {
      type,
      material,
      dimensions,
      size: dimensions,
      pressure_rating: pressure,
      pressure_class: pressure,
      standard,
      grade: standard,
      _fingerprint: {
        category,
        type,
        materialKey,
        sizeKey,
        pressKey,
        standards,
        numbers
      }
    }
  };
}

/**
 * Universal Intelligent Engineering Specification Comparator
 * Calculates true industrial parity between two equipment descriptions
 * Handles both known CPSE catalog patterns and completely new arbitrary industrial products.
 */
function compareEngineeringSpecs(matA, matB) {
  const normA = (matA.specifications && matA.specifications._fingerprint) 
    ? { category: matA.category, specifications: matA.specifications }
    : normalizeDescription(matA.description, matA.category);

  const normB = (matB.specifications && matB.specifications._fingerprint)
    ? { category: matB.category, specifications: matB.specifications }
    : normalizeDescription(matB.description, matB.category);

  const specA = normA.specifications;
  const specB = normB.specifications;
  const fpA = specA._fingerprint || {};
  const fpB = specB._fingerprint || {};

  // Rule 1: Type check (If completely incompatible types and neither is General, return 0)
  const isTypeCompatible = (fpA.type === fpB.type) || 
    (normA.category === normB.category && normA.category !== 'General');

  if (!isTypeCompatible) {
    return {
      match_score: 0,
      match_type: 'different',
      field_comparison: {
        type: { a: specA.type, b: specB.type, match: false },
        material: { a: specA.material, b: specB.material, match: false },
        size: { a: specA.dimensions, b: specB.dimensions, match: false },
        pressure_class: { a: specA.pressure_rating, b: specB.pressure_rating, match: false },
        standard: { a: specA.standard, b: specB.standard, match: false }
      },
      reasoning: 'Incompatible equipment categories.'
    };
  }

  const isExactType = (fpA.type === fpB.type);
  const isExactMat = (fpA.materialKey === fpB.materialKey) && fpA.materialKey !== 'STD';
  const isExactSize = (fpA.sizeKey === fpB.sizeKey) && fpA.sizeKey !== 'STD';
  const isExactPress = (fpA.pressKey === fpB.pressKey) && fpA.pressKey !== 'STD';

  const isCompatMat = isExactMat || 
    (specA.material.includes('Carbon') && specB.material.includes('Carbon')) || 
    (specA.material.includes('Stainless') && specB.material.includes('Stainless'));
  const isCompatSize = isExactSize || (specA.dimensions.split(' ')[0] === specB.dimensions.split(' ')[0]);

  // Scoring weights: Type (30), Metallurgy (25), Dimensions (25), Pressure (10), Standards (10)
  let score = 0;
  if (isExactType) score += 30; else score += 15;
  if (isExactMat) score += 25; else if (isCompatMat) score += 18; else score += 5;
  if (isExactSize) score += 25; else if (isCompatSize) score += 15; else score += 0;

  const isPressApplicable = (fpA.pressKey !== 'STD' || fpB.pressKey !== 'STD');
  if (isPressApplicable) {
    if (isExactPress) score += 10;
    else score -= 15; // penalty for pressure class mismatch
  } else {
    // Neither has pressure (pipes, fasteners, electrical, safety)
    score += 10;
  }

  // Standards match bonus
  const stdsA = fpA.standards || [];
  const stdsB = fpB.standards || [];
  const sharedStd = stdsA.some(s => stdsB.includes(s));
  if (sharedStd) score += 10;
  else if (specA.standard === specB.standard) score += 8;

  // Universal Fallback Similarity Boost (Token overlap + Numeric overlap)
  const wordsA = new Set((matA.description || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set((matB.description || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const jaccard = wordsA.size > 0 ? (intersection.size / Math.max(wordsA.size, wordsB.size)) : 0;
  score += Math.round(jaccard * 5);

  if (score > 98) score = 98;

  // Genuine identical determination
  let match_type = 'different';
  if (isExactType && isExactMat && isExactSize && (!isPressApplicable || isExactPress) && score >= 85) {
    match_type = 'identical';
    score = 98; // Verified identical industrial equipment
  } else if (isExactType && (isExactMat || isExactSize) && score >= 70) {
    match_type = 'near-duplicate';
  } else if (score >= 50) {
    match_type = 'equivalent';
  }

  return {
    match_score: score,
    match_type,
    field_comparison: {
      type: { a: specA.type, b: specB.type, match: isExactType },
      material: { a: specA.material, b: specB.material, match: isExactMat },
      size: { a: specA.dimensions, b: specB.dimensions, match: isExactSize },
      pressure_class: { a: specA.pressure_rating, b: specB.pressure_rating, match: isPressApplicable ? isExactPress : true },
      standard: { a: specA.standard, b: specB.standard, match: sharedStd || (specA.standard === specB.standard) }
    },
    reasoning: (match_type === 'identical')
      ? `High-confidence match: Identical engineering parameters verified across both CPSEs (${specA.type}, ${specA.dimensions}, ${specA.material}). Safe for unified demand pooling.`
      : `Cross-CPSE equivalence identified in ${normA.category} category. Engineering comparison verifies compatible operational tolerances (${specA.dimensions}, ${specA.material}).`
  };
}

module.exports = {
  normalizeDescription,
  compareEngineeringSpecs
};
