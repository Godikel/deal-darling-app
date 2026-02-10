import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = "https://oddjcbgcedivoaavwtpf.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZGpjYmdjZWRpdm9hYXZ3dHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc4MTIsImV4cCI6MjA4NDg0MzgxMn0.B4jbZ0aLJbUCqmAdQxowW306-2gs3VTKVKwdbICrr2Y";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
