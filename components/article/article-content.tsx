"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Eye, Share2, Bookmark, ThumbsUp, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories?: Database["public"]["Tables"]["categories"]["Row"]
  users?: Database["public"]["Tables"]["users"]["Row"]
}

interface ArticleContentProps {
  slug: string
}

export function ArticleContent({ slug }: ArticleContentProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likes, setLikes] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchArticle() {
      try {
        console.log("🔍 Fetching article with slug:", slug)

        // Fetch article by slug
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single()

        if (articleError) {
          console.error("❌ Article fetch error:", articleError.message)
          setArticle(null)
          setLoading(false)
          return
        }

        if (!articleData) {
          console.log("⚠️ No article found with slug:", slug)
          setArticle(null)
          setLoading(false)
          return
        }

        console.log("✅ Found article:", articleData.title)

        // Fetch category and user data
        const [categoryResult, userResult] = await Promise.all([
          supabase.from("categories").select("*").eq("id", articleData.category_id).single(),
          supabase.from("users").select("*").eq("id", articleData.author_id).single(),
        ])

        console.log("📊 Related data:", {
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

        setArticle(articleWithRelations)
        setLikes(articleData.view_count || 0)

        // Increment view count
        const { error: updateError } = await supabase
          .from("articles")
          .update({ view_count: (articleData.view_count || 0) + 1 })
          .eq("id", articleData.id)

        if (updateError) {
          console.log("⚠️ Could not update view count:", updateError.message)
        }

        console.log("✅ Article loaded successfully")
      } catch (error) {
        console.error("💥 Unexpected error fetching article:", error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Article link has been copied to your clipboard.",
      })
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Bookmark removed" : "Article bookmarked!",
      description: isBookmarked ? "Article removed from your bookmarks." : "Article saved to your bookmarks.",
    })
  }

  const handleLike = () => {
    setLikes(likes + 1)
    toast({
      title: "Thanks for the feedback!",
      description: "Your like has been recorded.",
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 skeleton" />
        <div className="h-12 skeleton" />
        <div className="h-64 skeleton rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested article could not be found or may have been removed.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </Button>

      {/* Article Header */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" style={{ backgroundColor: article.categories?.color || "#666" }}>
            {article.categories?.name || "General"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{article.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{article.excerpt}</p>
        </div>

        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={article.users?.avatar_url || "/placeholder.svg"} alt={article.users?.display_name} />
              <AvatarFallback>{article.users?.display_name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <span>{article.users?.display_name || article.users?.username || "Anonymous"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(article.publish_date || article.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{article.view_count} views</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleBookmark}>
            <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleLike}>
            <ThumbsUp className="w-4 h-4 mr-2" />
            Like ({likes})
          </Button>
        </div>
      </div>

      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden">
          <Image
            src={article.featured_image_url || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <Card>
        <CardContent className="p-8">
          <div className="article-content">
            {article.content.split("\n").map((paragraph, index) => {
              if (paragraph.startsWith("# ")) {
                return (
                  <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-primary">
                    {paragraph.slice(2)}
                  </h1>
                )
              } else if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-primary">
                    {paragraph.slice(3)}
                  </h2>
                )
              } else if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-primary">
                    {paragraph.slice(4)}
                  </h3>
                )
              } else if (paragraph.startsWith("- ")) {
                return (
                  <li key={index} className="ml-4 mb-2">
                    {paragraph.slice(2)}
                  </li>
                )
              } else if (paragraph.trim() === "") {
                return <br key={index} />
              } else {
                return (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                )
              }
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {article.users && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={article.users.avatar_url || "/placeholder.svg"} alt={article.users.display_name} />
                <AvatarFallback className="text-lg">{article.users.display_name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-2">{article.users.display_name || article.users.username}</h4>
                <p className="text-muted-foreground mb-3">
                  {article.users.bio || "Content creator and industry expert."}
                </p>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
