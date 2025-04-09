import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const SUPABASE_URL = "https://qpedcspyudeptjfwuwhl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZWRjc3B5dWRlcHRqZnd1d2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MzMyNDIsImV4cCI6MjA1NjMwOTI0Mn0._M89M93iD2Dayi1DKq3NB3xt7sGWHh5KTS2VEh75SKA";

// ✅ Fix: Enable session persistence to keep users logged in
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,  // Keeps users logged in
    autoRefreshToken: true, // Automatically refreshes tokens
    detectSessionInUrl: true, // Ensures login works correctly
  },
});

// ✅ Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event, session);
});
