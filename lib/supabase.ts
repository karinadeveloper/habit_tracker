import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

const isWeb = Platform.OS === 'web';
const isBrowser = isWeb && typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {  auth: {
    storage: isWeb ? (isBrowser ? window.localStorage : undefined) : AsyncStorage,
    autoRefreshToken: true,
    persistSession: isWeb ? isBrowser : true,
    detectSessionInUrl: false,
  },
});