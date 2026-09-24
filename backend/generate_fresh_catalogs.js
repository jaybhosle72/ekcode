const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. ONGC Dataset (Offshore Exploration, Drilling & Field Maintenance) - 20 items
const ongcData = [
  {
    "Material Code": "ONGC-INST-DPT-250M",
    "Material Description": "Differential Pressure Transmitter Range 0-250 mbar Output 4-20mA HART Diaphragm Hastelloy C-276 Flanged Process Connection",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 78500,
    "Annual Quantity": 120
  },
  {
    "Material Code": "ONGC-VLV-BF-08-150",
    "Material Description": "Triple Offset Butterfly Valve 8\" Class 150 Lug Type Body ASTM A216 WCB Disc SS316 Metal Seated API 609 Gear Operated",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 64000,
    "Annual Quantity": 85
  },
  {
    "Material Code": "ONGC-INST-CMF-02-300",
    "Material Description": "Coriolis Mass Flow Meter 2\" Class 300 Flanged SS316L Flow Tube 0-50000 kg/hr with Integral Transmitter 4-20mA HART",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 320000,
    "Annual Quantity": 35
  },
  {
    "Material Code": "ONGC-PIP-LTCS-8080",
    "Material Description": "Pipe Seamless LTCS Low Temp Carbon Steel ASTM A333 Grade 6 8\" Sch 80 Beveled Ends",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 14200,
    "Annual Quantity": 6500
  },
  {
    "Material Code": "ONGC-INST-RTD-400D",
    "Material Description": "Duplex Pt100 RTD Temperature Sensor 3-Wire Class A with Flanged Thermowell 1-1/2\" 300# Insertion Length 400mm SS316",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 12500,
    "Annual Quantity": 240
  },
  {
    "Material Code": "ONGC-VLV-NDL-12-6K",
    "Material Description": "Needle Valve 1/2\" NPT Female x Female Rating 6000 PSI Stainless Steel SS316 Body & Stem PTFE Packing",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 4200,
    "Annual Quantity": 850
  },
  {
    "Material Code": "ONGC-FLG-SPB-08-300",
    "Material Description": "Spectacle Blind 8\" Class 300 Raised Face ASME B16.48 Carbon Steel ASTM A516 Gr 70 Smooth Finish",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 8400,
    "Annual Quantity": 320
  },
  {
    "Material Code": "ONGC-GSK-RTJ-R45-SI",
    "Material Description": "Metallic Ring Joint Gasket RTJ R-45 Octagonal Cross Section Soft Iron Max Hardness 90 HB ASME B16.20",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 1850,
    "Annual Quantity": 1200
  },
  {
    "Material Code": "ONGC-ELEC-FLD-200W",
    "Material Description": "Explosion Proof High Mast LED Floodlight 200W Ex d IIC T5 Gb IP66 230V AC Flameproof Cast Aluminium Alloy Body",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 34500,
    "Annual Quantity": 420
  },
  {
    "Material Code": "ONGC-SAF-GAS-4DET",
    "Material Description": "Portable Multi-Gas Detector 4-Gas (LEL, O2, H2S, CO) with Internal Sampling Pump Li-Ion Rechargeable Battery ATEX / IECEx Certified",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 56000,
    "Annual Quantity": 150
  },
  {
    "Material Code": "ONGC-SAF-SCBA-68L",
    "Material Description": "Self-Contained Breathing Apparatus SCBA 300 Bar 6.8 Litre Carbon Composite Cylinder Full Face Mask Demand Valve EN 137 Type 2",
    "Category": "Safety",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 82000,
    "Annual Quantity": 95
  },
  {
    "Material Code": "ONGC-VLV-CK-06-300D",
    "Material Description": "Dual Plate Check Valve 6\" Class 300 Wafer Type Body & Plates Duplex Stainless Steel UNS S31803 Inconel X-750 Spring API 594",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 52000,
    "Annual Quantity": 110
  },
  {
    "Material Code": "ONGC-TUB-AST-508-45",
    "Material Description": "Seamless Alloy Steel Tube ASTM A213 Grade T22 Outside Diameter 50.8mm Wall Thickness 4.5mm Cold Drawn",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 3850,
    "Annual Quantity": 4500
  },
  {
    "Material Code": "ONGC-MEC-BRG-6312",
    "Material Description": "Deep Groove Ball Bearing 6312-2Z Shielded Both Sides Bore 60mm OD 130mm Width 31mm C3 Clearance SKF / FAG",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 3100,
    "Annual Quantity": 600
  },
  {
    "Material Code": "ONGC-DRL-MUD-MTR-700",
    "Material Description": "Positive Displacement Downhole Mud Motor 7\" OD 5/6 Lobe for Directional Drilling API 7-1",
    "Category": "Drilling",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 940000,
    "Annual Quantity": 25
  },
  {
    "Material Code": "ONGC-OFF-MOOR-CHN-76",
    "Material Description": "Stud Link Anchor Mooring Chain Grade R4 76mm Dia Offshore Quality Certified",
    "Category": "Offshore",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 18200,
    "Annual Quantity": 1800
  },
  {
    "Material Code": "ONGC-SUB-XMAS-TR-10K",
    "Material Description": "Subsea Dual Bore Wellhead Tree Valve Trim 10000 PSI Inconel 718 Lined",
    "Category": "Wellhead",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 1450000,
    "Annual Quantity": 12
  },
  {
    "Material Code": "ONGC-SEP-CYC-DES-01",
    "Material Description": "Hydrocyclone Desander Liner Polyurethane 2 Inch for Offshore Produced Water",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 28500,
    "Annual Quantity": 140
  },
  {
    "Material Code": "ONGC-RIG-ELEC-VFD-1K",
    "Material Description": "Rig Drive Drilling VFD Inverter Module 690V 1200A Liquid Cooled",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 580000,
    "Annual Quantity": 18
  },
  {
    "Material Code": "ONGC-DRL-STB-1225",
    "Material Description": "Near Bit Integral Blade Drilling Stabilizer 12-1/4\" AISI 4145H Hardfaced",
    "Category": "Drilling",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 215000,
    "Annual Quantity": 40
  }
];

