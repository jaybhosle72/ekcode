const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config();

const Material = require('./models/Material');
const Match = require('./models/Match');
const UnifiedMaterial = require('./models/UnifiedMaterial');
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function wipeDatabase(uri, label) {
  console.log(`\n========================================`);
  console.log(`🧹 Erasing Data for: ${label}`);
  console.log(`========================================`);
  
  const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 8000 }).asPromise();
  console.log(`Connected to: ${conn.host}`);

  const MatModel = conn.model('Material', Material.schema);
  const MatchModel = conn.model('Match', Match.schema);
  const UniModel = conn.model('UnifiedMaterial', UnifiedMaterial.schema);
  const AuditModel = conn.model('AuditLog', AuditLog.schema);
  const UserModel = conn.model('User', User.schema);

  // 1. Wipe all operational collections
  const delMat = await MatModel.deleteMany({});
  const delMatch = await MatchModel.deleteMany({});
  const delUni = await UniModel.deleteMany({});
  const delAudit = await AuditModel.deleteMany({});

  console.log(`✔ Erased ${delMat.deletedCount} Materials`);
  console.log(`✔ Erased ${delMatch.deletedCount} Matches`);
  console.log(`✔ Erased ${delUni.deletedCount} Unified National Codes`);
  console.log(`✔ Erased ${delAudit.deletedCount} Audit Logs`);

  // 2. Setup standard clean test credentials (or preserve existing)
  await UserModel.deleteMany({});
  const initialUsers = [
    {
      name: 'Vikram Sharma',
      email: 'officer@ongc.in',
      password: hashPassword('officer123'),
      role: 'officer',
      cpse_organization: 'ONGC',
      designation: 'Sr. Materials & Procurement Officer',
      auth_provider: 'local',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram%20Sharma&backgroundColor=2563EB'
    },
    {
      name: 'Dr. Rajesh Verma',
      email: 'admin@mopng.gov.in',
      password: hashPassword('admin123'),
      role: 'admin',
      cpse_organization: 'MoPNG',
      designation: 'National Master Administrator',
      auth_provider: 'local',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh%20Verma&backgroundColor=D97706'
    }
  ];

  await UserModel.insertMany(initialUsers);
  console.log(`✔ Initialized 2 Genuine Portal Accounts:`);
  console.log(`   - CPSE Officer: officer@ongc.in (Password: officer123)`);
  console.log(`   - MoPNG Admin:  admin@mopng.gov.in (Password: admin123)`);

  await conn.close();
  console.log(`✅ ${label} is now clean and ready for fresh catalog ingestion!\n`);
}

async function main() {
  const localUri = 'mongodb://localhost:27017/ekcode';
  const atlasUri = 'mongodb+srv://jaybhosler_db_user:kD6kzUtahjxtKimI@cluster0.ig2xuwl.mongodb.net/ekcode?retryWrites=true&w=majority&appName=Cluster0';

  try {
    // 1. Wipe Local MongoDB
    await wipeDatabase(localUri, 'Local MongoDB (localhost:27017)');
  } catch (err) {
    console.error('Local wipe error:', err.message);
  }

  try {
    // 2. Wipe Cloud MongoDB Atlas
    await wipeDatabase(atlasUri, 'Cloud MongoDB Atlas (Cluster0)');
  } catch (err) {
    console.error('Atlas wipe error:', err.message);
  }

  console.log('🎉 Database wipe complete. All fake/demo records removed.');
  process.exit(0);
}

main();
