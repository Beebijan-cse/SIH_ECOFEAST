# EcoFeast 🍃

**Save food. Connect communities. Create impact.**

EcoFeast is a Smart India Hackathon prototype exploring how institutional kitchens can connect surplus food with NGOs and food processing units. It demonstrates a possible workflow for listing surplus food, recording safety checks, finding recipients, and coordinating pickups.

## Features

- Separate workspaces for kitchens, food processing units (FPUs), NGOs, and administrators
- Surplus food listings and food safety checks
- Sample matching, pickup coordination, and traceability workflows
- Optional Gemini-powered assistant
- Supabase authentication and database integration
- Clearly labelled local demo accounts when Supabase is not configured

## Technology

React · TypeScript · Vite · Tailwind CSS · Node.js · Express · Supabase · Google Gemini

Try the hosted prototype: [EcoFeast demo](https://eco-feast-smart-food-waste-reductio.vercel.app).

## Run locally

You need Node.js and npm.

```bash
git clone https://github.com/Beebijan-cse/SIH_ECOFEAST.git
cd SIH_ECOFEAST
npm install
```

For a connected Supabase project, copy `.env.example` to `.env.local` and fill in the project URL and public anon key. Add a Gemini API key only if you want to use the AI assistant. Keep secret keys out of browser code and never put a Supabase service-role key in a `VITE_` variable.

Start the app:

```bash
npm run dev
```

Create a production build with `npm run build`.

## Authentication and roles

- With Supabase configured, users sign in with their email and password. Public registration supports kitchen, FPU, and NGO accounts.
- Admin accounts must be provisioned through a trusted administrative process. Public registration and user-editable profile data cannot grant admin access.
- Without Supabase, the sign-in screen offers sample demo accounts. Demo data is stored locally in the browser and is for exploration only; it is not real authentication.
- Role switching is available only in local demo mode.

### Apply the database security migration

The migration `supabase/migrations/20261110_harden_profile_roles.sql` adds database rules that reject attempts by an authenticated user to create an admin profile or change their own role. Apply the migrations in `supabase/migrations/` to your Supabase project using your normal Supabase migration workflow before relying on these database protections. Updating the app code alone does not apply a migration to the hosted database.

Use only the public Supabase anon/publishable key in the frontend. Never expose a service-role key.

## Project status

EcoFeast is an educational hackathon prototype. Demo data is temporary, and the project has not been presented as a production-ready food-safety, identity, or logistics service. Review the Supabase row-level security policies for all application tables before using real organization or personal data.

## Author

**Beebijan-cse** · [GitHub profile](https://github.com/Beebijan-cse)
