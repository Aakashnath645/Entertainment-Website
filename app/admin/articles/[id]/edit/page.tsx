"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Save, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

interface EditArticleProps {
  params: {
    id: string
  }
}

export default function EditArticle({ params }: EditArticleProps) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<Database["public"]["Tables"]["categories"]["Row"][]>([])
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    category_id: "",
    tags: "",
    status: "draft" as "draft" | "published" | "archived",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchCategories()
    fetchArticle()
  }, [params.id])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/signin?redirect=/admin/articles")
      return
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name")
    if (data) setCategories(data)
  }

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase.from("articles").select("*").eq("id", params.id).single()

      if (error) throw error

      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featured_image_url: data.featured_image_url || "",
          category_id: data.category_id,
          tags: data.tags?.join(", ") || "",
          status: data.status,
        })
      }
    } catch (error: any) {
      console.error("Error fetching article:", error)
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      })
      router.push("/admin/articles")
    } finally {
      setInitialLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error } = await supabase
        .from("articles")
        .update({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          featured_image_url: formData.featured_image_url || null,
          category_id: formData.category_id,
          tags: tagsArray,
          status,
          publish_date: status === "published" && formData.status === "draft" ? new Date().toISOString() : undefined,
        })
        .eq("id", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Article ${status === "published" ? "published" : "updated"} successfully`,
      })

      router.push("/admin/articles")
    } catch (error: any) {
      console.error("Error updating article:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update article",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading article...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold neon-text">Edit Article</h1>
              <p className="text-muted-foreground">Update your content</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/articles">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Link>
            </Button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter article title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="article-url-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief description of the article"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your article content here... (Supports Markdown)"
                      rows={20}
                      className="font-mono"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleSubmit("draft")}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={() => handleSubmit("published")} disabled={loading} className="flex-1">
                      {formData.status === "published" ? "Update" : "Publish"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Article Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Featured Image</Label>
                    <ImageUpload
                      value={formData.featured_image_url}
                      onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {formData.title && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.featured_image_url && (
                        <img
                          src={formData.featured_image_url || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <h3 className="font-semibold line-clamp-2">{formData.title}</h3>
                      {formData.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{formData.excerpt}</p>
                      )}
                      <div className="text-xs text-muted-foreground">URL: /articles/{formData.slug}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
