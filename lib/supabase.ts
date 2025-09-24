import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwsqkirgxsxrpjepjhtr.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
    throw new Error('Missing Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente para operaciones del servidor (con service role key)
export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
)
