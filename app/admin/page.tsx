"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, FileText, Users, Folder, Settings, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AdminDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    articles: 0,
    published: 0,
    drafts: 0,
    categories: 0,
    users: 0,
  })
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin?redirect=/admin")
        return
      }

      setUser(user)
      await fetchStats()
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchStats = async () => {
    try {
      const [articlesResult, categoriesResult, usersResult] = await Promise.all([
        supabase.from("articles").select("status", { count: "exact" }),
        supabase.from("categories").select("id", { count: "exact" }),
        supabase.from("users").select("id", { count: "exact" }),
      ])

      const articles = articlesResult.data || []
      const published = articles.filter((a) => a.status === "published").length
      const drafts = articles.filter((a) => a.status === "draft").length

      setStats({
        articles: articlesResult.count || 0,
        published,
        drafts,
        categories: categoriesResult.count || 0,
        users: usersResult.count || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
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
              <h1 className="text-3xl font-bold neon-text">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
            <Button asChild>
              <Link href="/admin/articles/new">
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.articles}</div>
                    <div className="text-sm text-muted-foreground">Total Articles</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.published}</div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.drafts}</div>
                    <div className="text-sm text-muted-foreground">Drafts</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Folder className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.categories}</div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.users}</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Manage Articles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Create, edit, and manage your articles.</p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/articles">View All Articles</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/articles/new">Create New Article</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Folder className="w-5 h-5" />
                  <span>Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Organize your content with categories.</p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/categories">Manage Categories</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Manage user accounts and permissions.</p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Database</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Database management and debugging tools.</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/debug">Debug Database</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/init">Initialize Data</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">View site statistics and performance.</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/analytics">View Analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Configure site settings and preferences.</p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/settings">Site Settings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
