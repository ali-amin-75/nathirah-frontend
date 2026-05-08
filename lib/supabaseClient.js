// lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// أدخل URL و API Key من لوحة التحكم في Supabase
const SUPABASE_URL = 'https://nxwjcuuwhuadnjoidyuv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xxOuMWx7Y9lMUjFMDIcJ6Q_7qWcF04Q'; 

// إنشاء العميل
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;