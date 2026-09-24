const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { normalizeDescription } = require('./services/nlpNormalizer');
const { runMatching } = require('./services/matchingService');
const Material = require('./models/Material');
const Match = require('./models/Match');

const uris = [];
if (process.env.MONGODB_URI) uris.push(process.env.MONGODB_URI);
const atlasUri = 'mongodb+srv://jaybhosler_db_user:kD6kzUtahjxtKimI@cluster0.ig2xuwl.mongodb.net/ekcode?retryWrites=true&w=majority&appName=Cluster0';
if (!uris.includes(atlasUri)) uris.push(atlasUri);

async function syncDb(uri) {
  console.log(`\n======================================================`);
  console.log(`Connecting to: ${uri.includes('cluster0') ? 'MongoDB Atlas' : uri}...`);
  await mongoose.connect(uri);
  console.log('Connected!');

  // 1. Update/Clean IOCL items
  const ioclItems = await Material.find({
    $or: [{ cpse_name: 'IOCL' }, { cpse_name: 'IOC' }]
  });
  console.log(`Found ${ioclItems.length} IOCL items.`);
  for (const item of ioclItems) {
    const norm = normalizeDescription(item.description, item.category);
    item.category = norm.category;
    item.specifications = norm.specifications;
    item.cpse_name = 'IOCL';
    await item.save();
  }

  // If no IOCL items existed, load from external catalog
  if (ioclItems.length === 0) {
    const ioclFile = path.join(__dirname, '..', 'external_catalogs', 'IOCL_Refinery_Inventory_2026.xlsx');
    const ioclRows = XLSX.utils.sheet_to_json(XLSX.readFile(ioclFile).Sheets['Material Catalog']);
    console.log(`Ingesting ${ioclRows.length} IOCL items from external catalog...`);
    for (const row of ioclRows) {
      const code = row['Material Code'];
      const desc = row['Material Description'];
      const norm = normalizeDescription(desc, row['Category']);
      await Material.create({
        cpse_name: 'IOCL',
        original_code: code,
        description: desc,
        category: row['Category'] || norm.category,
        specifications: norm.specifications,
        unit_of_measure: row['Unit of Measure'] || 'Nos',
        unit_price: row['Unit Price (INR)'] || 0,
        annual_quantity: row['Annual Quantity'] || 0
      });
    }
  }

  // 2. Load ONGC items from ONGC_Material_Catalog_2026.xlsx
  const ongcFile = path.join(__dirname, '..', 'external_catalogs', 'ONGC_Material_Catalog_2026.xlsx');
  const ongcRows = XLSX.utils.sheet_to_json(XLSX.readFile(ongcFile).Sheets['Material Catalog']);
  
  // Clean old/legacy ONGC items
  await Material.deleteMany({ cpse_name: 'ONGC' });
  console.log(`Ingesting ${ongcRows.length} ONGC items from ONGC_Material_Catalog_2026.xlsx...`);
  for (const row of ongcRows) {
    const code = row['Material Code'];
    const desc = row['Material Description'];
    const norm = normalizeDescription(desc, row['Category']);
    await Material.create({
      cpse_name: 'ONGC',
      original_code: code,
      description: desc,
      category: row['Category'] || norm.category,
      specifications: norm.specifications,
      unit_of_measure: row['Unit of Measure'] || 'Nos',
      unit_price: row['Unit Price (INR)'] || 0,
      annual_quantity: row['Annual Quantity'] || 0
    });
  }

  // 3. Clear existing matches & re-run precision matching
  await Match.deleteMany({});
  console.log('Cleared existing matches. Executing runMatching()...');

  const generatedCount = await runMatching();
  console.log(`Generated ${generatedCount} cross-CPSE matches!`);

  // 4. Print matches
  const matches = await Match.find({})
    .populate('material_a')
    .populate('material_b')
    .sort({ match_score: -1 });

  console.log(`\nVerified Cross-CPSE Matches (${matches.length} total):`);
  let identicalCount = 0;
  matches.forEach((m, idx) => {
    if (m.match_type === 'identical') identicalCount++;
    console.log(`[${idx + 1}] [${m.match_score}% - ${m.match_type.toUpperCase()}] ${m.material_a?.original_code} (${m.material_a?.cpse_name}) <-> ${m.material_b?.original_code} (${m.material_b?.cpse_name})`);
    console.log(`    A: ${m.material_a?.description}`);
    console.log(`    B: ${m.material_b?.description}`);
    console.log(`    Size: "${m.field_comparison?.size?.a}" vs "${m.field_comparison?.size?.b}"`);
    console.log(`    Press: "${m.field_comparison?.pressure_class?.a}" vs "${m.field_comparison?.pressure_class?.b}"`);
    console.log('--------------------------------------------------');
  });

  console.log(`\nSummary: ${identicalCount} identical matches detected!`);
  await mongoose.disconnect();
}

async function runAll() {
  for (const uri of uris) {
    try {
      await syncDb(uri);
    } catch (err) {
      console.error(`Error with ${uri}:`, err.message);
    }
  }
}

runAll();
