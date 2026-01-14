// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for now to debug
const supabaseUrl = 'https://isqsdfqglmmxndztcgbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcXNkZnFnbG1teG5kenRjZ2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTA1NDIsImV4cCI6MjA4MzM4NjU0Mn0.UTF5oOYJDbEYq3BjgZ_EvBzTnLFa1k_QbZVwPoHVp8A';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);