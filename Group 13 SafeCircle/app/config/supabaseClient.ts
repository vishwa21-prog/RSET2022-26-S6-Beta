import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fonrqeuvxuagwksrqsez.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbnJxZXV2eHVhZ3drc3Jxc2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDY2MDQsImV4cCI6MjA1OTE4MjYwNH0.qtVQxXZyZD_WatErpmyW0UqyhnuNNtDRCeoGEvTojX0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);