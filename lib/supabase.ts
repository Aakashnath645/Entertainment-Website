import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  isConfigured: true,
  projectId: supabaseUrl.split("//")[1]?.split(".")[0] || "unknown",
}

// Log successful configuration
console.log("✅ Supabase client initialized successfully")
console.log("🔗 Project ID:", supabaseConfig.projectId)
