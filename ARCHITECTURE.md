# Architecture Overview - Ana's Fig Web App

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    React Application                    │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ WelcomeModal │  │ AddFigModal  │  │ FigDetails  │ │ │
│  │  │  Component   │  │  Component   │  │  Modal      │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │          Map Component (Leaflet)                 │ │ │
│  │  │  ┌────────┐  ┌────────┐  ┌────────┐            │ │ │
│  │  │  │ Fig    │  │ Fig    │  │ Fig    │            │ │ │
│  │  │  │ Marker │  │ Marker │  │ Marker │  ...       │ │ │
│  │  │  └────────┘  └────────┘  └────────┘            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              App State Management                 │ │ │
│  │  │  - User info (localStorage)                      │ │ │
│  │  │  - Figs list (Supabase)                         │ │ │
│  │  │  - UI state (modals, pin mode)                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────── │ │
└──────────────────────────────────────────────────────────── ┘
                            │
                            │ Supabase Client SDK
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                        │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Table: figs                                     │ │ │
│  │  │  ├─ id (uuid)                                    │ │ │
│  │  │  ├─ lat (float8)                                 │ │ │
│  │  │  ├─ lng (float8)                                 │ │ │
│  │  │  ├─ name (text)                                  │ │ │
│  │  │  ├─ note (text)                                  │ │ │
│  │  │  ├─ added_by (text)                              │ │ │
│  │  │  └─ created_at (timestamptz)                     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  Row Level Security (RLS):                             │ │
│  │  ✓ Anyone can SELECT (read)                            │ │
│  │  ✓ Anyone can INSERT (write)                           │ │
│  └─────────────────────────────────────────────────────── │ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Realtime Subscriptions                     │ │
│  │  (WebSocket connection for live updates)               │ │
│  └─────────────────────────────────────────────────────── │ │
└──────────────────────────────────────────────────────────── ┘
                            │
                            │ API + Realtime
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NETLIFY (Hosting)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Static Site Hosting                        │ │
│  │  - HTML, CSS, JS bundles                               │ │
│  │  - Global CDN distribution                             │ │
│  │  - Automatic HTTPS                                     │ │
│  │  - SPA routing (redirects to index.html)              │ │
│  └─────────────────────────────────────────────────────── │ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Environment Variables                      │ │
│  │  - VITE_SUPABASE_URL                                   │ │
│  │  - VITE_SUPABASE_ANON_KEY                              │ │
│  └─────────────────────────────────────────────────────── │ │
└──────────────────────────────────────────────────────────── ┘
```

## Data Flow

### 1. User Opens App

```
Browser → Load HTML/CSS/JS from Netlify CDN
       → React App initializes
       → Check localStorage for user name
       → If no name: Show WelcomeModal
       → If has name: Show Map
```

### 2. Load Figs

```
React App → Supabase Client → SELECT * FROM figs
                            ← Returns fig data
          → Map Component renders fig markers
          → Subscribe to realtime updates
```

### 3. Add New Fig

```
User clicks "Add a Fig" button
  → Enter pin placement mode
  → Click map location
  → AddFigModal opens with coordinates
  → User fills form (name, note)
  → Click Save
    → Supabase Client → INSERT INTO figs
                      ← Success response
    → Modal closes
    → Realtime subscription triggers
      → All connected users see new fig instantly
```

### 4. View Fig Details

```
User clicks fig marker
  → Map component receives click event
  → FigDetailsModal opens
  → Display fig data (name, note, added_by, date)
```

## Component Hierarchy

```
App
├── WelcomeModal (conditional: !user)
├── InfoBanner (conditional: user)
│   ├── App Title
│   └── User Greeting
├── Map
│   ├── MapContainer (Leaflet)
│   │   ├── TileLayer (OpenStreetMap)
│   │   ├── MapEventHandler
│   │   └── Markers (for each fig)
│   │       └── Popup
│   └── Crosshair (conditional: isPinMode)
├── AddFigButton (conditional: user && !isPinMode)
├── CancelPinButton (conditional: isPinMode)
├── AddFigModal (conditional: selectedPosition)
└── FigDetailsModal (conditional: selectedFig)
```

## State Management

### Local State (React useState)

```typescript
// App.tsx
const [user, setUser] = useState<User | null>(null);
const [figs, setFigs] = useState<FigLocation[]>([]);
const [loading, setLoading] = useState(true);
const [isPinMode, setIsPinMode] = useState(false);
const [selectedPosition, setSelectedPosition] = useState<{lat, lng} | null>(null);
const [selectedFig, setSelectedFig] = useState<FigLocation | null>(null);
```

### Persistent State (localStorage)

```typescript
// Key: 'anasfig_user'
interface User {
  name: string;
  joinedAt: string;
}
```

### Server State (Supabase)

```typescript
// Table: figs
interface FigLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  note: string;
  addedBy: string;
  createdAt: string;
}
```

## API Communication

### Supabase Client Methods

```typescript
// Read all figs
const { data, error } = await supabase
  .from('figs')
  .select('*')
  .order('created_at', { ascending: false });

// Create new fig
const { data, error } = await supabase
  .from('figs')
  .insert([{
    lat: 38.0,
    lng: 23.0,
    name: 'My Fig Tree',
    note: 'Found in my garden',
    added_by: 'John'
  }]);

