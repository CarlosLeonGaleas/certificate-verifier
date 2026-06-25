import { createClient } from '@supabase/supabase-js';
import { Config } from '@certificate-verifier/core';

export const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_SECRET_KEY);
