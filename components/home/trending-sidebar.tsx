"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories?: Database["public"]["Tables"]["categories"]["Row"]
  users?: Database["public"]["Tables"]["users"]["Row"]
}

export function TrendingSidebar() {
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrendingArticles() {
      try {
        // First, try to fetch articles with relationships
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("view_count", { ascending: false })
          .limit(5)

        if (articlesError) {
          console.log("Database not set up yet, showing placeholder content")
          setTrendingArticles(getDemoTrendingArticles())
          setLoading(false)
          return
        }

        if (!articlesData || articlesData.length === 0) {
          console.log("No articles found, showing placeholder content")
          setTrendingArticles(getDemoTrendingArticles())
          setLoading(false)
          return
        }

        // Fetch categories and users separately to avoid relationship errors
        const categoryIds = [...new Set(articlesData.map((article) => article.category_id))]
        const authorIds = [...new Set(articlesData.map((article) => article.author_id))]

        const [categoriesResult, usersResult] = await Promise.all([
          supabase.from("categories").select("*").in("id", categoryIds),
          supabase.from("users").select("*").in("id", authorIds),
        ])

        // Combine the data
        const articlesWithRelations = articlesData.map((article) => ({
          ...article,
          categories: categoriesResult.data?.find((cat) => cat.id === article.category_id),
          users: usersResult.data?.find((user) => user.id === article.author_id),
        }))

        setTrendingArticles(articlesWithRelations)
      } catch (error) {
        console.log("Error fetching trending articles, showing placeholder content:", error)
        setTrendingArticles(getDemoTrendingArticles())
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingArticles()
  }, [])

  // Demo data for when database isn't set up
  function getDemoTrendingArticles(): Article[] {
    return [
      {
        id: "demo-1",
        title: "Breaking: New Gaming Console Announced",
        slug: "new-gaming-console-announced",
        excerpt: "Industry giant reveals next-generation gaming hardware",
        content: "",
        featured_image_url: "/placeholder.svg?height=200&width=300",
        category_id: "demo-gaming",
        tags: ["gaming", "hardware"],
        author_id: "demo-author",
        status: "published" as const,
        publish_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 5420,
        seo_meta: null,
        categories: {
          id: "demo-gaming",
          name: "Gaming",
          slug: "gaming",
          description: "Latest gaming news and reviews",
          color: "#00d4ff",
          created_at: new Date().toISOString(),
        },
        users: {
          id: "demo-author",
          email: "demo@example.com",
          username: "gamecritic",
          display_name: "Alex Chen",
          avatar_url: "/placeholder.svg?height=40&width=40",
          bio: "Gaming enthusiast and reviewer",
          role: "writer" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        id: "demo-2",
        title: "Marvel's Latest Movie Breaks Records",
        slug: "marvel-movie-breaks-records",
        excerpt: "Superhero blockbuster shatters box office expectations",
        content: "",
        featured_image_url: "/placeholder.svg?height=200&width=300",
        category_id: "demo-movies",
        tags: ["movies", "marvel"],
        author_id: "demo-author-2",
        status: "published" as const,
        publish_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 4890,
        seo_meta: null,
        categories: {
          id: "demo-movies",
          name: "Movies",
          slug: "movies",
          description: "Movie reviews and entertainment news",
          color: "#b347d9",
          created_at: new Date().toISOString(),
        },
        users: {
          id: "demo-author-2",
          email: "demo2@example.com",
          username: "moviebuff",
          display_name: "Sarah Johnson",
          avatar_url: "/placeholder.svg?height=40&width=40",
          bio: "Film critic and entertainment journalist",
          role: "writer" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        id: "demo-3",
        title: "Tech Giant Unveils Revolutionary AI",
        slug: "tech-giant-unveils-ai",
        excerpt: "Artificial intelligence breakthrough promises to change everything",
        content: "",
        featured_image_url: "/placeholder.svg?height=200&width=300",
        category_id: "demo-tech",
        tags: ["tech", "ai"],
        author_id: "demo-author-3",
        status: "published" as const,
        publish_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 3750,
        seo_meta: null,
        categories: {
          id: "demo-tech",
          name: "Tech",
          slug: "tech",
          description: "Technology reviews and news",
          color: "#ff6b35",
          created_at: new Date().toISOString(),
        },
        users: {
          id: "demo-author-3",
          email: "demo3@example.com",
          username: "techguru",
          display_name: "Mike Rodriguez",
          avatar_url: "/placeholder.svg?height=40&width=40",
          bio: "Technology analyst and reviewer",
          role: "writer" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 skeleton" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-16 h-16 skeleton rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton" />
                <div className="h-3 w-20 skeleton" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendingArticles.map((article, index) => (
          <div key={article.id} className="flex space-x-3 group">
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              {article.featured_image_url ? (
                <Image
                  src={article.featured_image_url || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-xs opacity-50">📰</span>
                </div>
              )}
              <div className="absolute top-1 left-1">
                <span className="text-xs font-bold text-white bg-primary rounded px-1">#{index + 1}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/articles/${article.slug}`}>
                <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer mb-1">
                  {article.title}
                </h4>
              </Link>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className="text-xs px-1 py-0"
                  style={{ borderColor: article.categories?.color || "#666" }}
                >
                  {article.categories?.name || "General"}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.view_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