// Subscribe to realtime updates
supabase
  .channel('figs_channel')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'figs' },
    (payload) => {
      // Reload figs when database changes
      loadFigs();
    }
  )
  .subscribe();
```

## Build & Deploy Pipeline

```
Developer Machine
  │
  ├─ Edit source code in web/src/
  ├─ npm run dev (test locally)
  └─ npm run build (production build)
       │
       └─ Vite build process
            ├─ TypeScript compilation
            ├─ React JSX transform
            ├─ CSS bundling
            ├─ Asset optimization
            └─ Output to web/dist/
                 │
                 ├─ index.html
                 ├─ assets/index-[hash].js (154 KB gzipped)
                 └─ assets/index-[hash].css (5 KB)
                      │
                      └─ Upload to Netlify
                           ├─ Deploy to global CDN
                           ├─ Configure environment variables
                           └─ Enable SPA routing
                                │
                                └─ Live at https://your-site.netlify.app
```

## Security Model

### Row Level Security (RLS)

```sql
-- Table: figs

Policy 1: "Anyone can view figs"
  FOR SELECT
  USING (true)
  → All users can read all figs

Policy 2: "Anyone can add figs"
  FOR INSERT
  WITH CHECK (true)
  → All users can insert new figs

No UPDATE policy → Users cannot edit figs
No DELETE policy → Users cannot delete figs
```

### Environment Variables

```
Production (Netlify):
  VITE_SUPABASE_URL=https://project.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ... (public key, safe to expose)

Local Development (.env):
  Same variables
  File is gitignored for security
```

### Security Notes

- **No authentication required** (by design for simplicity)
- **Anon key is safe to expose** (Supabase designed for client-side use)
- **RLS enforces permissions** (can't escalate beyond read/insert)
- **HTTPS enforced** by Netlify (encryption in transit)
- **No sensitive data** collected (just names and fig locations)

## Performance Optimizations

### Bundle Size

```
Total: 523 KB uncompressed
       154 KB gzipped

Breakdown:
- React + ReactDOM: ~130 KB
- Leaflet: ~400 KB (largest dependency)
- Supabase client: ~50 KB
- App code: ~20 KB
```

### Loading Strategy

1. HTML loads instantly (< 1 KB)
2. CSS loads and applies (< 5 KB)
3. JS bundle loads (154 KB gzipped)
4. React initializes
5. Check localStorage (instant)
6. Load figs from Supabase (~1-2s depending on data)
7. Map tiles load progressively (from OpenStreetMap CDN)

### Potential Optimizations (Future)

- Code-split Leaflet (dynamic import)
- Lazy load modals
- Service worker for offline support
- Image optimization (SVGs already optimized)
- Preload critical resources

## Technology Choices Rationale

### Why React?
- Component-based architecture
- Large ecosystem
- TypeScript support
- Fast development

### Why Vite?
- Fastest build tool (5x faster than Webpack)
- Modern, optimized for React
- Great dev experience (hot reload)
- Small bundle size

### Why Leaflet?
- Best open-source map library
- OpenStreetMap support
- Custom marker support
- Lightweight compared to Google Maps

### Why Supabase?
- PostgreSQL (robust, SQL)
- Real-time out of the box
- Free tier (generous)
- Simple client SDK
- No server code needed

### Why Netlify?
- Free tier for SPAs
- Automatic HTTPS
- Global CDN
- Easy deployments
- Environment variable support
- Perfect for static sites

## Scalability Considerations

### Current Capacity

- **Supabase Free Tier**: 500 MB storage, unlimited API requests
- **Estimated**: Can handle ~500,000 fig entries
- **Netlify Free Tier**: 100 GB bandwidth/month
- **Estimated**: ~650,000 page loads/month

### If App Grows

- Upgrade Supabase to Pro ($25/month) → 8 GB storage
- Upgrade Netlify to Pro ($19/month) → 1 TB bandwidth
- Add caching layer (Cloudflare)
- Implement pagination for figs (load only visible area)
- Add clustering (group nearby figs)

## Monitoring & Analytics

### Recommended Setup

1. **Netlify Analytics** ($9/month)
   - Page views
   - Unique visitors
   - Top pages

2. **Supabase Dashboard** (Free)
   - Database size
   - API requests
   - Active connections
   - Query performance

3. **Browser Console** (Development)
   - React DevTools
   - Network tab (load times)
   - Console errors

### Key Metrics to Track

- Total figs added
- Daily active users
- Average figs per user
- Map interactions
- Modal conversion rates
- Error rates

---

## Summary

This is a **modern, serverless architecture** using best-in-class free-tier services:

- **Frontend**: React (component-based UI)
- **Build**: Vite (fast, optimized)
- **Map**: Leaflet (open-source, customizable)
- **Database**: Supabase (PostgreSQL + real-time)
- **Hosting**: Netlify (CDN + CI/CD)

**Total Monthly Cost**: $0 (free tier sufficient for MVP)
**Scalability**: Easily scales to thousands of users
**Maintenance**: Minimal (serverless)

🌿 Perfect for Ana's Fig! 🌿
