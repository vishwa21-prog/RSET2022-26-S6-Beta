import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'GIVE_YOUR_URL'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey)

export async function translateMessage(message: string, sourceLang: string, targetLang: string) {
  // Implement your translation logic here
  // You can use services like Google Translate API
  return message; // Return translated text
}