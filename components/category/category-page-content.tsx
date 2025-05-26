"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Eye, Grid, List } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories?: Database["public"]["Tables"]["categories"]["Row"]
  users?: Database["public"]["Tables"]["users"]["Row"]
}

type Category = Database["public"]["Tables"]["categories"]["Row"]

interface CategoryPageContentProps {
  categorySlug: string
}

export function CategoryPageContent({ categorySlug }: CategoryPageContentProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", categorySlug)
          .single()

        if (categoryError || !categoryData) {
          console.log("Category not found, using demo data")
          setCategory(getDemoCategory(categorySlug))
          setArticles(getDemoArticles(categorySlug))
          setLoading(false)
          return
        }

        setCategory(categoryData)

        // Fetch articles for this category
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .eq("category_id", categoryData.id)
          .eq("status", "published")
          .order("publish_date", { ascending: false })

        if (articlesError || !articlesData) {
          setArticles(getDemoArticles(categorySlug))
          setLoading(false)
          return
        }

        // Fetch users for these articles
        const authorIds = [...new Set(articlesData.map((article) => article.author_id))]
        const { data: users } = await supabase.from("users").select("*").in("id", authorIds)

        // Combine articles with user data
        const articlesWithUsers = articlesData.map((article) => ({
          ...article,
          categories: categoryData,
          users: users?.find((user) => user.id === article.author_id),
        }))

        setArticles(articlesWithUsers)
      } catch (error) {
        console.log("Error fetching category data:", error)
        setCategory(getDemoCategory(categorySlug))
        setArticles(getDemoArticles(categorySlug))
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [categorySlug])

  useEffect(() => {
    let filtered = [...articles]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.publish_date || b.created_at).getTime() - new Date(a.publish_date || a.created_at).getTime(),
        )
        break
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.publish_date || a.created_at).getTime() - new Date(b.publish_date || b.created_at).getTime(),
        )
        break
      case "popular":
        filtered.sort((a, b) => b.view_count - a.view_count)
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredArticles(filtered)
  }, [articles, searchQuery, sortBy])

  function getDemoCategory(slug: string): Category {
    const categories: Record<string, Category> = {
      gaming: {
        id: "demo-gaming",
        name: "Gaming",
        slug: "gaming",
        description: "Latest gaming news, reviews, and industry updates",
        color: "#00d4ff",
        created_at: new Date().toISOString(),
      },
      movies: {
        id: "demo-movies",
        name: "Movies",
        slug: "movies",
        description: "Movie reviews, trailers, and entertainment news",
        color: "#b347d9",
        created_at: new Date().toISOString(),
      },
      "tv-shows": {
        id: "demo-tv",
        name: "TV Shows",
        slug: "tv-shows",
        description: "TV series reviews, episode guides, and show news",
        color: "#39ff14",
        created_at: new Date().toISOString(),
      },
      tech: {
        id: "demo-tech",
        name: "Tech",
        slug: "tech",
        description: "Technology reviews, gadget news, and tech updates",
        color: "#ff6b35",
        created_at: new Date().toISOString(),
      },
      esports: {
        id: "demo-esports",
        name: "Esports",
        slug: "esports",
        description: "Competitive gaming news and tournament coverage",
        color: "#ff0080",
        created_at: new Date().toISOString(),
      },
    }
    return categories[slug] || categories.gaming
  }

  function getDemoArticles(categorySlug: string): Article[] {
    const baseArticles = [
      {
        id: "demo-1",
        title: "Breaking: Major Industry Announcement Shakes Up the Scene",
        slug: "major-industry-announcement",
        excerpt: "Industry leaders reveal groundbreaking changes that will reshape the landscape for years to come.",
        content: "",
        featured_image_url: "/placeholder.svg?height=400&width=600",
        category_id: "demo-category",
        tags: ["breaking", "industry", "news"],
        author_id: "demo-author",
        status: "published" as const,
        publish_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 2500,
        seo_meta: null,
      },
      {
        id: "demo-2",
        title: "In-Depth Review: The Latest Must-Have Experience",
        slug: "latest-must-have-review",
        excerpt: "Our comprehensive review covers everything you need to know about this highly anticipated release.",
        content: "",
        featured_image_url: "/placeholder.svg?height=400&width=600",
        category_id: "demo-category",
        tags: ["review", "analysis", "recommendation"],
        author_id: "demo-author",
        status: "published" as const,
        publish_date: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        view_count: 1800,
        seo_meta: null,
      },
      {
        id: "demo-3",
        title: "Upcoming Releases: What to Expect This Season",
        slug: "upcoming-releases-season",
        excerpt: "A comprehensive guide to the most anticipated releases coming your way in the next few months.",
        content: "",
        featured_image_url: "/placeholder.svg?height=400&width=600",
        category_id: "demo-category",
        tags: ["upcoming", "preview", "guide"],
        author_id: "demo-author",
        status: "published" as const,
        publish_date: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        view_count: 1200,
        seo_meta: null,
      },
    ]

    const category = getDemoCategory(categorySlug)
    return baseArticles.map((article) => ({
      ...article,
      categories: category,
      users: {
        id: "demo-author",
        email: "demo@example.com",
        username: "reviewer",
        display_name: "Demo Reviewer",
        avatar_url: "/placeholder.svg?height=40&width=40",
        bio: "Professional reviewer and industry expert",
        role: "writer" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 skeleton rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground">The requested category could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-2 h-16 rounded-full" style={{ backgroundColor: category.color }} />
          <h1 className="text-4xl font-bold neon-text">{category.name}</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
        <div className="text-sm text-muted-foreground">
          {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Articles Grid/List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-4">No Articles Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms." : "No articles available in this category yet."}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}

function ArticleCard({ article, viewMode }: { article: Article; viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card className="group glow-effect overflow-hidden">
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            {article.featured_image_url ? (
              <Image
                src={article.featured_image_url || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl opacity-50">📰</span>
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="secondary" style={{ backgroundColor: article.categories?.color || "#666" }}>
                {article.categories?.name || "General"}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{article.view_count}</span>
              </div>
            </div>
            <Link href={`/articles/${article.slug}`}>
              <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
                {article.title}
              </h3>
            </Link>
            <p className="text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{article.users?.display_name || article.users?.username || "Anonymous"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(article.publish_date || article.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group glow-effect overflow-hidden">
      <div className="relative h-48">
        {article.featured_image_url ? (
          <Image
            src={article.featured_image_url || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">📰</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" style={{ backgroundColor: article.categories?.color || "#666" }}>
            {article.categories?.name || "General"}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 text-xs text-white bg-black/50 rounded px-2 py-1">
            <Eye className="w-3 h-3" />
            <span>{article.view_count}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <Link href={`/articles/${article.slug}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
            {article.title}
          </h3>
        </Link>
        <p className="text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{article.users?.display_name || article.users?.username || "Anonymous"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(article.publish_date || article.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
