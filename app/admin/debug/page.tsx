"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Users, FileText, Folder } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    categories: any[]
    articles: any[]
    users: any[]
    errors: string[]
  }>({
    categories: [],
    articles: [],
    users: [],
    errors: [],
  })

  const fetchDebugData = async () => {
    setLoading(true)
    const errors: string[] = []
    let categories: any[] = []
    let articles: any[] = []
    let users: any[] = []

    try {
      // Test categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (categoriesError) {
        errors.push(`Categories: ${categoriesError.message}`)
      } else {
        categories = categoriesData || []
      }

      // Test articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })

      if (articlesError) {
        errors.push(`Articles: ${articlesError.message}`)
      } else {
        articles = articlesData || []
      }

      // Test users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) {
        errors.push(`Users: ${usersError.message}`)
      } else {
        users = usersData || []
      }
    } catch (error: any) {
      errors.push(`General error: ${error.message}`)
    }

    setData({ categories, articles, users, errors })
    setLoading(false)
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold neon-text">Database Debug</h1>
            <Button onClick={fetchDebugData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Errors */}
          {data.errors.length > 0 && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardHeader>
                <CardTitle className="text-red-400">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.errors.map((error, index) => (
                    <li key={index} className="text-red-300 text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{data.categories.length}</div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{data.articles.length}</div>
                    <div className="text-sm text-muted-foreground">Articles</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">
                      {data.articles.filter((a) => a.status === "published").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-2xl font-bold">{data.users.length}</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories ({data.categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.categories.length === 0 ? (
                <p className="text-muted-foreground">No categories found</p>
              ) : (
                <div className="space-y-2">
                  {data.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline">{category.slug}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{category.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Articles ({data.articles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.articles.length === 0 ? (
                <p className="text-muted-foreground">No articles found</p>
              ) : (
                <div className="space-y-2">
                  {data.articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{article.title}</span>
                          <Badge variant={article.status === "published" ? "default" : "secondary"}>
                            {article.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Category: {article.category_id} | Author: {article.author_id}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{article.view_count} views</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({data.users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.users.length === 0 ? (
                <p className="text-muted-foreground">No users found</p>
              ) : (
                <div className="space-y-2">
                  {data.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{user.display_name || user.username}</span>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
