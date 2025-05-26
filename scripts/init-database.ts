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

    if (
      !forceRefresh &&
      existingCategories &&
      existingCategories.length >= 5 &&
      existingArticles &&
      existingArticles.length > 0
    ) {
      console.log("✅ Database already initialized")
      return {
        success: true,
        message: `Database already contains ${existingCategories.length} categories and ${existingArticles.length} articles`,
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

        const articlesToCreate = [
          {
            title: "The Future of Gaming: Next-Gen Consoles Deep Dive",
            slug: "future-gaming-next-gen-consoles-deep-dive",
            excerpt:
              "An comprehensive analysis of the latest gaming consoles and what they mean for the future of interactive entertainment. From ray tracing to 120fps gaming, we explore it all.",
            content: `# The Future of Gaming: Next-Gen Consoles Deep Dive

The gaming industry has reached another pivotal moment with the release of next-generation consoles. These powerful machines are not just incremental upgrades—they represent a fundamental shift in how we experience interactive entertainment.

## Revolutionary Hardware

The new consoles feature custom AMD processors that deliver unprecedented performance. With support for ray tracing, 4K gaming at 120fps, and lightning-fast SSD storage, these systems are pushing the boundaries of what's possible.

## Game-Changing Features

- **Ray Tracing**: Realistic lighting and reflections
- **3D Audio**: Immersive spatial sound design  
- **Haptic Feedback**: Next-level controller vibration
- **Quick Resume**: Instant switching between games

## The Developer Perspective

Game developers are excited about the creative possibilities these new systems unlock. From massive open worlds to photorealistic graphics, the future of gaming looks incredibly bright.

## Conclusion

As we move forward, these consoles will define gaming for the next decade. The question isn't whether to upgrade—it's which platform will best serve your gaming needs.`,
            featured_image_url: "/placeholder.svg?height=400&width=800",
            category_id: gamingCategory.id,
            tags: ["gaming", "consoles", "hardware", "review"],
            author_id: user.id,
            status: "published",
            publish_date: new Date().toISOString(),
            view_count: 1250,
          },
          {
            title: "Blockbuster Season: Must-Watch Movies This Summer",
            slug: "blockbuster-season-must-watch-movies-summer",
            excerpt:
              "Your complete guide to the most anticipated movies hitting theaters this summer. From superhero spectacles to indie darlings, here's what you can't miss.",
            content: `# Blockbuster Season: Must-Watch Movies This Summer

Summer movie season is upon us, and this year's lineup is absolutely stacked with incredible films across every genre. Whether you're a fan of action-packed blockbusters or intimate character studies, there's something for everyone.

## The Big Budget Spectacles

This summer brings us several highly anticipated sequels and franchise entries that promise to deliver stunning visuals and heart-pounding action sequences.

## Hidden Gems

Don't overlook the smaller films that often become the season's biggest surprises. These indie darlings offer unique perspectives and innovative storytelling.

## What to Expect

- **Visual Effects**: Cutting-edge CGI and practical effects
- **Star Power**: A-list actors in career-defining roles
- **Diverse Stories**: Films from around the world
- **Technical Innovation**: New filming techniques and technologies

## Our Recommendations

We've compiled a list of the absolute must-see films that will define this summer's cinema landscape.`,
            featured_image_url: "/placeholder.svg?height=400&width=800",
            category_id: moviesCategory.id,
            tags: ["movies", "summer", "blockbuster", "cinema"],
            author_id: user.id,
            status: "published",
            publish_date: new Date().toISOString(),
            view_count: 2100,
          },
          {
            title: "AI Revolution: How Machine Learning is Transforming Tech",
            slug: "ai-revolution-machine-learning-transforming-tech",
            excerpt:
              "Artificial intelligence is no longer science fiction—it's reshaping every aspect of technology. Discover how AI is changing the world around us.",
            content: `# AI Revolution: How Machine Learning is Transforming Tech

Artificial intelligence has moved from the realm of science fiction into our daily lives. From the smartphones in our pockets to the cars we drive, AI is quietly revolutionizing technology in ways both subtle and profound.

## The Current Landscape

Today's AI systems can recognize faces, translate languages in real-time, and even create art. But this is just the beginning of what's possible.

## Key Applications

- **Healthcare**: AI-powered diagnostics and treatment
- **Transportation**: Autonomous vehicles and traffic optimization
- **Entertainment**: Personalized content recommendations
- **Business**: Automated decision-making and analytics

## Looking Forward

As AI continues to evolve, we can expect even more dramatic changes in how we interact with technology and each other.

## The Human Element

Despite all the technological advancement, the human element remains crucial in guiding AI development responsibly.`,
            featured_image_url: "/placeholder.svg?height=400&width=800",
            category_id: techCategory.id,
            tags: ["ai", "technology", "machine-learning", "innovation"],
            author_id: user.id,
            status: "published",
            publish_date: new Date().toISOString(),
            view_count: 1890,
          },
        ]

        // Insert articles one by one to get better error handling
        for (const article of articlesToCreate) {
          const { error: articleError } = await supabase.from("articles").insert(article)

          if (articleError) {
            console.error(`❌ Error creating article "${article.title}":`, articleError.message)
            throw new Error(`Error creating article "${article.title}": ${articleError.message}`)
          }
        }

        console.log("✅ Sample articles created successfully")
      }
    }

    console.log("🎉 Database initialization complete!")
    return {
      success: true,
      message: "Database initialized successfully with sample categories and articles!",
    }
  } catch (error: any) {
    console.error("❌ Database initialization failed:", error)
    return {
      success: false,
      message: error.message || "Unknown error occurred during initialization",
    }
  }
}
