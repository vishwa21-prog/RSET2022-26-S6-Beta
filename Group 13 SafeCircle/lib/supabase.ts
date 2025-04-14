import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yjwxynvqasqctzvnsynj.supabase.co";
const supabaseAnonKey =
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqd3h5bnZxYXNxY3R6dm5zeW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MzY3MTcsImV4cCI6MjA1ODAxMjcxN30.8Wxv6gzZZSRAqHzZEaxyrDayf6cAArTqoE9K2-FutFE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})