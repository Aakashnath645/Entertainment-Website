"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ArticleContentProps {
  article: {
    id: string
    title: string
    content: string
    excerpt: string
    featured_image_url?: string
    category: string
    author: {
      display_name: string
      username: string
      avatar_url?: string
    }
    created_at: string
    view_count: number
    like_count: number
    comment_count: number
    tags?: string[]
  }
}

export function ArticleContent({ article }: ArticleContentProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(article.like_count || 0)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {article.category}
          </Badge>
          {article.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{article.title}</h1>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={article.author.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{article.author.display_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{article.author.display_name}</p>
              <p className="text-sm text-muted-foreground">
                @{article.author.username} • {formatDistanceToNow(new Date(article.created_at))} ago
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{article.view_count} views</span>
            <span>{article.comment_count} comments</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="mb-8">
          <img
            src={article.featured_image_url || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="article-content mb-8" dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* Article Actions */}
      <div className="flex items-center justify-between border-t border-b border-border py-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLike} className={`gap-2 ${isLiked ? "text-red-500" : ""}`}>
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {article.comment_count}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={isBookmarked ? "text-primary" : ""}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Author Bio */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={article.author.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">{article.author.display_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{article.author.display_name}</h3>
            <p className="text-muted-foreground mb-3">
              Gaming enthusiast and tech writer passionate about the latest in entertainment and technology.
            </p>
            <Button variant="outline" size="sm">
              Follow @{article.author.username}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
