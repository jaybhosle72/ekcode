const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const Material = require('../models/Material');
const AuditLog = require('../models/AuditLog');
const { classifyMaterial } = require('../services/geminiService');
const { checkQuality } = require('../services/dataQuality');
const { runMatching } = require('../services/matchingService');

const os = require('os');

const upload = multer({ dest: os.tmpdir() });

function getVal(row, ...keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
    const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
    if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') return row[found];
  }
  return '';
}

async function processRows(rows, cpse_name) {
  const materials = [];
  for (const row of rows) {
    const code = String(getVal(row, 'code', 'material_code', 'item_code', 'Material Code', 'Item Code', 'Code')).trim();
    const description = String(getVal(row, 'description', 'material_description', 'item_description', 'Description', 'Material Description')).trim();
    if (!code || !description) continue;

    let category = String(getVal(row, 'category', 'Category', 'cat')).trim() || 'General';
    let specs = {};
    try {
      const aiData = await classifyMaterial(description);
      category = aiData.category || category;
      specs = aiData.specifications || {};
    } catch (e) {
      console.warn('AI Classification fallback for row:', e.message);
    }

    const unit = String(getVal(row, 'unit', 'uom', 'unit_of_measure', 'Unit', 'UOM', 'Unit of Measure')).trim() || 'Nos';
    const price = Number(getVal(row, 'price', 'unit_price', 'rate', 'Price', 'Rate', 'Unit Price')) || 0;
    const quantity = Number(getVal(row, 'quantity', 'annual_quantity', 'qty', 'Quantity', 'Annual Quantity')) || 0;

    materials.push(new Material({
      cpse_name,
      original_code: code,
      description,
      category,
      specifications: specs,
      unit_of_measure: unit,
      unit_price: price,
      annual_quantity: quantity
    }));
  }

  if (materials.length === 0) {
    throw new Error('No valid material rows found in file. Please ensure columns include Code and Description.');
  }

  const savedMaterials = await Material.insertMany(materials);
  
  // Data quality checks
  const qualityIssues = checkQuality(savedMaterials);
  for (const issue of qualityIssues) {
    await Material.findByIdAndUpdate(issue.id, { data_quality_flags: issue.flags });
  }

  await AuditLog.create({
    action: 'upload',
    entity_type: 'material',
    details: `Uploaded ${savedMaterials.length} materials for ${cpse_name}`,
  });

  // Trigger background cross-CPSE matching
  runMatching().then(cnt => console.log(`Post-upload matching generated ${cnt} matches.`)).catch(err => console.error(err));

  return {
    uploaded: savedMaterials.length,
    qualityFlags: qualityIssues
  };
}

router.post('/', upload.single('file'), async (req, res) => {
  const cpse_name = req.body.cpse_name || req.body.cpseName;
  if (!cpse_name) return res.status(400).json({ error: 'cpse_name is required' });
  if (!req.file) return res.status(400).json({ error: 'file is required' });

  const originalName = (req.file.originalname || '').toLowerCase();
  const filePath = req.file.path;

  try {
    if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      // Excel parsing
      const workbook = XLSX.readFile(filePath);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);
      const result = await processRows(rows, cpse_name);
      return res.json({ success: true, ...result });
    } else {
      // CSV parsing
      const rows = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', data => rows.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
      const result = await processRows(rows, cpse_name);
      return res.json({ success: true, ...result });
    }
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: err.message || 'Error processing file' });
  } finally {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
});

module.exports = router;
