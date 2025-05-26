"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, User, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SearchResult {
  id: string
  title: string
  excerpt: string
  slug: string
  category: string
  author: {
    display_name: string
    username: string
  }
  created_at: string
  view_count: number
  featured_image_url?: string
}

interface SearchResultsProps {
  initialQuery?: string
}

export function SearchResults({ initialQuery = "" }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("relevance")
  const supabase = createClientComponentClient()

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "gaming", label: "Gaming" },
    { value: "movies", label: "Movies" },
    { value: "tv-shows", label: "TV Shows" },
    { value: "tech", label: "Tech" },
    { value: "esports", label: "Esports" },
  ]

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "most_viewed", label: "Most Viewed" },
  ]

  useEffect(() => {
    if (query.trim()) {
      performSearch()
    } else {
      setResults([])
    }
  }, [query, category, sortBy])

  const performSearch = async () => {
    setLoading(true)
    try {
      let searchQuery = supabase
        .from("articles")
        .select(`
          id,
          title,
          excerpt,
          slug,
          category,
          created_at,
          view_count,
          featured_image_url,
          author:profiles(display_name, username)
        `)
        .eq("status", "published")
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)

      if (category !== "all") {
        searchQuery = searchQuery.eq("category", category)
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          searchQuery = searchQuery.order("created_at", { ascending: false })
          break
        case "oldest":
          searchQuery = searchQuery.order("created_at", { ascending: true })
          break
        case "most_viewed":
          searchQuery = searchQuery.order("view_count", { ascending: false })
          break
        default:
          searchQuery = searchQuery.order("created_at", { ascending: false })
      }

      const { data, error } = await searchQuery.limit(20)

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Articles</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles, reviews, news..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1 rounded-md border border-border bg-background text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 rounded-md border border-border bg-background text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </div>

          {results.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {article.featured_image_url && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={article.featured_image_url || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>

                    <Link href={`/articles/${article.slug}`}>
                      <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{article.author.display_name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(article.created_at))} ago</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.view_count} views</span>
                        </div>
                      </div>

                      <Link href={`/articles/${article.slug}`}>
                        <Button variant="ghost" size="sm">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
          <Button variant="outline" onClick={() => setQuery("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start searching</h3>
          <p className="text-muted-foreground">Enter a search term to find articles, reviews, and news</p>
        </div>
      )}
    </div>
  )
}
