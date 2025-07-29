import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// These should ideally come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xypctjazaibnuhflwecd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cGN0amF6YWlibnVoZmx3ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgyNzIsImV4cCI6MjA1ODYwNDI3Mn0.fDHa8anE1m0My5lwcLMSYkOFX93Wrc7bOrZqTYPzkas';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase URL or Anon Key is not properly configured. Please set environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
