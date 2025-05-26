"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Eye, PlusCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories?: Database["public"]["Tables"]["categories"]["Row"]
  users?: Database["public"]["Tables"]["users"]["Row"]
}

export function HeroSection() {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedArticle() {
      try {
        // First, try to fetch the latest published article
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)

        if (articleError || !articleData || articleData.length === 0) {
          setFeaturedArticle(null)
          setLoading(false)
          return
        }

        // Fetch category and user data separately
        const [categoryResult, userResult] = await Promise.all([
          supabase.from("categories").select("*").eq("id", articleData[0].category_id).single(),
          supabase.from("users").select("*").eq("id", articleData[0].author_id).single(),
        ])

        const articleWithRelations = {
          ...articleData[0],
          categories: categoryResult.data,
          users: userResult.data,
        }

        setFeaturedArticle(articleWithRelations)
      } catch (error) {
        setFeaturedArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedArticle()
  }, [])

  if (loading) {
    return <div className="relative h-96 md:h-[600px] skeleton rounded-xl" />
  }

  if (!featuredArticle) {
    return (
      <Card className="relative h-96 md:h-[600px] bg-gradient-to-br from-primary/20 via-purple-500/20 to-green-400/20 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <CardContent className="relative flex items-center justify-center h-full text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold neon-text mb-6">EntertainmentHub</h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Your ultimate destination for gaming news, movie reviews, tech updates, and entertainment coverage
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow-effect" asChild>
                <Link href="/admin/articles/new">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create First Article
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10" asChild>
                <Link href="/admin">Admin Panel</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden group glow-effect">
      <div className="relative h-96 md:h-[600px]">
        {featuredArticle.featured_image_url && (
          <Image
            src={featuredArticle.featured_image_url || "/placeholder.svg"}
            alt={featuredArticle.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-6">
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1"
                style={{ backgroundColor: featuredArticle.categories?.color || "#666" }}
              >
                {featuredArticle.categories?.name || "General"}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 border-white/30 text-white">
                Featured Story
              </Badge>
            </div>

            <Link href={`/articles/${featuredArticle.slug}`}>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 hover:text-primary transition-colors cursor-pointer leading-tight">
                {featuredArticle.title}
              </h1>
            </Link>

            <p className="text-gray-200 text-lg md:text-xl mb-8 line-clamp-3 leading-relaxed max-w-3xl">
              {featuredArticle.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{featuredArticle.users?.display_name || featuredArticle.users?.username || "Anonymous"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(featuredArticle.publish_date || featuredArticle.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{featuredArticle.view_count} views</span>
                </div>
              </div>

              <Button asChild className="glow-effect">
                <Link href={`/articles/${featuredArticle.slug}`}>Read Full Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
