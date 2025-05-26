import { supabase } from "@/lib/supabase"

export async function initializeDatabase(forceRefresh = false) {
  try {
    console.log("🚀 Initializing database with sample data...")

    // First check if we can connect to Supabase and get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ Authentication required for database initialization")
      throw new Error("You must be signed in to initialize the database. Please sign in and try again.")
    }

    console.log("✅ User authenticated:", user.email)

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase.from("categories").select("count").limit(1)

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError.message)
      throw new Error(`Database connection failed: ${connectionError.message}`)
    }

    console.log("✅ Database connection successful")

    // Check if user profile exists, if not create it
    console.log("👤 Checking user profile...")
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected if user doesn't exist
      console.error("❌ Error checking user profile:", userCheckError.message)
      throw new Error(`Error checking user profile: ${userCheckError.message}`)
    }

    if (!existingUser) {
      console.log("👤 Creating user profile...")
      const { error: profileError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        username: user.email!.split("@")[0],
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || "Admin User",
        role: "admin",
      })

      if (profileError) {
        console.error("❌ Error creating user profile:", profileError.message)
        throw new Error(`Error creating user profile: ${profileError.message}`)
      }

      console.log("✅ User profile created")
    } else {
      console.log("✅ User profile already exists")

      // Update role to admin if not already
      const { error: updateError } = await supabase.from("users").update({ role: "admin" }).eq("id", user.id)

      if (updateError) {
        console.log("⚠️ Could not update user role to admin:", updateError.message)
      } else {
        console.log("✅ User role updated to admin")
      }
    }

    // Check if categories already exist
    const { data: existingCategories, error: checkError } = await supabase.from("categories").select("id, name")

    if (checkError) {
      console.error("❌ Error checking existing data:", checkError.message)
      throw new Error(`Error checking existing data: ${checkError.message}`)
    }

    console.log("Existing categories:", existingCategories?.length || 0)

    // Check for articles too
    const { data: existingArticles, error: articlesCheckError } = await supabase
      .from("articles")
      .select("id, title, status")

    console.log("Existing articles:", existingArticles?.length || 0)

    if (!forceRefresh && existingCategories && existingCategories.length >= 5) {
      console.log("✅ Database already initialized")
      return {
        success: true,
        message: `Database contains ${existingCategories.length} categories - ready for content`,
      }
    }

    // If forcing refresh or no data exists, proceed with initialization
    if (forceRefresh) {
      console.log("🔄 Force refresh requested, reinitializing data...")
    }

    // Check if categories need to be created (they might already exist from schema)
    if (!existingCategories || existingCategories.length < 5) {
      console.log("📝 Creating/updating categories...")
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .upsert(
          [
            {
              name: "Gaming",
              slug: "gaming",
              description: "Latest gaming news and reviews",
              color: "#00d4ff",
            },
            {
              name: "Movies",
              slug: "movies",
              description: "Movie reviews and entertainment news",
              color: "#b347d9",
            },
            {
              name: "TV Shows",
              slug: "tv-shows",
              description: "Television series reviews and updates",
              color: "#39ff14",
            },
            {
              name: "Tech",
              slug: "tech",
              description: "Technology reviews and news",
              color: "#ff6b35",
            },
            {
              name: "Esports",
              slug: "esports",
              description: "Competitive gaming and esports coverage",
              color: "#ff0080",
            },
          ],
          {
            onConflict: "slug",
          },
        )
        .select()

      if (categoriesError) {
        console.error("❌ Error creating categories:", categoriesError.message)
        throw new Error(`Error creating categories: ${categoriesError.message}`)
      }

      console.log("✅ Categories created/updated successfully")
    }

    // Get categories for article creation
    const { data: categories, error: getCategoriesError } = await supabase.from("categories").select("*")

    if (getCategoriesError || !categories) {
      throw new Error("Failed to fetch categories for article creation")
    }

    // Only create articles if we don't have enough or if forcing refresh
    if (!existingArticles || existingArticles.length < 3 || forceRefresh) {
      console.log("📰 Creating sample articles...")
      const gamingCategory = categories.find((cat) => cat.slug === "gaming")
      const moviesCategory = categories.find((cat) => cat.slug === "movies")
      const techCategory = categories.find((cat) => cat.slug === "tech")

      if (gamingCategory && moviesCategory && techCategory) {
        // Delete existing articles if force refresh
        if (forceRefresh && existingArticles && existingArticles.length > 0) {
          console.log("🗑️ Removing existing articles for refresh...")
          await supabase.from("articles").delete().eq("author_id", user.id)
        }

        console.log("✅ Categories setup complete - ready for content creation")
      }
    }

    console.log("🎉 Database initialization complete!")
    return {
      success: true,
      message: "Database initialized successfully with categories!",
    }
  } catch (error: any) {
    console.error("❌ Database initialization failed:", error)
    return {
      success: false,
      message: error.message || "Unknown error occurred during initialization",
    }
  }
}
