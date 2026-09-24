const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Material = require('./models/Material');
const Match = require('./models/Match');
const UnifiedMaterial = require('./models/UnifiedMaterial');
const AuditLog = require('./models/AuditLog');
const { classifyMaterial } = require('./services/geminiService');
const { runMatching } = require('./services/matchingService');
const { generateCode } = require('./services/codeGenerator');
const { checkQuality } = require('./services/dataQuality');
const { calculateSavings } = require('./services/savingsCalculator');

dotenv.config();

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split(/\r?\n/);
  const results = [];
  const headers = lines[0].split(',').map(h => h.trim());
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = lines[i].split(',');
    const obj = {};
    headers.forEach((h, dx) => {
      obj[h] = row[dx] ? row[dx].trim() : '';
    });
    results.push(obj);
  }
  return results;
}

async function seedDB() {
  try {
    console.log('Connecting to MongoDB\n');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ekcode');
    console.log('MongoDB Connected Successfully');

    // Clear existing data
    await Material.deleteMany({});
    await Match.deleteMany({});
    await UnifiedMaterial.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared old records from database.');

    const cpseFiles = [
      { name: 'ONGC', file: 'sample_ongc.csv' },
      { name: 'BPCL', file: 'sample_bpcl.csv' },
      { name: 'IOC', file: 'sample_ioc.csv' }
    ];

    let totalInserted = 0;
    for (const cpse of cpseFiles) {
      const filePath = path.join(__dirname, 'data', cpse.file);
      if (!fs.existsSync(filePath)) continue;

      const rawItems = parseCSV(filePath);
      const docs = [];

      for (const row of rawItems) {
        const aiTech = await classifyMaterial(row.description);
        docs.push({
          cpse_name: cpse.name,
          original_code: row.code,
          description: row.description,
          category: aiTech.category || 'General',
          specifications: aiTech.specifications || {},
          unit_of_measure: row.unit || 'Nos',
          unit_price: Number(row.price) || 100,
          annual_quantity: Number(row.quantity) || 50
        });
      }

      const saved = await Material.insertMany(docs);
      totalInserted += saved.length;
      console.log(`Inserted ${saved.length} materials for ${cpse.name}`);
    }

    console.log(`\nRunning AK Matching Process across ${totalInserted} materials...`);
    const matchCount = await runMatching();
    console.log(`Generated ${matchCount} duplicate/equivalent matches.`);

    // Approve top 5 highest scoring matches automatically for demo
    const topMatches = await Match.find({ match_score: { $gte: 80} }).limit(5);
    for (const m of topMatches) {
      m.status = 'approved';
      m.reviewed_by = 'Admin';
      m.reviewed_at = new Date();
      await m.save();
      await generateCode(m._id);
    }

    await calculateSavings();

    await AuditLog.create({
      action: 'seed_init',
      details: `Initialized E{Code with ${totalInserted} materials, ${matchCount} matches.`
    });

    console.log('\n=======================================');
    console.log('  SYSTEM SEEDED SUCCESSFULLY ');
    console.log('======================================');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedDB();
