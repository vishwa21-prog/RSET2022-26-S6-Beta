import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://esgsrptrqrimjvlodjlt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZ3NycHRycXJpbWp2bG9kamx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDEwMjksImV4cCI6MjA1Njc3NzAyOX0.tinMsMNnwXZcDx7O1EMWNjvfyep4Fj5qPcWw0bw1yuo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);