const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const isGeminiEnabled = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 10;

let genAI = null;
let model = null;
let textModel = null;

if (isGeminiEnabled) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });
    textModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });
  } catch (e) {
    console.warn('Gemini initialization warning:', e.message);
  }
}

// Local helper for extracting basic specs
function extractLocalSpecs(desc = '') {
  const d = desc.toLowerCase();
  
  let category = 'General';
  let type = 'Standard Item';
  if (d.includes('pipe') || d.includes('tube')) { category = 'Pipes'; type = 'Pipe'; }
  else if (d.includes('valve')) { category = 'Valves'; type = d.includes('gate') ? 'Gate Valve' : d.includes('ball') ? 'Ball Valve' : d.includes('check') ? 'Check Valve' : d.includes('globe') ? 'Globe Valve' : 'Valve'; }
  else if (d.includes('bolt') || d.includes('nut') || d.includes('washer') || d.includes('stud') || d.includes('fastener')) { category = 'Fasteners'; type = d.includes('bolt') ? 'Hex Bolt' : d.includes('nut') ? 'Hex Nut' : d.includes('washer') ? 'Washer' : 'Fastener'; }
  else if (d.includes('elbow') || d.includes('tee') || d.includes('reducer') || d.includes('flange') || d.includes('fitting')) { category = 'Fittings'; type = d.includes('elbow') ? '90 Deg Elbow' : d.includes('flange') ? 'Flange' : d.includes('tee') ? 'Equal Tee' : 'Fitting'; }
  else if (d.includes('cable') || d.includes('motor') || d.includes('switchgear') || d.includes('transformer')) { category = 'Electrical'; type = d.includes('cable') ? 'Power Cable' : d.includes('motor') ? 'Induction Motor' : 'Electrical Item'; }
  else if (d.includes('gauge') || d.includes('thermocouple') || d.includes('meter') || d.includes('sensor')) { category = 'Instruments'; type = d.includes('gauge') ? 'Pressure Gauge' : 'Instrument'; }
  else if (d.includes('helmet') || d.includes('glove') || d.includes('shoe') || d.includes('safety')) { category = 'Safety'; type = d.includes('helmet') ? 'Safety Helmet' : d.includes('shoe') ? 'Safety Shoes' : 'Safety Equipment'; }
  else if (d.includes('oil') || d.includes('solvent') || d.includes('lubricant') || d.includes('chemical') || d.includes('toluene')) { category = 'Chemicals'; type = 'Industrial Chemical/Oil'; }

  let material = 'Standard';
  if (d.includes('ss304') || d.includes('ss 304') || d.includes('stainless steel 304')) material = 'Stainless Steel 304';
  else if (d.includes('ss316') || d.includes('ss 316')) material = 'Stainless Steel 316';
  else if (d.includes('cs') || d.includes('carbon steel') || d.includes('a106') || d.includes('a216')) material = 'Carbon Steel';
  else if (d.includes('cu') || d.includes('copper')) material = 'Copper';
  else if (d.includes('hdpe')) material = 'HDPE';
  else if (d.includes('leather')) material = 'Leather';

  let size = 'Standard';
  const sizeMatch = desc.match(/(\d+(?:\.\d+)?\s*(?:inch|in|"|mm|cm|m|meter|od|dia|m\d+))/i);
  if (sizeMatch) size = sizeMatch[0];

  let pressure = 'Standard';
  const pressMatch = desc.match(/(\d+\s*(?:#|lb|class\s*\d+|bar|psi))/i);
  if (pressMatch) pressure = pressMatch[0];

  let standard = 'Standard';
  const stdMatch = desc.match(/(astm\s*[a-z0-9]+(?:\s*gr\s*[a-z0-9]+)?|iso\s*[a-z0-9]+|din\s*\d+|bis\s*\d+)/i);
  if (stdMatch) standard = stdMatch[0];

  return { category, specifications: { type, material, size, pressure_class: pressure, standard, grade: standard } };
}

async function compareMaterials(materialA, materialB) {
  if (model) {
    const prompt = `Compare these two material descriptions:
A: ${materialA.description}
B: ${materialB.description}

Provide a JSON response with:
{
  "match_score": <number 0-100>,
  "match_type": <"identical" | "near-duplicate" | "equivalent" | "different">,
  "field_comparison": {
    "type": {"a": "", "b": "", "match": true/false},
    "material": {"a": "", "b": "", "match": true/false},
    "size": {"a": "", "b": "", "match": true/false},
    "pressure_class": {"a": "", "b": "", "match": true/false},
    "standard": {"a": "", "b": "", "match": true/false}
  },
  "reasoning": "<string explaining the match type and score>"
}`;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent local NLP fallback:', err.message);
    }
  }

  // Industrial Engineering NLP ground-truth comparator
  const { compareEngineeringSpecs } = require('./nlpNormalizer');
  return compareEngineeringSpecs(materialA, materialB);
}

async function classifyMaterial(description) {
  if (model) {
    const prompt = `Classify this material description and extract its specifications:
"${description}"

Provide a JSON response with:
{
  "category": "<string, e.g., Pipes, Valves, Fasteners, Fittings, Electrical, Instruments, Safety, Chemicals>",
  "specifications": {
    "type": "<string>",
    "material": "<string>",
    "size": "<string>",
    "pressure_class": "<string>",
    "standard": "<string>",
    "grade": "<string>"
  }
}`;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      console.warn('Gemini API call failed, using local extraction:', err.message);
    }
  }

  const { normalizeDescription } = require('./nlpNormalizer');
  return normalizeDescription(description);
}

async function generateNationalCode(category, specifications = {}) {
  if (model) {
    const prompt = `Generate a national code for a material based on:
Category: ${category}
Specs: ${JSON.stringify(specifications)}

Format example: IND-VALVE-CS-150-CL150
Provide a JSON response with:
{
  "national_code": "<string>"
}`;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      console.warn('Gemini code generator fallback:', err.message);
    }
  }

  const catCode = (category || 'GEN').substring(0, 3).toUpperCase();
  const matCode = (specifications.material || 'STD').replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const randNum = Math.floor(100 + Math.random() * 900);
  return {
    national_code: `IND-${catCode}-${matCode}-${randNum}`
  };
}

async function chatWithData(userMessage, materialsContext) {
  if (textModel) {
    const prompt = `You are EkCode AI Assistant, an expert in Indian CPSE Material Standardization & One Nation One Material Code initiative.
Context (Relevant materials from database):
${JSON.stringify(materialsContext)}

User Question: ${userMessage}

Provide a helpful, precise, professional response highlighting duplicate reduction, collaborative procurement, and inventory optimization in Indian Rupees (₹).`;
    try {
      const result = await textModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.warn('Gemini chat fallback:', err.message);
    }
  }

  // Contextual fallback response
  if (materialsContext && materialsContext.length > 0) {
    let reply = `🔎 **Found ${materialsContext.length} related items across CPSE catalogs:**\n\n`;
    materialsContext.slice(0, 4).forEach((m, idx) => {
      reply += `${idx + 1}. **[${m.cpse_name}]** \`${m.original_code}\` — ${m.description} (₹${m.unit_price || 0}/${m.unit_of_measure || 'Nos'})\n`;
    });
    reply += `\n💡 *EkCode AI detects nomenclature variations and consolidates these items under unified National Codes to eliminate duplicate spend.*`;
    return reply;
  }

  return `I'm your **EkCode Material Standardization Assistant**. You can ask me to:\n- 🔍 **Search items:** *"Find carbon steel pipes"*, *"Search ball valves"*\n- 📊 **Analyze duplicates:** *"What are the top duplicate materials across ONGC, BPCL, IOC?"*\n- 💰 **Savings:** *"How much money can we save with One Nation One Code?"*\n- ❓ **Learn about the platform:** *"Explain this project"* or *"How does the AI work?"*`;
}

async function checkDataQuality(materials) {
  if (model) {
    const prompt = `Analyze these materials for data quality issues:
${JSON.stringify(materials)}

Check for missing unit_of_measure, short descriptions (<5 words), price anomalies (>3x average for same category).
Provide a JSON response with an array of objects:
[
  { "id": "<material_id>", "flags": ["flag 1", "flag 2"] }
]`;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      console.warn('Gemini quality check fallback:', err.message);
    }
  }

  return materials.map(m => {
    const flags = [];
    if (!m.unit_of_measure) flags.push('Missing Unit of Measurement');
    if ((m.description || '').split(' ').length < 4) flags.push('Short / Incomplete Description');
    return { id: m._id, flags };
  }).filter(x => x.flags.length > 0);
}

module.exports = {
  compareMaterials,
  classifyMaterial,
  generateNationalCode,
  chatWithData,
  checkDataQuality
};

