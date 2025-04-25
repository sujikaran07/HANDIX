import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fazsfknoucqhjhkqrvrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenNma25vdWNxaGpoa3FydnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTkyNDUsImV4cCI6MjA2MTE3NTI0NX0.7V54pl3NCXygp0QCL8I90ql3SyEvXlzRW45STDfracI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)