import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// The environment variables are now available, so let's add better error handling and logging

// Get environment variables with better validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced validation with helpful error messages
if (!supabaseUrl) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your project settings.")
}

if (!supabaseAnonKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please add it to your project settings.")
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error("❌ Invalid NEXT_PUBLIC_SUPABASE_URL format:", supabaseUrl)
  throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format. Please check your Supabase project URL.")
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

// Log successful configuration (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("✅ Supabase environment variables loaded successfully")
  console.log("🔗 Supabase URL:", supabaseUrl.substring(0, 30) + "...")
  console.log("🔑 Anon Key:", supabaseAnonKey.substring(0, 20) + "...")
}
