// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gezrpaubecdueuewdltq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlenJwYXViZWNkdWV1ZXdkbHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Njg4OTgsImV4cCI6MjA2NTM0NDg5OH0.lqiNw_hCw2I0AxH_V8x1OUcgS5o-TOl5M9__8xCnabY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);