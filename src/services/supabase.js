// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database tables structure
export const tables = {
  students: 'students',
  teachers: 'teachers',
  classes: 'classes',
  subjects: 'subjects',
  results: 'results',
  admissions: 'admissions',
  users: 'users'
};