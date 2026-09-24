const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'demo_datasets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const ongcData = [
  { 'Material Code': 'ONGC-FAS-001', 'Material Description': 'Hex Bolt M10x50 SS304 Gr8.8', 'Category': 'Fasteners', 'Unit of Measure': 'Nos', 'Unit Price': 45, 'Annual Quantity': 1000 },
  { 'Material Code': 'ONGC-VAL-002', 'Material Description': 'Gate Valve 2 inch CS 150# Flanged', 'Category': 'Valves', 'Unit of Measure': 'Nos', 'Unit Price': 12000, 'Annual Quantity': 50 },
  { 'Material Code': 'ONGC-PIP-003', 'Material Description': 'Seamless Pipe 4" Sch 40 CS ASTM A106 Gr B', 'Category': 'Pipes', 'Unit of Measure': 'Meters', 'Unit Price': 1500, 'Annual Quantity': 200 },
  { 'Material Code': 'ONGC-VAL-004', 'Material Description': 'Ball Valve 1" SS316 Threaded', 'Category': 'Valves', 'Unit of Measure': 'Nos', 'Unit Price': 3500, 'Annual Quantity': 100 },
  { 'Material Code': 'ONGC-FIT-005', 'Material Description': '90 Deg Elbow 2" Sch 80 CS', 'Category': 'Fittings', 'Unit of Measure': 'Nos', 'Unit Price': 800, 'Annual Quantity': 150 },
  { 'Material Code': 'ONGC-FIT-006', 'Material Description': 'Weld Neck Flange 3" 300# RF SS304', 'Category': 'Fittings', 'Unit of Measure': 'Nos', 'Unit Price': 2500, 'Annual Quantity': 80 },
  { 'Material Code': 'ONGC-INS-007', 'Material Description': 'Pressure Gauge 0-10 bar 100mm dial', 'Category': 'Instruments', 'Unit of Measure': 'Nos', 'Unit Price': 1800, 'Annual Quantity': 200 },
  { 'Material Code': 'ONGC-SAF-008', 'Material Description': 'Safety Helmet HDPE Yellow color', 'Category': 'Safety', 'Unit of Measure': 'Nos', 'Unit Price': 250, 'Annual Quantity': 500 },
  { 'Material Code': 'ONGC-CHM-009', 'Material Description': 'Turbine Oil ISO VG 46 210L Drum', 'Category': 'Chemicals', 'Unit of Measure': 'Drums', 'Unit Price': 28000, 'Annual Quantity': 30 },
  { 'Material Code': 'ONGC-ELE-010', 'Material Description': 'Power Cable 4C x 16 sq mm XLPE Armoured', 'Category': 'Electrical', 'Unit of Measure': 'Meters', 'Unit Price': 450, 'Annual Quantity': 1500 },
  { 'Material Code': 'ONGC-FAS-011', 'Material Description': 'Stud Bolt M16x120 B7 with 2 Nuts 2H', 'Category': 'Fasteners', 'Unit of Measure': 'Sets', 'Unit Price': 120, 'Annual Quantity': 800 },
  { 'Material Code': 'ONGC-VAL-012', 'Material Description': 'Check Valve 3" 150# CS Swing Type', 'Category': 'Valves', 'Unit of Measure': 'Nos', 'Unit Price': 8500, 'Annual Quantity': 40 },
  { 'Material Code': 'ONGC-FAS-013', 'Material Description': 'Plain Washer M10 SS304', 'Category': 'Fasteners', 'Unit of Measure': 'Nos', 'Unit Price': 5, 'Annual Quantity': 5000 },
  { 'Material Code': 'ONGC-PIP-014', 'Material Description': 'ERW Pipe 6" Sch 40 CS', 'Category': 'Pipes', 'Unit of Measure': 'Meters', 'Unit Price': 2200, 'Annual Quantity': 300 },
  { 'Material Code': 'ONGC-ELE-028', 'Material Description': 'MCB 10A 2 Pole 10kA', 'Category': 'Electrical', 'Unit of Measure': 'Nos', 'Unit Price': 350, 'Annual Quantity': 200 },
  { 'Material Code': 'ONGC-FAS-030', 'Material Description': 'Hex Bolt M12x60 CS Gr8.8', 'Category': 'Fasteners', 'Unit of Measure': 'Nos', 'Unit Price': 25, 'Annual Quantity': 1000 }
];

