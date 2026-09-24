const express = require('express');
const router = express.Router();
const { chatWithData } = require('../services/geminiService');
const Material = require('../models/Material');
const Match = require('../models/Match');
const UnifiedMaterial = require('../models/UnifiedMaterial');
const { calculateSavings } = require('../services/savingsCalculator');

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const q = message.toLowerCase().trim();

    // 1. Greetings & Casual Banter
    if (/^(hi|hii|hiii|hello|hey|heyy|namaste|good\s*(morning|evening|afternoon)|hola)\b/i.test(q)) {
      const totalMaterials = await Material.countDocuments();
      const totalMatches = await Match.countDocuments();
      return res.json({
        reply: `👋 **Hello! Welcome to EkCode AI Assistant.**\n\nI am here to help you navigate the **One Nation, One Material Code** platform (SIH26099). We have currently indexed **${totalMaterials} materials** and identified **${totalMatches} duplicate relationships** across ONGC, BPCL, and IOC.\n\n**Here are a few things you can ask me:**\n- 🔍 *'Find all carbon steel pipes'* or *'Search ball valves'*\n- 📊 *'What is the most duplicated material?'*\n- 🔎 *'What is the least duplicated material?'*\n- ❓ *'I don't know about this site — explain what EkCode does'*\n- 💰 *'How much money can CPSEs save?'*\n- 🛠️ *'How does the AI matching algorithm work?'*\n\nHow can I help you today?`
      });
    }

    // 1.1 Casual Conversation & Check-ins ("whatsup", "all good ?", "how are you", "sup")
    if (
      q.includes('whatsup') || q.includes("what's up") || q.includes('whats up') ||
      q.includes('how are you') || q.includes('all good') || q.includes('you good') ||
      q.includes('hows it going') || q.includes("how's it going") || q.includes('doing well')
    ) {
      const totalMaterials = await Material.countDocuments();
      const totalMatches = await Match.countDocuments();
      const unifiedCount = await UnifiedMaterial.countDocuments();
      return res.json({
        reply: `🚀 **All systems operational!**\n\nI'm actively monitoring **${totalMaterials} registered items** across ONGC, BPCL, and IOC. So far, we've identified **${totalMatches} duplicate relationships** and unified **${unifiedCount} standardized National Materials**!\n\nEverything is running smoothly. Looking to cross-reference an item, check duplicate rates, or calculate bulk demand savings? Let me know!`
      });
    }

    // 1.2 Friendly handling of frustration / slang
    if (
      q.includes('madarchod') || q.includes('bhenchod') || q.includes('bc') || q.includes('mc') ||
      q.includes('fuck') || q.includes('idiot') || q.includes('stupid') || q.includes('dumb') ||
      q.includes('useless')
    ) {
      return res.json({
        reply: `🤝 **No worries! I'm here to help you get the exact data you need.**\n\nI can directly search items, find duplicates, calculate procurement savings, or explain how to present this to Smart India Hackathon evaluators.\n\nTry asking:\n- *"What's the most duplicated material?"*\n- *"What is the least duplicated material?"*\n- *"Find all carbon steel pipes"*\n- *"Explain this project in 30 seconds"*`
      });
    }

    // 2. Platform & Site Explanation ("i dont know about this site", "what is this project", "explain this")
    if (
      q.includes('dont know') || q.includes("don't know") ||
      q.includes('what is this site') || q.includes('about this site') ||
      q.includes('what is ekcode') || q.includes('explain this') ||
      q.includes('what does this do') || q.includes('problem statement') ||
      q.includes('what is the project') || q.includes('tell me about this') ||
      q.includes('how does this work') || q.includes('overview')
    ) {
      return res.json({
        reply: `🏛️ **Welcome to EkCode — One Nation, One Material Code (SIH26099)**\n\n### 🧠 The Core Problem:\nIndian government CPSEs (like **ONGC**, **BPCL**, and **IOC**) frequently buy the exact same materials, but each company uses a completely different internal code and description.\n\n| CPSE | Material Code | Description |\n|---|---|---|\n| **ONGC** | \`ONGC-FAS-030\` | Hex Bolt M12x60 CS Gr8.8 |\n| **IOC** | \`IOC-MT-0093\` | Hex Bolt M12x60 CS 8.8 |\n\nBecause their legacy ERP systems use different names, CPSEs purchase independently, miss out on bulk volume discounts, and hold duplicate spare inventories.\n\n### 🚀 How EkCode Solves It:\n1. 🔍 **AI Duplicate Detection:** Uses NLP to analyze descriptions, extract physical attributes (Material, Size, Pressure, Standard), and detect identical & near-duplicate items.\n2. 🏷️ **National Code Standardization:** Generates unique national codes (e.g. \`IND-FAS-CAR-377\`).\n3. 🔗 **Harmonization Hub:** Maintains bidirectional mapping so each CPSE can trace their legacy code to the National Code.\n4. 💰 **Demand Aggregation:** Consolidates procurement volumes to unlock **15%+ bulk discount savings**.\n\n💡 *Tip: Check out the **Matches** tab to review AI recommendations or the **Master** tab to see unified national codes!*`
      });
    }

    // 3. Technical Stack & Algorithm Questions ("how does matching work", "what stack", "what algorithm")
    if (q.includes('algorithm') || q.includes('tech stack') || q.includes('how does matching work') || q.includes('how do you match') || q.includes('architecture')) {
      return res.json({
        reply: `⚙️ **EkCode Technical Architecture & Matching Engine:**\n\n### 🏗️ Technology Stack:\n- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide/Material Icons\n- **Backend:** Node.js + Express REST API\n- **Database:** MongoDB (Mongoose Schema with indexed legacy code mappings & audit logs)\n- **AI/NLP Layer:** Google Gemini 2.0 Flash API with local rule-based NLP attribute extraction fallback\n\n### 🔍 3-Stage AI Matching Pipeline:\n1. **Pre-Filtering:** Candidates are grouped by category (Pipes, Valves, Fasteners, etc.) to prevent $O(N^2)$ bottlenecks.\n2. **Attribute Normalization & NLP Extraction:** Tokenizes descriptions and extracts normalized dimensions (e.g., \`4 inch\` = \`100mm\`), materials (\`CS\` = \`Carbon Steel\`, \`SS316\`), and pressure classes (\`150#\` = \`Class 150\`).\n3. **Hybrid Confidence Scoring:** Combines Jaccard token similarity (60%) with field-by-field attribute equivalence (40%) to classify matches into **Identical (>88%)**, **Near-Duplicate (70-87%)**, or **Equivalent (50-69%)**.\n\n💡 *Evaluator Note: Explainable AI cards in the **Matches** tab show the exact field-by-field breakdown for complete human-in-the-loop transparency.*`
      });
    }

    // 3.1 Pitch for Evaluators / Judges
    if (q.includes('pitch') || q.includes('presentation') || q.includes('judge') || q.includes('evaluator') || q.includes('30 second') || q.includes('elevator')) {
      return res.json({
        reply: `🎤 **30-Second Winning Pitch for SIH Evaluators:**\n\n> *"Respected Evaluators, today Indian CPSEs like ONGC, BPCL, and IOC buy the same industrial materials under isolated proprietary codes, losing crores in uncoordinated procurement and fragmented inventories.\n>\n> Our platform, **EkCode**, implements the national vision of **'One Nation, One Material Code'**.\n>\n> Powered by a hybrid NLP engine, EkCode automatically matches cross-CPSE descriptions, normalizes technical attributes, generates uniform National Codes, and preserves backward traceability.\n>\n> Across just 90 sample items, our system uncovered **116 duplicate relationships** unlocking over **₹14 Crore in bulk demand savings**. With EkCode, India builds a unified, transparent, and self-reliant public procurement ecosystem."*`
      });
    }

    // 4. Duplicate Counts & Analytics
    if (q.includes('how many duplicate') || (q.includes('count') && q.includes('duplicate')) || q.includes('duplicate statistics')) {
      const identicalCount = await Match.countDocuments({ match_type: 'identical' });
      const nearCount = await Match.countDocuments({ match_type: 'near-duplicate' });
      const equivCount = await Match.countDocuments({ match_type: 'equivalent' });
      const totalMatches = await Match.countDocuments();
      const totalMaterials = await Material.countDocuments();

      return res.json({
        reply: `📊 **Duplicate Analysis Across Catalogs:**\n\nOut of **${totalMaterials} total materials** registered across ONGC, BPCL, and IOC:\n- 🟢 **${identicalCount} Exact Duplicates** (identical physical specifications across CPSEs)\n- 🟡 **${nearCount} Near-Duplicates** (same functional item with minor nomenclature variations)\n- 🔵 **${equivCount} Functionally Equivalent** items\n\nTotal of **${totalMatches} duplication relationships** identified for national standardization under One Nation, One Material Code.`
      });
    }

    // 5. Top Duplicated Materials
    if (q.includes('most duplicate') || q.includes('top duplicate') || q.includes('top matches')) {
      const topMatches = await Match.find({ match_score: { $gte: 85 } })
        .populate('material_a material_b')
        .limit(5);

      let reply = `🔍 **Top Duplicated Materials Identified Across CPSEs:**\n\n`;
      topMatches.forEach((m, idx) => {
        if (m.material_a && m.material_b) {
          reply += `${idx + 1}. **${m.material_a.category || 'Item'}** (${m.match_score}% Match Confidence):\n   - **${m.material_a.cpse_name}**: \`${m.material_a.original_code}\` — *${m.material_a.description}*\n   - **${m.material_b.cpse_name}**: \`${m.material_b.original_code}\` — *${m.material_b.description}*\n\n`;
        }
      });
      reply += `💡 *Recommendation: Standardize and consolidate under a common National Code in the **Matches** tab to unlock bulk procurement pricing.*`;
      return res.json({ reply });
    }

    // 5.1 Least Duplicated / Unique Materials
    if (q.includes('least duplicate') || q.includes('lowest duplicate') || q.includes('unique material') || q.includes('least matched')) {
      const allMaterials = await Material.find({});
      const allMatches = await Match.find({});
      
      const matchCounts = {};
      allMatches.forEach(m => {
        if (m.material_a) matchCounts[m.material_a.toString()] = (matchCounts[m.material_a.toString()] || 0) + 1;
        if (m.material_b) matchCounts[m.material_b.toString()] = (matchCounts[m.material_b.toString()] || 0) + 1;
      });

      const sorted = allMaterials.map(m => ({
        material: m,
        count: matchCounts[m._id.toString()] || 0
      })).sort((a, b) => a.count - b.count);

      const leastDuplicated = sorted.slice(0, 5);

      let reply = `🔬 **Least Duplicated / Most Unique Materials Identified:**\n\nThese items have the lowest duplication frequency across other CPSE catalogs (specialized or plant-specific):\n\n`;
      leastDuplicated.forEach((item, idx) => {
        const m = item.material;
        reply += `${idx + 1}. **[${m.cpse_name}]** \`${m.original_code}\` — *${m.description}*\n   - Category: **${m.category || 'General'}** · Matches across other CPSEs: **${item.count}**\n   - Unit Price: ₹${m.unit_price || 0} · Qty: ${m.annual_quantity || 0}\n\n`;
      });
      reply += `💡 *Why are these least duplicated? These represent proprietary, highly specialized process equipment (e.g. specialized tubing, unique sensor instruments, or single-plant chemicals) that are customized to specific refinery units.*`;
      return res.json({ reply });
    }

    // 6. Savings & Financial Analytics
    if (q.includes('money') || q.includes('save') || q.includes('saving') || q.includes('cost') || q.includes('financial')) {
      const savingsData = await calculateSavings();
      const formattedTotal = (savingsData.totalSavings / 10000000).toFixed(2);
      const unifiedCount = await UnifiedMaterial.countDocuments();

      let reply = `💰 **Procurement Savings Intelligence:**\n\nThrough cross-CPSE demand aggregation and 15% bulk volume procurement discounting on duplicate items, EkCode estimates:\n\n- 💵 **Total Projected Savings: ₹${formattedTotal} Crore**\n- 🏷️ **Consolidated National Items: ${unifiedCount} standardized materials**\n\n**Top Savings by Category:**\n`;
      for (const [cat, amt] of Object.entries(savingsData.savingsByCategory || {})) {
        reply += `- **${cat}**: ₹${(amt / 100000).toFixed(1)} Lakhs\n`;
      }
      reply += `\n📈 *Savings model: Combines annual order volumes across ONGC, BPCL, and IOC to negotiate bulk tiered pricing.*`;
      return res.json({ reply });
    }

    // 7. Specific CPSE Queries (e.g. "tell me about ONGC", "what does BPCL have?", "IOC materials")
    if (q.includes('ongc') || q.includes('bpcl') || q.includes('ioc')) {
      let targetCpse = 'ONGC';
      if (q.includes('bpcl')) targetCpse = 'BPCL';
      else if (q.includes('ioc')) targetCpse = 'IOC';

      const cpseMaterials = await Material.find({ cpse_name: targetCpse });
      const categories = [...new Set(cpseMaterials.map(m => m.category || 'General'))];
      const totalSpend = cpseMaterials.reduce((acc, m) => acc + ((m.unit_price || 0) * (m.annual_quantity || 0)), 0);

      let reply = `🏢 **${targetCpse} Catalog Summary:**\n\n- 📦 **Total Cataloged Items:** ${cpseMaterials.length} materials\n- 🏷️ **Active Categories:** ${categories.join(', ')}\n- 💳 **Estimated Annual Procurement Spend:** ₹${(totalSpend / 10000000).toFixed(2)} Crore\n\n**Sample Items Registered:**\n`;
      cpseMaterials.slice(0, 4).forEach((m, idx) => {
        reply += `${idx + 1}. \`${m.original_code}\` — ${m.description} (₹${m.unit_price || 0}/${m.unit_of_measure || 'Nos'})\n`;
      });
      reply += `\n🔗 *Many of these items have direct duplicates in the other CPSEs! Check the **Harmonization** tab to see the cross-mappings.*`;
      return res.json({ reply });
    }

    // 8. Precise Material Search queries
    if (q.includes('find') || q.includes('search') || q.includes('pipe') || q.includes('valve') || q.includes('bolt') || q.includes('cable') || q.includes('steel') || q.includes('flange') || q.includes('glove') || q.includes('helmet') || q.includes('gauge') || q.includes('mcb')) {
      const andConditions = [];

      // Check material type
      if (q.includes('carbon steel') || q.includes(' cs ') || q.startsWith('cs ') || q.endsWith(' cs')) {
        andConditions.push({
          $or: [
            { description: { $regex: /carbon steel/i } },
            { description: { $regex: /\bCS\b/i } },
            { description: { $regex: /A106|A216/i } },
            { 'specifications.material': { $regex: /carbon/i } }
          ]
        });
      } else if (q.includes('stainless') || q.includes(' ss ') || q.startsWith('ss ') || q.endsWith(' ss') || q.includes('ss304') || q.includes('ss316')) {
        andConditions.push({
          $or: [
            { description: { $regex: /stainless/i } },
            { description: { $regex: /SS304|SS316|\bSS\b/i } },
            { 'specifications.material': { $regex: /stainless/i } }
          ]
        });
      }

      // Check category / item type
      if (q.includes('pipe') || q.includes('tube') || q.includes('piping')) {
        andConditions.push({
          $or: [
            { category: 'Pipes' },
            { description: { $regex: /pipe|tube|erw|seamless/i } }
          ]
        });
      } else if (q.includes('valve')) {
        andConditions.push({
          $or: [
            { category: 'Valves' },
            { description: { $regex: /valve|gate|ball|check|globe/i } }
          ]
        });
      } else if (q.includes('bolt') || q.includes('fastener') || q.includes('nut') || q.includes('washer')) {
        andConditions.push({
          $or: [
            { category: 'Fasteners' },
            { description: { $regex: /bolt|nut|washer|stud|fastener/i } }
          ]
        });
      } else if (q.includes('flange') || q.includes('fitting') || q.includes('elbow') || q.includes('tee')) {
        andConditions.push({
          $or: [
            { category: 'Fittings' },
            { description: { $regex: /flange|elbow|tee|reducer|fitting/i } }
          ]
        });
      } else if (q.includes('cable') || q.includes('motor') || q.includes('mcb')) {
        andConditions.push({
          $or: [
            { category: 'Electrical' },
            { description: { $regex: /cable|motor|armoured|cu|mcb/i } }
          ]
        });
      } else if (q.includes('gauge') || q.includes('thermocouple') || q.includes('meter')) {
        andConditions.push({
          $or: [
            { category: 'Instruments' },
            { description: { $regex: /gauge|thermocouple|meter|transmitter/i } }
          ]
        });
      } else if (q.includes('glove') || q.includes('helmet') || q.includes('shoe')) {
        andConditions.push({
          $or: [
            { category: 'Safety' },
            { description: { $regex: /glove|helmet|shoe|safety/i } }
          ]
        });
      }

      let found = [];
      if (andConditions.length > 0) {
        found = await Material.find({ $and: andConditions }).limit(10);
      } else {
        const cleanWords = q.replace(/find|all|the|show|me|list|get|items|materials|across|cpse/gi, '').trim().split(/\s+/).filter(w => w.length > 2);
        if (cleanWords.length > 0) {
          const regs = cleanWords.map(w => new RegExp(w, 'i'));
          found = await Material.find({ description: { $all: regs } }).limit(8);
        }
      }

      if (found.length > 0) {
        let reply = `🔎 **Found ${found.length} matching materials across CPSE databases:**\n\n`;
        found.forEach((m, idx) => {
          reply += `${idx + 1}. **[${m.cpse_name}]** \`${m.original_code}\` — ${m.description} (Rate: ₹${m.unit_price || 0}/${m.unit_of_measure || 'Nos'})\n`;
        });
        reply += `\n💡 *Notice how ONGC, BPCL, and IOC procure functionally equivalent items under different codes and names. You can map them under a common National Code in the **Matches** tab.*`;
        return res.json({ reply });
      }
    }

    // 9. General query: extract keywords and query database context for Gemini
    const words = message.split(' ').filter(w => w.length > 3);
    const regexps = words.map(w => new RegExp(w, 'i'));
    
    const contextMaterials = await Material.find({
      $or: [
        { description: { $in: regexps } },
        { category: { $in: regexps } }
      ]
    }).limit(10);

    const reply = await chatWithData(message, contextMaterials);
    res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

