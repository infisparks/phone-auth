import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://supabasekong-z8owk0gw48oowssoo8scckk8.194.164.148.53.sslip.io'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY1OTgwMCwiZXhwIjo0OTIyMzMzNDAwLCJyb2xlIjoiYW5vbiJ9.EeaxAv1Uf0mKWY3T2rpApQ36kb-sEzKxIR5N99W3OSs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
