// Supabase Configuration Check
export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    status: supabaseUrl && supabaseAnonKey ? "ready" : "missing",
  }
}

// Log configuration status (for debugging)
if (typeof window === "undefined") {
  const config = getSupabaseConfig()
  console.log("🔧 Supabase Configuration Status:", config.status)
  if (config.isConfigured) {
    console.log("✅ Supabase URL:", config.url?.substring(0, 30) + "...")
    console.log("✅ Supabase Anon Key:", config.anonKey?.substring(0, 20) + "...")
  } else {
    console.log("❌ Missing environment variables")
  }
}
