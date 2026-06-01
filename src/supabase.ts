import { createClient } from '@supabase/supabase-js';

// These will need to be configured in Netlify environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema:
// Table: figs
// - id (uuid, primary key)
// - lat (float8)
// - lng (float8)
// - name (text)
// - note (text)
// - added_by (text)
// - created_at (timestamptz)
