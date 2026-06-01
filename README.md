# Ana's Fig - Web App

A single-page application for discovering and sharing Mediterranean fig trees.

## Features

- 🌿 Interactive map with OpenStreetMap
- 📍 Add fig tree locations with notes
- 💾 User name stored in localStorage
- 🗄️ Real-time database with Supabase
- 🎨 Rustic Mediterranean design

## Setup Instructions

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API to get your credentials
4. Create the `figs` table with this SQL:

```sql
create table figs (
  id uuid default gen_random_uuid() primary key,
  lat float8 not null,
  lng float8 not null,
  name text not null,
  note text,
  added_by text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table figs enable row level security;

-- Create policy to allow public read access
create policy "Enable read access for all users" on figs
  for select using (true);

-- Create policy to allow public insert access
create policy "Enable insert access for all users" on figs
  for insert with check (true);
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Netlify

### Option 1: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site Settings > Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy!

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── WelcomeModal.tsx      # User name prompt
│   │   ├── AddFigModal.tsx       # Add fig form
│   │   ├── FigDetailsModal.tsx   # Fig details popup
│   │   └── Map.tsx               # Leaflet map component
│   ├── App.tsx                   # Main app component
│   ├── App.css                   # Styles
│   ├── supabase.ts              # Supabase client
│   ├── types.ts                 # TypeScript types
│   └── theme.ts                 # Design tokens
├── public/
│   ├── icons/                    # UI SVGs and favicon
│   └── illustrations/            # Large decorative assets
├── netlify.toml                 # Netlify config
└── package.json
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Map**: Leaflet + React-Leaflet
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Styling**: CSS with custom rustic theme

## Design System

- **Colors**: Mediterranean palette (terracotta, olive, fig purple, cream)
- **Typography**: Caveat (headings), Inter (body)
- **Style**: Rustic, hand-drawn, warm aesthetic

## License

Personal project - created as a gift for Ana
