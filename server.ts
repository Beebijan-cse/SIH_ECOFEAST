import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent as instructed by guidelines
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Gemini Client:', err);
  }
}

// Server-side AI Assistant endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, role, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemInstruction = `
You are the EcoFeast AI Assistant — an expert food safety, surplus management, and logistics advisor for institutional kitchens, food processing units (FPUs), NGOs, and sustainability administrators.
EcoFeast is an AI-powered smart food surplus redistribution platform connecting:
Institutional Kitchens → Safety Verification → Smart Matching → NGO Pickups → Traceability → Environmental & Social Impact Measurement.

Guidelines you follow strictly:
1. Food Safety & FSSAI / HACCP:
   - Cooked hot food must be maintained above 60°C (Hot Hold).
   - Cold food must be kept below 4°C (Cold Refrigerated).
   - The Temperature Danger Zone is between 5°C and 60°C. Cooked meals held in the danger zone for >2 hours must be flagged as potentially hazardous, and after 4 hours must be marked UNSAFE and condemned.
   - Any food failing sensory inspection (sour smell, mold, packaging punctures) must never be matched to NGOs.
2. Smart Matching Algorithm:
   - Evaluates Distance (0-40 pts), Expiry Urgency (0-30 pts), Category & Storage Compatibility (0-20 pts), and NGO Intake Capacity (0-10 pts).
3. Impact Metrics:
   - 1 kg of rescued food = ~2.5 nutritious meals supported and ~2.5 kg CO2e greenhouse gas emissions avoided from landfill decomposition.
4. Voice & Tone:
   - Clear, concise, encouraging, professional, domain-grounded. Provide actionable steps. Keep answers under 3-4 short paragraphs or bullet points.
User role: ${role || 'kitchen'}.
Context: ${context ? JSON.stringify(context) : 'None provided'}.
`;

  if (geminiClient && process.env.GEMINI_API_KEY) {
    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'I analyzed your request. Please ensure all safety parameters comply with HACCP guidelines before distribution.';
      return res.json({ reply });
    } catch (apiError: any) {
      console.warn('Gemini API call returned error, using fallback expert logic:', apiError?.message);
    }
  }

  // Graceful domain-expert fallback when GEMINI_API_KEY is not configured
  let fallbackReply = '';
  const lower = message.toLowerCase();

  if (lower.includes('safety') || lower.includes('temperature') || lower.includes('haccp') || lower.includes('danger zone')) {
    fallbackReply = `**Food Safety & Temperature Standards:**\n\n- **Hot Holding:** Maintain cooked food strictly at **>60°C (140°F)** in insulated thermal containers.\n- **Cold Holding:** Perishables and dairy must stay at **<4°C (40°F)**.\n- **Danger Zone Rule:** Food between 5°C and 60°C for >2 hours must be consumed immediately; beyond 4 hours, it must be marked **UNSAFE** and discarded per FSSAI regulations.\n- **Packaging:** Only food with airtight seals or unbroken food-grade liners qualifies for NGO matching.`;
  } else if (lower.includes('matching') || lower.includes('score') || lower.includes('algorithm')) {
    fallbackReply = `**How EcoFeast Smart Matching Works:**\n\n1. **Distance Factor (40 pts):** Prioritizes NGOs within 5-10 km radius using Haversine calculation to minimize transport transit time.\n2. **Urgency Weight (30 pts):** Food expiring within 3 hours receives higher priority routing.\n3. **Storage Compatibility (20 pts):** Ensures NGOs possess cold chain or thermal insulated carriers matching the food type.\n4. **Intake Capacity (10 pts):** Validates the NGO's daily beneficiary quota can absorb the batch size.`;
  } else if (lower.includes('fpu') || lower.includes('processing') || lower.includes('shelf life')) {
    fallbackReply = `**FPU (Food Processing Unit) Workflow:**\n\nSurplus raw fruits, vegetables, and prep ingredients can be upgraded rather than wasted:\n1. **Received:** Inspected and weighed.\n2. **Processed:** Solar dehydrated, retort pasteurized, or turned into jams/purees.\n3. **Packed:** Hermetically sealed with new 6-month expiry.\n4. **Redistributed:** Dispatched to community relief camps.`;
  } else if (lower.includes('co2') || lower.includes('impact') || lower.includes('meals') || lower.includes('formula')) {
    fallbackReply = `**Impact Measurement Standards:**\n\n- **1 kg Rescued Food** = **2.5 Nutritious Meals** for vulnerable communities.\n- **1 kg Rescued Food** = **2.5 kg CO₂ Equivalent Avoided** by preventing anaerobic methane formation in municipal dumps.\n- Impact metrics sync dynamically whenever an NGO marks a pickup as "Completed".`;
  } else if (lower.includes('surplus') || lower.includes('listing') || lower.includes('create')) {
    fallbackReply = `**Steps to List Surplus Food:**\n\n1. Navigate to **Create Surplus** in your Kitchen dashboard.\n2. Enter Food Name, Category, exact Quantity, and Storage Condition.\n3. Complete the digital **Safety Check** (probe temperature, appearance, packaging).\n4. Once certified **SAFE**, the Smart Matching Engine immediately recommends the best nearby NGOs!`;
  } else {
    fallbackReply = `Welcome to **EcoFeast**. I can assist you with:\n- Real-time **Food Safety & HACCP Verification** thresholds.\n- Explaining **Smart NGO Matching Scores** and routing.\n- Coordinating **Pickup Timelines** & digital handshakes.\n- Verifying **Traceability Timelines** from kitchen kettle to plate.\n\nWhat specific part of your surplus workflow would you like guidance on?`;
  }

  return res.json({ reply: fallbackReply });
});

// Supabase Status & Public Configuration Endpoints
app.get('/api/supabase/config', (_req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || null;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    null;

  res.json({
    configured: Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')),
    supabaseUrl: supabaseUrl && !supabaseUrl.includes('your-project') ? supabaseUrl : null,
    supabaseAnonKey: supabaseAnonKey && !supabaseAnonKey.includes('your-anon-public-key') ? supabaseAnonKey : null,
  });
});

app.get('/api/supabase/status', async (_req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    return res.json({
      configured: false,
      message: 'Supabase environment variables not configured on server.',
      url: null,
    });
  }

  try {
    // Ping Supabase REST API root
    const testUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/`;
    const response = await fetch(testUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    res.json({
      configured: true,
      url: supabaseUrl,
      reachable: response.ok || response.status === 401 || response.status === 404,
      status: response.status,
    });
  } catch (err: any) {
    res.json({
      configured: true,
      url: supabaseUrl,
      reachable: false,
      error: err.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(geminiClient && process.env.GEMINI_API_KEY),
    supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoFeast Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
