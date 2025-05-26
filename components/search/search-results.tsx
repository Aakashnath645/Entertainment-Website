"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Calendar, User, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories?: Database["public"]["Tables"]["categories"]["Row"]
  users?: Database["public"]["Tables"]["users"]["Row"]
}

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query: initialQuery }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("relevance")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<Database["public"]["Tables"]["categories"]["Row"][]>([])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await supabase.from("categories").select("*").order("name")
        if (data) setCategories(data)
      } catch (error) {
        console.log("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function searchArticles() {
      if (!query.trim()) {
        setArticles([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        let queryBuilder = supabase.from("articles").select("*").eq("status", "published")

        // Apply text search
        if (query.trim()) {
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        }

        // Apply category filter
        if (categoryFilter !== "all") {
          queryBuilder = queryBuilder.eq("category_id", categoryFilter)
        }

        // Apply sorting
        switch (sortBy) {
          case "newest":
            queryBuilder = queryBuilder.order("publish_date", { ascending: false })
            break
          case "oldest":
            queryBuilder = queryBuilder.order("publish_date", { ascending: true })
            break
          case "popular":
            queryBuilder = queryBuilder.order("view_count", { ascending: false })
            break
          default:
            queryBuilder = queryBuilder.order("created_at", { ascending: false })
        }

        const { data: articlesData, error } = await queryBuilder.limit(50)

        if (error || !articlesData) {
          console.log("Search error or no results, showing demo data")
          setArticles(getDemoSearchResults(query))
          setLoading(false)
          return
        }

        // Fetch related data
        const categoryIds = [...new Set(articlesData.map((article) => article.category_id))]
        const authorIds = [...new Set(articlesData.map((article) => article.author_id))]

        const [categoriesResult, usersResult] = await Promise.all([
          supabase.from("categories").select("*").in("id", categoryIds),
          supabase.from("users").select("*").in("id", authorIds),
        ])

        const articlesWithRelations = articlesData.map((article) => ({
          ...article,
          categories: categoriesResult.data?.find((cat) => cat.id === article.category_id),
          users: usersResult.data?.find((user) => user.id === article.author_id),
        }))

        setArticles(articlesWithRelations)
      } catch (error) {
        console.log("Search error:", error)
        setArticles(getDemoSearchResults(query))
      } finally {
        setLoading(false)
      }
    }

    searchArticles()
  }, [query, sortBy, categoryFilter])

  function getDemoSearchResults(searchQuery: string): Article[] {
    if (!searchQuery.trim()) return []

    return [
      {
        id: "demo-search-1",
        title: `Search Result: ${searchQuery} in Entertainment`,
        slug: "search-result-entertainment",
        excerpt: `This is a demo search result for "${searchQuery}". In a real application, this would show actual matching content.`,
        content: "",
        featured_image_url: "/placeholder.svg?height=400&width=600",
        category_id: "demo-category",
        tags: ["search", "demo", searchQuery.toLowerCase()],
        author_id: "demo-author",
        status: "published" as const,
        publish_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 1500,
        seo_meta: null,
        categories: {
          id: "demo-category",
          name: "General",
          slug: "general",
          description: "General entertainment content",
          color: "#00d4ff",
          created_at: new Date().toISOString(),
        },
        users: {
          id: "demo-author",
          email: "demo@example.com",
          username: "searcher",
          display_name: "Demo Author",
          avatar_url: "/placeholder.svg?height=40&width=40",
          bio: "Content creator",
          role: "writer" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ]
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Update URL with search query
    const url = new URL(window.location.href)
    url.searchParams.set("q", query)
    window.history.pushState({}, "", url.toString())
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold neon-text">Search Results</h1>
        {initialQuery && (
          <p className="text-xl text-muted-foreground">
            Results for: <span className="text-primary">"{initialQuery}"</span>
          </p>
        )}
      </div>

      {/* Search Form */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="Search articles, reviews, and news..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 text-lg h-12"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 skeleton rounded-lg" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-4">{query.trim() ? "No Results Found" : "Enter a search term"}</h3>
          <p className="text-muted-foreground">
            {query.trim()
              ? "Try adjusting your search terms or browse our categories."
              : "Search for articles, reviews, and news across all entertainment categories."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Found {articles.length} {articles.length === 1 ? "result" : "results"}
          </div>
          {articles.map((article) => (
            <SearchResultCard key={article.id} article={article} query={query} />
          ))}
        </div>
      )}
    </div>
  )
}

function SearchResultCard({ article, query }: { article: Article; query: string }) {
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text
    const regex = new RegExp(`(${searchQuery})`, "gi")
    return text.replace(regex, "<mark class='bg-primary/20 text-primary'>$1</mark>")
  }

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
            <h3
              className="font-bold text-lg mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2"
              dangerouslySetInnerHTML={{ __html: highlightText(article.title, query) }}
            />
          </Link>
          <p
            className="text-muted-foreground mb-3 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlightText(article.excerpt, query) }}
          />
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