const bpclData = [
  { 'Material Code': 'BP-VLV-101', 'Material Description': '2" Gate Valve Carbon Steel Class 150 Flange End', 'Category': 'Valves', 'Unit of Measure': 'Numbers', 'Unit Price': 12500, 'Annual Quantity': 45 },
  { 'Material Code': 'BP-FIT-201', 'Material Description': 'Elbow 90 Degree 2 inch Schedule 80 Carbon Steel', 'Category': 'Fittings', 'Unit of Measure': 'Numbers', 'Unit Price': 850, 'Annual Quantity': 120 },
  { 'Material Code': 'BP-INS-301', 'Material Description': 'Gauge Pressure 0 to 10 bar 100mm Dial Size', 'Category': 'Instruments', 'Unit of Measure': 'Numbers', 'Unit Price': 1850, 'Annual Quantity': 150 },
  { 'Material Code': 'BP-SAF-401', 'Material Description': 'Yellow Industrial Safety Helmet HDPE Material', 'Category': 'Safety', 'Unit of Measure': 'Numbers', 'Unit Price': 260, 'Annual Quantity': 400 },
  { 'Material Code': 'BP-PIP-550', 'Material Description': 'CS Seamless Pipe 4 inch Sched 40 A106 Gr.B', 'Category': 'Pipes', 'Unit of Measure': 'Mtrs', 'Unit Price': 1550, 'Annual Quantity': 180 },
  { 'Material Code': 'BP-PIP-551', 'Material Description': 'CS ERW Pipe 6 inch Sched 40', 'Category': 'Pipes', 'Unit of Measure': 'Mtrs', 'Unit Price': 2250, 'Annual Quantity': 250 },
  { 'Material Code': 'BP-ELE-601', 'Material Description': 'Cable 3Cx2.5Sqmm Copper Armored', 'Category': 'Electrical', 'Unit of Measure': 'Mtrs', 'Unit Price': 260, 'Annual Quantity': 2500 },
  { 'Material Code': 'BP-ELE-603', 'Material Description': 'MCB 10A Double Pole 10kA C-Curve', 'Category': 'Electrical', 'Unit of Measure': 'Numbers', 'Unit Price': 360, 'Annual Quantity': 150 },
  { 'Material Code': 'BP-BLT-234', 'Material Description': 'M10 Stainless Steel Hexagonal Bolt 50mm Grade 8.8', 'Category': 'Fasteners', 'Unit of Measure': 'Numbers', 'Unit Price': 52, 'Annual Quantity': 3500 },
  { 'Material Code': 'BP-BLT-236', 'Material Description': 'Washer Plain M10 Stainless Steel 304', 'Category': 'Fasteners', 'Unit of Measure': 'Numbers', 'Unit Price': 6, 'Annual Quantity': 3500 },
  { 'Material Code': 'BP-SAF-403', 'Material Description': 'Cotton Hand Gloves Heavy Duty Industrial', 'Category': 'Safety', 'Unit of Measure': 'Pairs', 'Unit Price': 48, 'Annual Quantity': 1500 },
  { 'Material Code': 'BP-CHM-701', 'Material Description': 'Lube Oil ISO VG 46 210L Barrel', 'Category': 'Chemicals', 'Unit of Measure': 'Barrels', 'Unit Price': 28500, 'Annual Quantity': 25 }
];

const iocData = [
  { 'Material Code': 'IOC-MT-0089', 'Material Description': 'SS 304 Hex Head Bolt 10mm x 50mm Gr. 8.8', 'Category': 'Fasteners', 'Unit of Measure': 'Nos', 'Unit Price': 48, 'Annual Quantity': 4200 },
  { 'Material Code': 'IOC-MT-0091', 'Material Description': 'Flat Washer 10mm SS 304', 'Category': 'Fasteners', 'Unit of Measure': 'Nos', 'Unit Price': 5.5, 'Annual Quantity': 4200 },
  { 'Material Code': 'IOC-MT-0093', 'Material Description': 'Hex Bolt M12x60 CS 8.8', 'Category': 'Fasteners', 'Unit of Measure': 'Nos', 'Unit Price': 25.5, 'Annual Quantity': 900 },
  { 'Material Code': 'IOC-VL-1122', 'Material Description': 'Gate Valve CS 2 inch Class 150 RF', 'Category': 'Valves', 'Unit of Measure': 'Nos', 'Unit Price': 12200, 'Annual Quantity': 60 },
  { 'Material Code': 'IOC-VL-1123', 'Material Description': 'Valve Ball 1" SS316 Screwed', 'Category': 'Valves', 'Unit of Measure': 'Nos', 'Unit Price': 3550, 'Annual Quantity': 90 },
  { 'Material Code': 'IOC-PP-3344', 'Material Description': 'Pipe Seamless CS 4" Schedule 40 ASTM A106B', 'Category': 'Pipes', 'Unit of Measure': 'Meters', 'Unit Price': 1520, 'Annual Quantity': 180 },
  { 'Material Code': 'IOC-PP-3345', 'Material Description': 'Pipe CS ERW 6" Sch 40', 'Category': 'Pipes', 'Unit of Measure': 'Meters', 'Unit Price': 2220, 'Annual Quantity': 280 },
  { 'Material Code': 'IOC-FT-5567', 'Material Description': 'Flange WNRF 3" 300LB SS304', 'Category': 'Fittings', 'Unit of Measure': 'Nos', 'Unit Price': 2550, 'Annual Quantity': 70 },
  { 'Material Code': 'IOC-IN-7788', 'Material Description': 'Gauge Pr 0-10 bar 100mm Dial', 'Category': 'Instruments', 'Unit of Measure': 'Nos', 'Unit Price': 1820, 'Annual Quantity': 160 },
  { 'Material Code': 'IOC-SF-9900', 'Material Description': 'Helmet Safety HDPE Yellow', 'Category': 'Safety', 'Unit of Measure': 'Nos', 'Unit Price': 245, 'Annual Quantity': 450 },
  { 'Material Code': 'IOC-SF-9902', 'Material Description': 'Gloves Cotton Heavy Duty', 'Category': 'Safety', 'Unit of Measure': 'Pairs', 'Unit Price': 46, 'Annual Quantity': 1800 }
];

function saveExcelAndCsv(data, filenamePrefix) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Materials');
  
  const xlsxPath = path.join(dir, filenamePrefix + '.xlsx');
  XLSX.writeFile(wb, xlsxPath);
  
  const csvPath = path.join(dir, filenamePrefix + '.csv');
  const csvContent = XLSX.utils.sheet_to_csv(ws);
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  
  console.log('Generated:', filenamePrefix + '.xlsx', 'and', filenamePrefix + '.csv');
}

saveExcelAndCsv(ongcData, 'ONGC_Materials_Catalog');
saveExcelAndCsv(bpclData, 'BPCL_Materials_Catalog');
saveExcelAndCsv(iocData, 'IOC_Materials_Catalog');
console.log('SUCCESS: All files saved to:', dir);
