const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
const mongoose = require('mongoose');
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

async function syncAndMatchDb(uri) {
  console.log(`\n================================================================`);
  console.log(`Processing database: ${uri.includes('cluster0') ? 'MongoDB Atlas (Cloud Production)' : uri}...`);
  await mongoose.connect(uri);
  console.log('Connected successfully!');

  // Normalize all materials currently in DB
  const materials = await Material.find({});
  console.log(`Total materials found: ${materials.length}`);
  
  for (const m of materials) {
    const norm = normalizeDescription(m.description, m.category);
    m.category = norm.category;
    m.specifications = norm.specifications;
    await m.save();
  }
  console.log('All material specifications refreshed with universal NLP normalizer.');

  // Execute full cross-CPSE matching
  console.log('Executing runMatching()...');
  const count = await runMatching();
  console.log(`runMatching() returned: ${count} matches updated/generated.`);

  // Print summary by CPSE pair and match type
  const allMatches = await Match.find({}).populate('material_a').populate('material_b');
  console.log(`Total matches in DB: ${allMatches.length}`);

  const identical = allMatches.filter(m => m.match_type === 'identical');
  const nearDup = allMatches.filter(m => m.match_type === 'near-duplicate');
  const equiv = allMatches.filter(m => m.match_type === 'equivalent');

  console.log(`\nSummary Statistics:`);
  console.log(`- 🎯 Identical (98%): ${identical.length} pairs`);
  console.log(`- 🔍 Near-Duplicate: ${nearDup.length} pairs`);
  console.log(`- ⚖️ Equivalent: ${equiv.length} pairs`);

  const pairsBreakdown = {};
  allMatches.forEach(m => {
    const c1 = m.material_a?.cpse_name || 'A';
    const c2 = m.material_b?.cpse_name || 'B';
    const key = [c1, c2].sort().join(' <-> ');
    pairsBreakdown[key] = (pairsBreakdown[key] || 0) + 1;
  });
  console.log(`\nBreakdown by CPSE Pair:`, pairsBreakdown);

  console.log(`\nSample Identical Matches (first 10):`);
  identical.slice(0, 10).forEach((m, idx) => {
    console.log(`[${idx+1}] [${m.match_score}%] ${m.material_a?.cpse_name}:${m.material_a?.original_code} <-> ${m.material_b?.cpse_name}:${m.material_b?.original_code}`);
    console.log(`    A: ${m.material_a?.description}`);
    console.log(`    B: ${m.material_b?.description}`);
    console.log(`    Size: ${m.field_comparison?.size?.a} vs ${m.field_comparison?.size?.b} | Mat: ${m.field_comparison?.material?.a}`);
  });

  await mongoose.disconnect();
}

async function run() {
  for (const uri of uris) {
    try {
      await syncAndMatchDb(uri);
    } catch (e) {
      console.error('Error on', uri, ':', e.message);
    }
  }
}

run();