// 2. IOCL Dataset (Petrochemicals, Hydrocracking & Refinery Maintenance) - 20 items
const ioclData = [
  {
    "Material Code": "IOCL-TX-DP-250-HART",
    "Material Description": "Smart D/P Transmitter 0 to 250mbar 4-20 mA with HART Protocol Hastelloy C276 Wetted Parts 1/2\" NPT",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 79200,
    "Annual Quantity": 180
  },
  {
    "Material Code": "IOCL-V-BF-8IN-150L",
    "Material Description": "Butterfly Valve 8 Inch 150 LB Triple Eccentric Lugged CS Body Disc CF8M / SS316 Fire Safe API 609 with Gearbox",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 65200,
    "Annual Quantity": 90
  },
  {
    "Material Code": "IOCL-FM-CORIOLIS-2IN",
    "Material Description": "Mass Flowmeter Coriolis Type 2 Inch 300 LB Flanged Measuring Range 50000 kg/h SS316L Sensor 4-20mA HART Output",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 325000,
    "Annual Quantity": 40
  },
  {
    "Material Code": "IOCL-P-A333-8S80",
    "Material Description": "Seamless Pipe Low Temperature CS 8 Inch NB Schedule 80 to ASTM A333 Gr 6 Beveled End",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 14350,
    "Annual Quantity": 7200
  },
  {
    "Material Code": "IOCL-TEMP-RTD-DUAL",
    "Material Description": "Dual Element RTD Pt 100 3-Wire Duplex Class A Immersion Length 400mm with Barstock Thermowell 1.5\" 300 LB RF SS316",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 12700,
    "Annual Quantity": 260
  },
  {
    "Material Code": "IOCL-V-NDL-12NPT-6K",
    "Material Description": "Instrument Needle Valve 1/2 Inch FNPT 6000 LB WOG Forged SS316 Bar Stock Body Screwed Bonnet",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 4350,
    "Annual Quantity": 920
  },
  {
    "Material Code": "IOCL-FL-BLIND-8-300",
    "Material Description": "Spectacle Blind 8 Inch 300 LB RF to ASME B16.48 Material CS ASTM A516 Grade 70",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 8600,
    "Annual Quantity": 350
  },
  {
    "Material Code": "IOCL-GK-RTJ-R45",
    "Material Description": "Ring Type Joint Gasket Size R-45 Octagonal Profile Soft Iron Material for API 6A / ASME B16.5 Flanges",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 1920,
    "Annual Quantity": 1400
  },
  {
    "Material Code": "IOCL-E-FLD-200-EXD",
    "Material Description": "Flameproof LED Flood Light Fitting 200 Watt 240V AC Gas Group IIC Zone 1 & 2 IP66 Corrosion Resistant LM6",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 35200,
    "Annual Quantity": 480
  },
  {
    "Material Code": "IOCL-S-DET-4GAS-PMP",
    "Material Description": "Multi Gas Monitor 4-Gas Oxygen Combustible LEL Hydrogen Sulfide Carbon Monoxide with Built-in Motorized Pump Intrinsically Safe",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 57500,
    "Annual Quantity": 170
  },
  {
    "Material Code": "IOCL-S-SCBA-300B-68",
    "Material Description": "SCBA Breathing Apparatus Set with 6.8L 300 Bar Composite Carbon Cylinder Positive Pressure Facepiece to EN 137 Class II",
    "Category": "Safety",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 83500,
    "Annual Quantity": 110
  },
  {
    "Material Code": "IOCL-V-DP-CHK-6-300",
    "Material Description": "Dual Plate Wafer Check Valve 6 Inch 300 LB Body and Discs Duplex SS S31803 Retainerless Design API 594",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 53400,
    "Annual Quantity": 130
  },
  {
    "Material Code": "IOCL-T-A213-T22-2IN",
    "Material Description": "Alloy Steel Boiler Tube 2\" OD x 4.5mm WT Seamless to ASTM A213 Gr. T22 Hydrotested",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 3920,
    "Annual Quantity": 5200
  },
  {
    "Material Code": "IOCL-M-BRG-6312-2Z",
    "Material Description": "Single Row Radial Ball Bearing 6312-2Z / C3 Metal Shields 60x130x31mm Motor & Pump Application",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 3180,
    "Annual Quantity": 680
  },
  {
    "Material Code": "IOCL-REF-CAT-HYD-50",
    "Material Description": "Hydrocracking Catalyst Nickel Molybdenum on Alumina Extrudates 1.3mm Bulk Density 0.75 g/ml",
    "Category": "Catalysts",
    "Unit of Measure": "Kg",
    "Unit Price (INR)": 1850,
    "Annual Quantity": 45000
  },
  {
    "Material Code": "IOCL-REF-FURN-TUB-HP",
    "Material Description": "Ethylene Cracking Furnace Radiating Coil Tube HP-40 Nb Modified Alloy 25Cr-35Ni",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 48000,
    "Annual Quantity": 850
  },
  {
    "Material Code": "IOCL-PMP-CRU-SUL-BB2",
    "Material Description": "Heavy Crude Column Bottoms Pump API 610 BB2 Between Bearing 8x6x13 Duplex Impeller",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 1850000,
    "Annual Quantity": 8
  },
  {
    "Material Code": "IOCL-COL-TR-VAL-SS",
    "Material Description": "Heavy Duty High-Capacity Valve Tray Cap SS410 for Distillation Fractionator Column",
    "Category": "Vessels",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 750,
    "Annual Quantity": 12000
  },
  {
    "Material Code": "IOCL-INST-GAS-CHRO",
    "Material Description": "Online Process Gas Chromatograph Explosion Proof C1-C6 Analysis with Sample System",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 1650000,
    "Annual Quantity": 6
  },
  {
    "Material Code": "IOCL-REF-EXP-TURB-01",
    "Material Description": "FCC Flue Gas Power Recovery Expander Turbine Rotor Inconel 738LC Blading",
    "Category": "Turbomachinery",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 3800000,
    "Annual Quantity": 4
  }
];

