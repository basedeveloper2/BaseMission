import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// Only attempt to load the local development env file if we are NOT in production (Vercel)
if (process.env.NODE_ENV !== 'production') {
    try {
      dotenv.config({ path: path.resolve(process.cwd(), "..", "src", "services", ".env") });
    } catch (e) {
      // Ignore errors loading local env file in production
    }
  }
}
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Missing Supabase credentials in environment variables");
}

let supabaseClient: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  }
  return supabaseClient;
}
export async function checkSupabase(): Promise<boolean> {
  const s = getSupabase();
  if (!s) return false;
  const { error } = await s.from("users").select("id").limit(1);
  return !error;
}
