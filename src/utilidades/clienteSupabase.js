// src/utilidades/clienteSupabase.js
import { createClient } from '@supabase/supabase-js';

// Extraemos las variables de entorno de Vite (.env.local)
const urlSupabase = import.meta.env.VITE_SUPABASE_URL;
const claveAnonSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de seguridad por si olvidaste configurar el archivo .env.local
if (!urlSupabase || !claveAnonSupabase) {
  console.error("⚠️ Error: Faltan las variables de entorno de Supabase en el archivo .env.local");
}

// Inicializamos el cliente oficial de Supabase
export const supabase = createClient(urlSupabase, claveAnonSupabase);