// 3. BPCL Dataset (Refinery Processing, Downstream Terminals & Dispatch) - 20 items
const bpclData = [
  {
    "Material Code": "BPCL-INST-PDT-250MB",
    "Material Description": "Diff. Pressure Transmitter 4-20mA HART Communication 0-250 mbar Hastelloy-C Diaphragm Ex-Proof",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 78900,
    "Annual Quantity": 140
  },
  {
    "Material Code": "BPCL-VAL-BFLY-8150",
    "Material Description": "Valve Butterfly 8\" 150# Lugged Metal to Metal Seat WCB Body SS316 Disc API 609 Cat B Handwheel / Gear Operated",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 64500,
    "Annual Quantity": 75
  },
  {
    "Material Code": "BPCL-INST-COR-50K",
    "Material Description": "Coriolis Mass Flow Meter Size 50mm (2\") Flange 300# SS316L Body Accuracy 0.1% Mass Rate 50 T/hr with Local Display",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 322000,
    "Annual Quantity": 30
  },
  {
    "Material Code": "BPCL-MAT-LTCS-880",
    "Material Description": "Carbon Steel Pipe Seamless Low Temp Grade 6 ASTM A333 8\" NB Sch 80 Plain / Beveled",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 14180,
    "Annual Quantity": 5800
  },
  {
    "Material Code": "BPCL-INST-RTD-100D",
    "Material Description": "Pt100 Resistance Temperature Detector Duplex 3 Wire SS316 Sheath L=400mm with Thermowell Flange 1-1/2 Inch 300#",
    "Category": "Instrumentation",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 12600,
    "Annual Quantity": 210
  },
  {
    "Material Code": "BPCL-VAL-NDL-05-6M",
    "Material Description": "Valve Needle 1/2\" NPT Female 6000# Pressure SS316 Construction High Pressure Gauge Isolation",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 4250,
    "Annual Quantity": 780
  },
  {
    "Material Code": "BPCL-FLG-SPBL-8300",
    "Material Description": "Figure 8 Spectacle Blind 8\" 300# RF Carbon Steel Plate A516 Gr.70 ASME B16.48",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 8500,
    "Annual Quantity": 290
  },
  {
    "Material Code": "BPCL-GSK-RING-R45",
    "Material Description": "RTJ Gasket R45 Octagonal Type Soft Iron Ring Joint to ASME B16.20 High Pressure Service",
    "Category": "Fittings",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 1880,
    "Annual Quantity": 1100
  },
  {
    "Material Code": "BPCL-LTG-EXP-200W",
    "Material Description": "Explosion-Proof LED Flood Luminaire 200W Ex d IIC T5 IP66 Heavy Duty Weatherproof Refinery Yard Lighting",
    "Category": "Electrical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 34800,
    "Annual Quantity": 390
  },
  {
    "Material Code": "BPCL-PPE-GAS-4WAY",
    "Material Description": "Four Gas Detector Portable Confined Space Monitor O2/LEL/CO/H2S with Suction Pump & Calibration Kit Ex ia IIC T4",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 56500,
    "Annual Quantity": 135
  },
  {
    "Material Code": "BPCL-PPE-SCBA-300B",
    "Material Description": "Breathing Apparatus SCBA Set 6.8 Litre Carbon Fibre Cylinder 300 Bar Complete with Harness Mask & Whistle Alarm EN137",
    "Category": "Safety",
    "Unit of Measure": "Set",
    "Unit Price (INR)": 82800,
    "Annual Quantity": 80
  },
  {
    "Material Code": "BPCL-VAL-CHCK-6300D",
    "Material Description": "Check Valve Dual Plate Wafer Style 6\" 300# Duplex Steel ASTM A890 Gr 4A / UNS S31803 Spring Loaded API 594",
    "Category": "Valves",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 52500,
    "Annual Quantity": 95
  },
  {
    "Material Code": "BPCL-TUB-BOIL-T22",
    "Material Description": "Tube Boiler Seamless Alloy Steel A213 T22 50.8mm OD (2 Inch) x 4.5mm Min Wall Thickness Heat Exchanger Tubing",
    "Category": "Pipes",
    "Unit of Measure": "Mtr",
    "Unit Price (INR)": 3880,
    "Annual Quantity": 4100
  },
  {
    "Material Code": "BPCL-BRG-BALL-6312",
    "Material Description": "Bearing Deep Groove Ball 6312-2Z/C3 Double Shield 60 mm Shaft Dia Dynamic Load 85kN SKF Equivalent",
    "Category": "Mechanical",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 3150,
    "Annual Quantity": 550
  },
  {
    "Material Code": "BPCL-LPG-CAR-CPL-02",
    "Material Description": "High Flow LPG Carousel Filling Gun Electronic Auto-Shutoff 50 bar Viton Seal",
    "Category": "LPG",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 48500,
    "Annual Quantity": 160
  },
  {
    "Material Code": "BPCL-TRK-BOT-LD-ARM",
    "Material Description": "Terminal Bottom Loading Arm 4\" Counterbalanced with API Coupler & Vapor Recovery Hose",
    "Category": "Terminal",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 340000,
    "Annual Quantity": 24
  },
  {
    "Material Code": "BPCL-TNK-ALM-IFR-40",
    "Material Description": "Internal Floating Roof (IFR) Full Contact Aluminum Pan Type for 40m Dia Petrol Storage Tank",
    "Category": "Storage",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 2850000,
    "Annual Quantity": 5
  },
  {
    "Material Code": "BPCL-MEC-TURB-MTR-06",
    "Material Description": "Custody Transfer Turbine Flow Meter 6\" Class 300 with Dual Pickoff & Preamplifier for POL",
    "Category": "Terminal",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 420000,
    "Annual Quantity": 15
  },
  {
    "Material Code": "BPCL-SAF-FOAM-PROP",
    "Material Description": "Balanced Pressure Foam Proportioner Skid 1000 LPM with Concentrate Tank & Deluge Valve",
    "Category": "Safety",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 680000,
    "Annual Quantity": 12
  },
  {
    "Material Code": "BPCL-RETAIL-DISP-MPD",
    "Material Description": "Multi-Product Fuel Dispenser (MPD) 4-Hose Dual Sided with Electronic Volume Totalizer & POS Interface",
    "Category": "Retail",
    "Unit of Measure": "Nos",
    "Unit Price (INR)": 460000,
    "Annual Quantity": 75
  }
];

