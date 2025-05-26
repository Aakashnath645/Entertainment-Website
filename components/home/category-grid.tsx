"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Eye, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories?: Database["public"]["Tables"]["categories"]["Row"]
  users?: Database["public"]["Tables"]["users"]["Row"]
}

type CategoryWithArticles = {
  category: Database["public"]["Tables"]["categories"]["Row"]
  articles: Article[]
}

export function CategoryGrid() {
  const [categoriesWithArticles, setCategoriesWithArticles] = useState<CategoryWithArticles[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoriesWithArticles() {
      try {
        // First, try to fetch categories
        const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

        if (categoriesError || !categories || categories.length === 0) {
          setCategoriesWithArticles([])
          setLoading(false)
          return
        }

        // Fetch all published articles
        const { data: allArticles, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("publish_date", { ascending: false })

        if (articlesError || !allArticles || allArticles.length === 0) {
          setCategoriesWithArticles([])
          setLoading(false)
          return
        }

        // Get unique author IDs
        const authorIds = [...new Set(allArticles.map((article) => article.author_id))]
        const { data: users } = await supabase.from("users").select("*").in("id", authorIds)

        // Group articles by category
        const categoriesWithArticles = categories
          .map((category) => {
            const categoryArticles = allArticles
              .filter((article) => article.category_id === category.id)
              .slice(0, 4)
              .map((article) => ({
                ...article,
                categories: category,
                users: users?.find((user) => user.id === article.author_id),
              }))

            return {
              category,
              articles: categoryArticles,
            }
          })
          .filter((cat) => cat.articles.length > 0)

        setCategoriesWithArticles(categoriesWithArticles)
      } catch (error) {
        setCategoriesWithArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesWithArticles()
  }, [])

  if (loading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-6">
            <div className="h-8 w-32 skeleton" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-64 skeleton rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (categoriesWithArticles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">No Content Yet</h3>
          <p className="text-muted-foreground text-lg mb-6">
            Start creating amazing content for your entertainment website.
          </p>
          <Button asChild className="glow-effect">
            <Link href="/admin/articles/new">Create Your First Article</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {categoriesWithArticles.map(({ category, articles }) => (
        <section key={category.id}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-12 rounded-full" style={{ backgroundColor: category.color }} />
              <div>
                <h2 className="text-3xl font-bold">{category.name}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <Button variant="outline" asChild className="group">
              <Link href={`/${category.slug}`} className="flex items-center space-x-2">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} featured={index === 0} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ArticleCard({ article, featured }: { article: Article; featured?: boolean }) {
  return (
    <Card className={`group glow-effect overflow-hidden ${featured ? "md:col-span-2" : ""}`}>
      <div className={`relative ${featured ? "h-72" : "h-48"}`}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-4 left-4">
          <Badge variant="secondary" style={{ backgroundColor: article.categories?.color || "#666" }}>
            {article.categories?.name || "General"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <Link href={`/articles/${article.slug}`}>
          <h3
            className={`font-bold mb-3 hover:text-primary transition-colors cursor-pointer line-clamp-2 ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {article.title}
          </h3>
        </Link>

        <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{article.users?.display_name || article.users?.username || "Anonymous"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(article.publish_date || article.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.view_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
