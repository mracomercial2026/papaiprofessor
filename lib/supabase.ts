import { createClient } from "@supabase/supabase-js";

// Fallbacks evitam erro de validação durante o build estático.
// Em produção as env vars reais serão usadas.
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || "https://placeholder.supabase.co";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Cliente singleton — reutilizado em todo o app
export const supabase = createClient(supabaseUrl, supabaseAnon);

// Tipos do banco de dados
export type Profile = {
  id: string;
  name: string;
  xp: number;
  grade_level: string;
  created_at: string;
};
