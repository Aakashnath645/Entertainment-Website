"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        console.log("🔍 Fetching featured article...")

        // First, try to fetch the latest published article
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)

        console.log("Featured article result:", { article: articleData, error: articleError })

        if (articleError) {
          console.log("❌ Featured article error:", articleError.message)
          setFeaturedArticle(null)
          setLoading(false)
          return
        }

        if (!articleData) {
          console.log("⚠️ No featured article found")
          setFeaturedArticle(null)
          setLoading(false)
          return
        }

        console.log("✅ Found featured article:", articleData.title)

        // Fetch category and user data separately
        const [categoryResult, userResult] = await Promise.all([
          supabase.from("categories").select("*").eq("id", articleData.category_id).single(),
          supabase.from("users").select("*").eq("id", articleData.author_id).single(),
        ])

        console.log("Related data:", {
          category: categoryResult.data?.name,
          user: userResult.data?.display_name,
          categoryError: categoryResult.error?.message,
          userError: userResult.error?.message,
        })

        const articleWithRelations = {
          ...articleData,
          categories: categoryResult.data,
          users: userResult.data,
        }

        setFeaturedArticle(articleWithRelations)
        console.log("✅ Featured article set successfully")
      } catch (error) {
        console.error("💥 Unexpected error fetching featured article:", error)
        setFeaturedArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedArticle()
  }, [])

  if (loading) {
    return <div className="relative h-96 skeleton rounded-xl" />
  }

  if (!featuredArticle) {
    return (
      <Card className="relative h-96 bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/20">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold neon-text mb-4">Welcome to EntertainmentHub</h2>
            <p className="text-muted-foreground mb-4">Your ultimate destination for gaming, movies, and tech news</p>
            <p className="text-sm text-muted-foreground">
              <Link href="/admin/init" className="text-primary hover:underline">
                Initialize your database
              </Link>{" "}
              to see featured content here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden group glow-effect">
      <div className="relative h-96 md:h-[500px]">
        {featuredArticle.featured_image_url && (
          <Image
            src={featuredArticle.featured_image_url || "/placeholder.svg"}
            alt={featuredArticle.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-3xl">
            <Badge
              variant="secondary"
              className="mb-4"
              style={{ backgroundColor: featuredArticle.categories?.color || "#666" }}
            >
              {featuredArticle.categories?.name || "General"}
            </Badge>

            <Link href={`/articles/${featuredArticle.slug}`}>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 hover:text-primary transition-colors cursor-pointer">
                {featuredArticle.title}
              </h1>
            </Link>

            <p className="text-gray-200 text-lg mb-6 line-clamp-3">{featuredArticle.excerpt}</p>

            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{featuredArticle.users?.display_name || featuredArticle.users?.username || "Anonymous"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(featuredArticle.publish_date || featuredArticle.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{featuredArticle.view_count} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
