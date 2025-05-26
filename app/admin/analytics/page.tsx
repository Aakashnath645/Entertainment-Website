"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, FileText, Eye, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
    topArticles: [],
    viewsOverTime: [],
    categoryStats: [],
    userGrowth: [],
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchAnalytics()
  }, [timeRange])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/signin?redirect=/admin/analytics")
      return
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userProfile?.role !== "admin") {
      router.push("/admin")
      return
    }
  }

  const fetchAnalytics = async () => {
    try {
      // Fetch basic stats
      const [articlesResult, usersResult, categoriesResult] = await Promise.all([
        supabase.from("articles").select("id, view_count, status, created_at, title, slug"),
        supabase.from("users").select("id, created_at"),
        supabase.from("categories").select("id, name"),
      ])

      const articles = articlesResult.data || []
      const users = usersResult.data || []
      const categories = categoriesResult.data || []

      // Calculate total views
      const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0)

      // Get published articles
      const publishedArticles = articles.filter((article) => article.status === "published")

      // Get top articles by views
      const topArticles = articles
        .filter((article) => article.status === "published")
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 10)

      // Generate mock data for charts (in a real app, you'd calculate this from actual data)
      const viewsOverTime = generateMockTimeSeriesData(timeRange, totalViews)
      const userGrowth = generateMockUserGrowthData(timeRange, users.length)

      // Category stats
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          const categoryArticles = articles.filter((article) => article.category_id === category.id)
          const categoryViews = categoryArticles.reduce((sum, article) => sum + (article.view_count || 0), 0)
          return {
            name: category.name,
            articles: categoryArticles.length,
            views: categoryViews,
          }
        }),
      )

      setAnalytics({
        totalViews,
        totalUsers: users.length,
        totalArticles: articles.length,
        publishedArticles: publishedArticles.length,
        topArticles,
        viewsOverTime,
        categoryStats,
        userGrowth,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockTimeSeriesData = (range: string, total: number) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split("T")[0],
        views: Math.floor(Math.random() * (total / days)) + Math.floor(total / days / 2),
      })
    }
    return data
  }

  const generateMockUserGrowthData = (range: string, total: number) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
    const data = []
    let cumulative = Math.max(0, total - Math.floor(total / 4))
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const growth = Math.floor(Math.random() * Math.floor(total / days / 2)) + 1
      cumulative += growth
      data.push({
        date: date.toISOString().split("T")[0],
        users: cumulative,
        newUsers: growth,
      })
    }
    return data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold neon-text">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your site's performance and user engagement</p>
            </div>
            <div className="flex space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild variant="outline">
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalArticles}</div>
                    <div className="text-sm text-muted-foreground">Total Articles</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.publishedArticles}</div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Views Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-2">
                  {analytics.viewsOverTime.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{
                          height: `${(day.views / Math.max(...analytics.viewsOverTime.map((d) => d.views))) * 200}px`,
                        }}
                      />
                      <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                        {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.articles} articles</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{category.views.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topArticles.map((article: any, index) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <Link href={`/articles/${article.slug}`} className="font-medium hover:text-primary">
                          {article.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          Published {new Date(article.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{(article.view_count || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Growth</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end space-x-2">
                {analytics.userGrowth.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-400 rounded-t"
                      style={{
                        height: `${(day.newUsers / Math.max(...analytics.userGrowth.map((d) => d.newUsers))) * 200}px`,
                      }}
                    />
                    <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">Total registered users: {analytics.totalUsers}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