// Helper to write CSV
function writeCsv(filePath, data) {
  const headers = Object.keys(data[0]);
  const rows = data.map(item => {
    return headers.map(h => {
      let val = String(item[h] !== undefined ? item[h] : '');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });
  const csvContent = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf8');
}

// Helper to write XLSX
function writeXlsx(filePath, data, sheetName) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filePath);
}

const targetDirs = [
  path.resolve(__dirname, '../external_catalogs'),
  path.resolve(__dirname, '../frontend/public/catalogs'),
  path.resolve(__dirname, '../frontend/dist/catalogs')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. ONGC
  writeCsv(path.join(dir, 'ONGC_Offshore_Field_Catalog_2026.csv'), ongcData);
  writeXlsx(path.join(dir, 'ONGC_Offshore_Field_Catalog_2026.xlsx'), ongcData, 'ONGC_Materials');

  // 2. IOCL
  writeCsv(path.join(dir, 'IOCL_Petrochem_Refinery_Catalog_2026.csv'), ioclData);
  writeXlsx(path.join(dir, 'IOCL_Petrochem_Refinery_Catalog_2026.xlsx'), ioclData, 'IOCL_Materials');

  // 3. BPCL
  writeCsv(path.join(dir, 'BPCL_Terminal_Operations_Catalog_2026.csv'), bpclData);
  writeXlsx(path.join(dir, 'BPCL_Terminal_Operations_Catalog_2026.xlsx'), bpclData, 'BPCL_Materials');

  // Also maintain the previous filenames as updated fresh files so existing links work seamlessly
  writeCsv(path.join(dir, 'ONGC_Material_Catalog_2026.csv'), ongcData);
  writeXlsx(path.join(dir, 'ONGC_Material_Catalog_2026.xlsx'), ongcData, 'ONGC_Materials');

  writeCsv(path.join(dir, 'IOCL_Refinery_Inventory_2026.csv'), ioclData);
  writeXlsx(path.join(dir, 'IOCL_Refinery_Inventory_2026.xlsx'), ioclData, 'IOCL_Materials');

  writeCsv(path.join(dir, 'BPCL_Procurement_Master_2026.csv'), bpclData);
  writeXlsx(path.join(dir, 'BPCL_Procurement_Master_2026.xlsx'), bpclData, 'BPCL_Materials');
}

console.log('Successfully generated all fresh catalogs across all target directories!');
