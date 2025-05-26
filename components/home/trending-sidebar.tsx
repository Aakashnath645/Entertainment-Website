"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Calendar, Eye } from "lucide-react"
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
        // Fetch top articles by view count
        const { data: articles, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("view_count", { ascending: false })
          .limit(5)

        if (articlesError || !articles || articles.length === 0) {
          setTrendingArticles([])
          setLoading(false)
          return
        }

        // Get unique author and category IDs
        const authorIds = [...new Set(articles.map((article) => article.author_id))]
        const categoryIds = [...new Set(articles.map((article) => article.category_id))]

        const [usersResult, categoriesResult] = await Promise.all([
          supabase.from("users").select("*").in("id", authorIds),
          supabase.from("categories").select("*").in("id", categoryIds),
        ])

        const articlesWithRelations = articles.map((article) => ({
          ...article,
          users: usersResult.data?.find((user) => user.id === article.author_id),
          categories: categoriesResult.data?.find((category) => category.id === article.category_id),
        }))

        setTrendingArticles(articlesWithRelations)
      } catch (error) {
        setTrendingArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingArticles()
  }, [])

  if (loading) {
    return (
      <Card className="glow-effect">
        <CardHeader>
          <div className="h-6 w-32 skeleton" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-16 h-16 skeleton rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton" />
                <div className="h-3 w-3/4 skeleton" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (trendingArticles.length === 0) {
    return (
      <Card className="glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No trending articles yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glow-effect">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Trending</span>
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
                  <span className="text-lg">📰</span>
                </div>
              )}
              <div className="absolute top-1 left-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {index + 1}
                </Badge>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/articles/${article.slug}`}>
                <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer mb-1">
                  {article.title}
                </h4>
              </Link>

              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(article.publish_date || article.created_at).toLocaleDateString()}</span>
                </div>
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
