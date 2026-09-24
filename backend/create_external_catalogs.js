const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const outputDir = path.join(__dirname, '..', 'external_catalogs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. ONGC Materials (Oil & Gas Exploration & Drilling CPSE)
const ongcData = [
  {
    "Material Code": "ONGC-PIP-CS-1001",
    "Material Description": "Pipe Seamless Carbon Steel ASTM A106 Gr B 6\" Sch 40 Beveled End",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 4850,
    "Annual Quantity": 12000
  },
  {
    "Material Code": "ONGC-PIP-CS-1002",
    "Material Description": "Pipe Seamless Carbon Steel ASTM A106 Gr B 4\" Sch 40 Beveled End",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 3200,
    "Annual Quantity": 8500
  },
  {
    "Material Code": "ONGC-PIP-SS-2001",
    "Material Description": "Pipe Stainless Steel Seamless ASTM A312 TP316L 2\" Sch 40S",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 8900,
    "Annual Quantity": 4500
  },
  {
    "Material Code": "ONGC-PIP-API-3001",
    "Material Description": "Line Pipe Seamless API 5L Gr X52 PSL2 8\" Sch 40 3LPE Coated",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 11500,
    "Annual Quantity": 15000
  },
  {
    "Material Code": "ONGC-VLV-BL-3004",
    "Material Description": "Ball Valve 4\" Class 300 Flanged Full Bore ASTM A216 WCB Lever Operated API 6D",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 24500,
    "Annual Quantity": 450
  },
  {
    "Material Code": "ONGC-VLV-GT-1506",
    "Material Description": "Gate Valve 6\" Class 150 Flanged Bolted Bonnet ASTM A216 WCB Trim 8 API 600",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 38000,
    "Annual Quantity": 320
  },
  {
    "Material Code": "ONGC-VLV-CK-3003",
    "Material Description": "Swing Check Valve 3\" Class 300 Flanged ASTM A216 WCB API 6D Trim 5",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 16500,
    "Annual Quantity": 280
  },
  {
    "Material Code": "ONGC-VLV-GL-3002",
    "Material Description": "Globe Valve 2\" Class 300 Flanged OS&Y Rising Stem ASTM A216 WCB BS 1873",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 14200,
    "Annual Quantity": 350
  },
  {
    "Material Code": "ONGC-FAS-ST-B712",
    "Material Description": "Stud Bolt M20 x 120mm ASTM A193 Gr B7 with 2 Heavy Hex Nuts ASTM A194 Gr 2H",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 340,
    "Annual Quantity": 25000
  },
  {
    "Material Code": "ONGC-FAS-ST-B716",
    "Material Description": "Stud Bolt M24 x 160mm ASTM A193 Gr B7 with 2 Heavy Hex Nuts ASTM A194 Gr 2H",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 520,
    "Annual Quantity": 18000
  },
  {
    "Material Code": "ONGC-FAS-ST-B8M",
    "Material Description": "Stud Bolt M16 x 90mm Stainless Steel ASTM A193 Gr B8M with 2 Nuts A194 Gr 8M",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 780,
    "Annual Quantity": 9500
  },
  {
    "Material Code": "ONGC-FLG-WN-3006",
    "Material Description": "Weld Neck Flange 6\" Class 300 Raised Face ASME B16.5 ASTM A105 Sch 40 Bore",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 6200,
    "Annual Quantity": 1200
  },
  {
    "Material Code": "ONGC-FLG-WN-1504",
    "Material Description": "Weld Neck Flange 4\" Class 150 Raised Face ASME B16.5 ASTM A105 Sch 40 Bore",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 3400,
    "Annual Quantity": 1600
  },
  {
    "Material Code": "ONGC-FIT-ELB-906",
    "Material Description": "90 Deg Long Radius Elbow 6\" Sch 40 Carbon Steel ASTM A234 Gr WPB ASME B16.9",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 2800,
    "Annual Quantity": 2200
  },
  {
    "Material Code": "ONGC-GSK-SW-3006",
    "Material Description": "Spiral Wound Gasket 6\" Class 300 SS316 with Flexible Graphite Filler ASME B16.20",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 450,
    "Annual Quantity": 14000
  },
  {
    "Material Code": "ONGC-MECH-SEAL-01",
    "Material Description": "Cartridge Mechanical Seal 50mm Shaft Single Spring for Crude Oil Service API 682",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 42000,
    "Annual Quantity": 110
  },
  {
    "Material Code": "ONGC-ELEC-LED-60W",
    "Material Description": "Flameproof Wellhead LED Well Light 60W Ex d IIC T6 IP66 230V AC",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 18500,
    "Annual Quantity": 850
  },
  {
    "Material Code": "ONGC-SAF-HLM-WHT",
    "Material Description": "Safety Helmet Industrial Grade HDPE Ratchet Type White Colour IS 2925",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 480,
    "Annual Quantity": 6000
  },
  {
    "Material Code": "ONGC-SAF-GLV-NIT",
    "Material Description": "Heavy Duty Nitrile Chemical Resistant Gloves 13 Inch Gauntlet EN 388",
    "Category": "Safety",
    "Unit of Measure": "Pair",
    "Unit Price (INR)": 320,
    "Annual Quantity": 12000
  },
  {
    "Material Code": "ONGC-DRL-BIT-850",
    "Material Description": "PDC Drilling Bit 8-1/2 Inch 5-Blade Matrix Body 16mm Cutters API Spec 7-1",
    "Category": "Drilling",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 385000,
    "Annual Quantity": 45
  }
];

// 2. BPCL Materials (Petroleum Refining & Marketing CPSE)
const bpclData = [
  {
    "Material Code": "BPCL-MAT-PIPE-640",
    "Material Description": "Seamless CS Pipe 6 inch NB Schedule 40 ASTM A106 Grade B Beveled",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 4920,
    "Annual Quantity": 10500
  },
  {
    "Material Code": "BPCL-MAT-PIPE-440",
    "Material Description": "Carbon Steel Seamless Pipe 4\" NB Sch 40 to ASTM A106 Gr B",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 3250,
    "Annual Quantity": 7200
  },
  {
    "Material Code": "BPCL-PIP-SS316-02",
    "Material Description": "Stainless Steel Pipe 2\" NB Seamless Sch 40S ASTM A312 Grade TP316L",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 8950,
    "Annual Quantity": 3800
  },
  {
    "Material Code": "BPCL-VAL-BALL-304",
    "Material Description": "Valve Ball Flanged 4 inch 300# Full Port CS A216 WCB RF Lever Operated",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 24900,
    "Annual Quantity": 390
  },
  {
    "Material Code": "BPCL-VAL-GATE-156",
    "Material Description": "Gate Valve 6\" 150# Flanged WCB Body Bolted Bonnet Trim 8 to API 600",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 38500,
    "Annual Quantity": 290
  },
  {
    "Material Code": "BPCL-VAL-CHCK-303",
    "Material Description": "Check Valve Swing Type 3 inch Class 300 RF Flanged WCB API 6D",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 16800,
    "Annual Quantity": 240
  },
  {
    "Material Code": "BPCL-VAL-GLOB-302",
    "Material Description": "Globe Valve 2 inch Class 300 Flanged WCB Body OS&Y Stem to BS 1873",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 14400,
    "Annual Quantity": 310
  },
  {
    "Material Code": "BPCL-BLT-ST-2012",
    "Material Description": "Stud Bolt 20mm Dia x 120mm Long Alloy Steel A193-B7 with 2H Hex Nuts",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 350,
    "Annual Quantity": 22000
  },
  {
    "Material Code": "BPCL-BLT-ST-2416",
    "Material Description": "Stud Bolt M24 x 160mm Long ASTM A193 Grade B7 with 2 Heavy Hex Nuts 2H",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 530,
    "Annual Quantity": 16000
  },
  {
    "Material Code": "BPCL-BLT-SS-1690",
    "Material Description": "Stainless Steel Stud Bolt M16 x 90mm Long ASTM A193 B8M with 2 Nuts 8M",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 790,
    "Annual Quantity": 8200
  },
  {
    "Material Code": "BPCL-FLG-WN-306",
    "Material Description": "Flange WNRF 6 inch 300# Sch 40 Bore CS ASTM A105 ASME B16.5",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 6250,
    "Annual Quantity": 1100
  },
  {
    "Material Code": "BPCL-FLG-WN-154",
    "Material Description": "Flange Weld Neck 4 inch Class 150 Raised Face ASTM A105 ASME B16.5",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 3450,
    "Annual Quantity": 1450
  },
  {
    "Material Code": "BPCL-FIT-ELB-906",
    "Material Description": "Elbow 90 Deg LR 6 inch NB Sch 40 Seamless WPB to ASTM A234 ASME B16.9",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 2850,
    "Annual Quantity": 1950
  },
  {
    "Material Code": "BPCL-GSK-SW-306",
    "Material Description": "Gasket Spiral Wound 6 inch 300# SS316/Graphite with Inner/Outer Ring B16.20",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 460,
    "Annual Quantity": 12500
  },
  {
    "Material Code": "BPCL-PMP-SEAL-50",
    "Material Description": "Cartridge Mechanical Seal 50mm for Centrifugal Process Pump API 682",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 43500,
    "Annual Quantity": 95
  },
  {
    "Material Code": "BPCL-LTG-FL-60W",
    "Material Description": "Flameproof Explosion Proof LED Luminaire 60W Zone 1 Gas Group IIA/IIB/IIC",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 18800,
    "Annual Quantity": 750
  },
  {
    "Material Code": "BPCL-PPE-HLM-01",
    "Material Description": "Industrial Safety Helmet White Colour with 4-Point Suspension IS:2925",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 490,
    "Annual Quantity": 5500
  },
  {
    "Material Code": "BPCL-PPE-GLV-NIT",
    "Material Description": "Nitrile Chemical Gloves Heavy Duty Gauntlet Cuff 13\" Green EN388",
    "Category": "Safety",
    "Unit of Measure": "Pair",
    "Unit Price (INR)": 330,
    "Annual Quantity": 11000
  },
  {
    "Material Code": "BPCL-REF-STM-TRP",
    "Material Description": "Thermodynamic Steam Trap 1/2\" NPT Class 600 Forged Carbon Steel Body",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 5400,
    "Annual Quantity": 650
  },
  {
    "Material Code": "BPCL-LPG-LOAD-ARM",
    "Material Description": "LPG Bottom Loading Coupler 4\" API RP 1004 Cam-and-Groove with Viton Seals",
    "Category": "Refinery",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 88000,
    "Annual Quantity": 35
  }
];

// 3. IOCL Materials (Refining, Pipeline & Marketing CPSE)
const ioclData = [
  {
    "Material Code": "IOCL-P-106B-06",
    "Material Description": "Pipe Carbon Steel Seamless 6in Sch 40 to ASTM A106 Gr.B Beveled Ends",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 4880,
    "Annual Quantity": 14000
  },
  {
    "Material Code": "IOCL-P-106B-04",
    "Material Description": "CS Seamless Pipe 4 Inch NB Schedule 40 Grade B ASTM A106",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 3220,
    "Annual Quantity": 9000
  },
  {
    "Material Code": "IOCL-P-SS316-02",
    "Material Description": "Seamless Pipe SS316L 2 Inch Sch 40S ASTM A312 TP316L",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 8920,
    "Annual Quantity": 5100
  },
  {
    "Material Code": "IOCL-V-300-FB04",
    "Material Description": "Ball Valve 4in 300 LB WCB Body CS Flanged Trim SS316 Fire Safe API 6D",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 24700,
    "Annual Quantity": 520
  },
  {
    "Material Code": "IOCL-V-150-GT06",
    "Material Description": "Gate Valve 6in 150 LB Flanged WCB Carbon Steel Trim 8 Handwheel Operated API 600",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 38200,
    "Annual Quantity": 410
  },
  {
    "Material Code": "IOCL-V-300-CK03",
    "Material Description": "Check Valve 3in Class 300 Swing Type Flanged WCB Carbon Steel API 6D",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 16600,
    "Annual Quantity": 310
  },
  {
    "Material Code": "IOCL-F-B7-20X12",
    "Material Description": "Stud Bolt with 2 Heavy Hex Nuts M20x120 Alloy Steel ASTM A193 B7 / A194 2H",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 345,
    "Annual Quantity": 28000
  },
  {
    "Material Code": "IOCL-F-B7-24X16",
    "Material Description": "Stud Bolt with 2 Nuts M24x160mm Long ASTM A193 B7 / A194 2H Black Finish",
    "Category": "Fasteners",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 525,
    "Annual Quantity": 21000
  },
  {
    "Material Code": "IOCL-FL-WN-300-6",
    "Material Description": "Flange Weld Neck 6in 300 LB RF CS A105 ASME B16.5 Sch 40 Bore",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 6220,
    "Annual Quantity": 1350
  },
  {
    "Material Code": "IOCL-GK-SP-300-6",
    "Material Description": "Metallic Gasket Spiral Wound 6in 300 LB SS316 Graphite Filler ASME B16.20",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 455,
    "Annual Quantity": 16000
  },
  {
    "Material Code": "IOCL-S-HLM-WHT",
    "Material Description": "Industrial Safety Helmet White HDPE Shell Ratchet Suspension IS 2925",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 485,
    "Annual Quantity": 7500
  },
  {
    "Material Code": "IOCL-E-FL-60W",
    "Material Description": "Flameproof LED Fitting 60 Watt 240V AC Ex d IIC T6 IP66 Wellhead / Refinery",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 18600,
    "Annual Quantity": 920
  }
];

function exportDataset(data, baseName) {
  // 1. Export Excel (.xlsx)
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Material Catalog");
  const xlsxPath = path.join(outputDir, `${baseName}.xlsx`);
  XLSX.writeFile(wb, xlsxPath);
  console.log(`✔ Created Excel Catalog: ${xlsxPath}`);

  // 2. Export CSV (.csv)
  const csvContent = XLSX.utils.sheet_to_csv(ws);
  const csvPath = path.join(outputDir, `${baseName}.csv`);
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`✔ Created CSV Catalog:   ${csvPath}`);
}

console.log(`\n========================================`);
console.log(`📁 Generating External CPSE Material Catalogs`);
console.log(`========================================`);

exportDataset(ongcData, 'ONGC_Material_Catalog_2026');
exportDataset(bpclData, 'BPCL_Procurement_Master_2026');
exportDataset(ioclData, 'IOCL_Refinery_Inventory_2026');

console.log(`\n🎉 All 6 external catalog files generated in:`);
console.log(`   ${outputDir}\n`);
