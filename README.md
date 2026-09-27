# EcoFeast 🍃

> **"Save Food. Connect Communities. Create Impact."**
> 
> AI-powered smart food surplus reduction, redistribution, safety verification, NGO matching, pickup coordination, traceability, and sustainability impact platform for institutional kitchens and food processing units.
>
> Built for the **Smart India Hackathon (SIH 2026)**.

---

## 1. Executive Summary

- **Problem:** Over 68 million tonnes of food are wasted in India annually while millions experience nutritional deficit. Large institutional kitchens (university messes, hospital canteens, corporate parks, and banquet halls) generate significant daily surplus (10–25%) that deteriorates rapidly due to lack of digital food safety verification, slow manual phone coordination, and zero real-time logistics traceability.
- **Solution:** EcoFeast bridges this gap by creating an automated, closed-loop food recovery pipeline:
  $$\text{Institutional Kitchens} \rightarrow \text{Safety Verification (HACCP)} \rightarrow \text{Smart Matching} \rightarrow \text{NGO Dispatch} \rightarrow \text{Traceability} \rightarrow \text{Impact Measurement}$$

---

## 2. Core Stakeholder Roles

1. **Kitchen (Institutional Kitchens):**
   - Log batch surplus with quantity, storage temperature protocol, and preparation window.
   - Perform digital probe temperature checks and seal inspections.
   - Review transparent algorithmic match recommendations.
   - Monitor driver dispatch and handover handshakes.
2. **FPU (Food Processing Units):**
   - Source bulk surplus fruits, vegetables, and bakery items.
   - Upcycle perishable raw goods into shelf-stable rations (retort purees, solar-dehydrated fruit chews).
   - Track processing workflow: `Received` $\rightarrow$ `Processed` $\rightarrow$ `Packed` $\rightarrow$ `Redistributed`.
3. **NGO (Food Banks & Relief Shelters):**
   - Browse nearby verified-safe surplus with Haversine distance calculations and expiry countdowns.
   - Accept algorithmic match recommendations.
   - Dispatch volunteer vans with insulated thermal carriers.
   - Update delivery status to automatically calculate meals served and greenhouse gas offsets.
4. **Admin (Platform Operations Authority):**
   - Network command center with real-time audit feed.
   - Inspect cross-institutional food movements, match accuracy, and user credentials.
   - Maintain the National Sustainability Leaderboard.
   - Analyze platform velocity SLAs and emissions avoided.

---

## 3. Technology Stack

- **Frontend:**
  - React 19 + TypeScript
  - Vite
  - Tailwind CSS 4
  - Lucide React Icons
  - Recharts for dynamic visual telemetry
  - React Router for role-guarded navigation
- **Backend & Server-Side AI:**
  - Node.js + Express (`server.ts`) with integrated Vite middleware
  - Google GenAI SDK (`@google/genai`) with `gemini-3.8-flash`
  - Zero browser API key exposure
- **Database & Security:**
  - Supabase PostgreSQL with 12 structured relational tables
  - Row Level Security (RLS) policies
  - UUID primary and foreign keys
  - Local reactive fallback storage engine for immediate zero-config SIH evaluation

---

## 4. Database Schema (`supabase/migrations/20260927_init_ecofeast.sql`)

The database consists of 12 tables:
1. `profiles`: User accounts, organization metadata, and roles (`kitchen`, `fpu`, `ngo`, `admin`).
2. `kitchens`: Institutional kitchen facilities and geographical coordinates.
3. `fpus`: Food processing units and daily processing capacities.
4. `ngos`: Food banks, service areas, and daily intake quotas.
5. `surplus_listings`: Active surplus inventory, storage methods, and safety statuses.
6. `safety_checks`: HACCP temperature records, packaging seals, and inspector notes.
7. `matches`: Algorithmic match scores, distance, and recommendation reasons.
8. `pickups`: Transport logistics, driver dispatch records, and delivery timestamps.
9. `traceability_events`: Immutable audit timeline from kitchen kettle to plate.
10. `impact_metrics`: Cumulative kg rescued, meals supported, and avoided landfill CO₂e.
11. `notifications`: Real-time operational notifications and dispatch alerts.
12. `leaderboard`: Sustainability rankings sorted by verified food saved.

---

## 5. Food Safety & Smart Matching Rubric

### Digital HACCP Safety Thresholds
- **Hot-Hold:** Cooked food must remain strictly at **$>60^\circ\text{C}$**.
- **Cold-Hold:** Perishables and dairy must stay below **$<4^\circ\text{C}$**.
- **Danger Zone Rule:** Food held between $5^\circ\text{C}$ and $60^\circ\text{C}$ for $>2$ hours triggers an immediate warning; beyond $4$ hours, it is locked as **UNSAFE** and condemned.

### Transparent Multi-Factor Matching Algorithm
Total Score = 100 Points:
1. **Distance Factor (40 pts):** Prioritizes NGOs within 5–10 km to minimize transit time.
2. **Expiry Urgency Window (30 pts):** Batches expiring within 3 hours are prioritized.
3. **Storage Compatibility (20 pts):** Validates vehicle thermal containers against food requirements.
4. **Intake Capacity Quota (10 pts):** Ensures receiving NGO can distribute the batch volume without waste.

---

## 6. Environmental & Social Impact Formulas

Based on peer-reviewed UNEP and FAO food loss benchmarks:
- **Meals Supported:** $1.0\text{ kg Rescued Food} \approx 2.5\text{ Nutritious Meal Portions (400g)}$
- **Avoided Carbon Emissions:** $1.0\text{ kg Rescued Food} \approx 2.5\text{ kg }\text{CO}_2\text{e Avoided}$ (preventing anaerobic decomposition producing potent landfill methane).

---

## 7. Local Setup & Running

### Prerequisites
- Node.js 20+
- npm

### Installation
```bash
# Clone the repository and install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables (`.env`)
```ini
# Gemini API Key (Server-side AI Assistant)
GEMINI_API_KEY="your-gemini-api-key"

# Supabase PostgreSQL (Optional - local reactive store active by default)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### Start Development Server
```bash
npm run dev
# Server listening on http://0.0.0.0:3000
```

### Build for Production
```bash
npm run build
npm start
```

---

## 8. SIH Demonstration Quick-Logins

For judges and evaluators, EcoFeast includes one-click demo access directly on the `/login` screen:
- **Kitchen:** `kitchen@ecofeast.org` (Chef Rajesh Sharma - DTU Mega Mess)
- **NGO:** `ngo@ecofeast.org` (Vikramjit Singh - Robin Hood Army)
- **FPU:** `fpu@ecofeast.org` (Ananya Deshmukh - GreenHarvest Agro)
- **Admin:** `admin@ecofeast.org` (Dr. Priya Varma - Central Authority)

You can also switch active roles at any moment using the role-switcher dropdown in the top navigation bar.

---

## 9. Alignment with UN Sustainable Development Goals

- **SDG 2 (Zero Hunger):** Delivering nutritious surplus meals to shelter homes within hours.
- **SDG 12 (Responsible Consumption and Production):** Reducing institutional kitchen food loss.
- **SDG 13 (Climate Action):** Diverting organic matter from methane-emitting municipal landfills.
