import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // The app can still compile; add values to .env.local before using auth/database.
  console.warn("Supabase environment variables are missing.");
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder"
);
