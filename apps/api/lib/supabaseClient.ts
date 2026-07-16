import { createClient } from '@supabase/supabase-js';
import { Config } from '../../../packages/core';

export const supabase = createClient(Config.SUPABASE_URL, Config.SUPABASE_SECRET_KEY);
