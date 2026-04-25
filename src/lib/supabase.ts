// Migration: Supabase replaced with PHP Bridge for Hostinger MySQL
// All files importing { supabase } from '@/lib/supabase' automatically use phpBridge
import { phpBridge } from './php-bridge'

export const supabase = phpBridge
