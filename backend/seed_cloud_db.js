/**
 * Script to clone all local materials, matches, and unified records to MongoDB Atlas
 * Usage: node seed_cloud_db.js "<YOUR_MONGODB_ATLAS_CONNECTION_STRING>"
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Material = require('./models/Material');
const Match = require('./models/Match');
const UnifiedMaterial = require('./models/UnifiedMaterial');
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

const localUri = 'mongodb://localhost:27017/ekcode';
const targetUri = process.argv[2] || process.env.MONGODB_URI;

if (!targetUri || targetUri === localUri) {
  console.error('\n❌ Please provide your target MongoDB Atlas URI as an argument:');
  console.log('   node seed_cloud_db.js "mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/ekcode?retryWrites=true&w=majority"\n');
  process.exit(1);
}

async function migrate() {
  console.log('\n--- 1. Connecting to Local Database ---');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('Connected to Local MongoDB!');

  const LocalMaterial = localConn.model('Material', Material.schema);
  const LocalMatch = localConn.model('Match', Match.schema);
  const LocalUnified = localConn.model('UnifiedMaterial', UnifiedMaterial.schema);
  const LocalAudit = localConn.model('AuditLog', AuditLog.schema);
  const LocalUser = localConn.model('User', User.schema);

  const materials = await LocalMaterial.find({}).lean();
  const matches = await LocalMatch.find({}).lean();
  const unified = await LocalUnified.find({}).lean();
  const audits = await LocalAudit.find({}).lean();
  const users = await LocalUser.find({}).lean();

  console.log(`Found:`);
  console.log(` - ${materials.length} Materials`);
  console.log(` - ${matches.length} Matches`);
  console.log(` - ${unified.length} Unified National Codes`);
  console.log(` - ${audits.length} Audit Logs`);
  console.log(` - ${users.length} Users`);

  console.log('\n--- 2. Connecting to Target Cloud Database (Atlas) ---');
  const cloudConn = await mongoose.createConnection(targetUri).asPromise();
  console.log('Connected to MongoDB Atlas successfully!');

  const CloudMaterial = cloudConn.model('Material', Material.schema);
  const CloudMatch = cloudConn.model('Match', Match.schema);
  const CloudUnified = cloudConn.model('UnifiedMaterial', UnifiedMaterial.schema);
  const CloudAudit = cloudConn.model('AuditLog', AuditLog.schema);
  const CloudUser = cloudConn.model('User', User.schema);

  console.log('\n--- 3. Uploading Data to Cloud Database ---');
  
  if (materials.length > 0) {
    await CloudMaterial.deleteMany({});
    await CloudMaterial.insertMany(materials);
    console.log(`✅ Uploaded ${materials.length} Materials to Atlas`);
  }

  if (matches.length > 0) {
    await CloudMatch.deleteMany({});
    await CloudMatch.insertMany(matches);
    console.log(`✅ Uploaded ${matches.length} Matches to Atlas`);
  }

  if (unified.length > 0) {
    await CloudUnified.deleteMany({});
    await CloudUnified.insertMany(unified);
    console.log(`✅ Uploaded ${unified.length} Unified Codes to Atlas`);
  }

  if (audits.length > 0) {
    await CloudAudit.deleteMany({});
    await CloudAudit.insertMany(audits);
    console.log(`✅ Uploaded ${audits.length} Audit Logs to Atlas`);
  }

  if (users.length > 0) {
    await CloudUser.deleteMany({});
    await CloudUser.insertMany(users);
    console.log(`✅ Uploaded ${users.length} Users to Atlas`);
  }

  console.log('\n🎉 Cloud Database Migration Complete! Your cloud database is ready for Vercel deployment.\n');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
