"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Folder, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Category = Database["public"]["Tables"]["categories"]["Row"]

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#00d4ff",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/signin?redirect=/admin/categories")
      return
    }

    // Check if user is admin
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userProfile?.role !== "admin") {
      router.push("/admin")
      return
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const createCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategory.name,
          slug: newCategory.slug,
          description: newCategory.description,
          color: newCategory.color,
        })
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, data])
      setIsCreateDialogOpen(false)
      setNewCategory({ name: "", slug: "", description: "", color: "#00d4ff" })
      toast({
        title: "Success",
        description: "Category created successfully",
      })
    } catch (error: any) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const updateCategory = async () => {
    if (!editingCategory) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          color: editingCategory.color,
        })
        .eq("id", editingCategory.id)
        .select()
        .single()

      if (error) throw error

      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? data : cat)))
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)

      if (error) throw error

      setCategories(categories.filter((cat) => cat.id !== categoryId))
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading categories...</p>
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
              <h1 className="text-3xl font-bold neon-text">Categories Management</h1>
              <p className="text-muted-foreground">Organize your content with categories</p>
            </div>
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>Add a new category to organize your content.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={(e) => {
                          const name = e.target.value
                          setNewCategory({
                            ...newCategory,
                            name,
                            slug: generateSlug(name),
                          })
                        }}
                        placeholder="Category name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={newCategory.slug}
                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                        placeholder="category-slug"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Category description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="color"
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newCategory.color}
                          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                          placeholder="#00d4ff"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createCategory}>Create Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Categories ({filteredCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search terms." : "Create your first category to get started."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>Create Category</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">/{category.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>Update category information.</DialogDescription>
                              </DialogHeader>
                              {editingCategory && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="editName">Name *</Label>
                                    <Input
                                      id="editName"
                                      value={editingCategory.name}
                                      onChange={(e) => {
                                        const name = e.target.value
                                        setEditingCategory({
                                          ...editingCategory,
                                          name,
                                          slug: generateSlug(name),
                                        })
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editSlug">Slug *</Label>
                                    <Input
                                      id="editSlug"
                                      value={editingCategory.slug}
                                      onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editDescription">Description</Label>
                                    <Textarea
                                      id="editDescription"
                                      value={editingCategory.description || ""}
                                      onChange={(e) =>
                                        setEditingCategory({ ...editingCategory, description: e.target.value })
                                      }
                                      rows={3}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editColor">Color</Label>
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        id="editColor"
                                        type="color"
                                        value={editingCategory.color}
                                        onChange={(e) =>
                                          setEditingCategory({ ...editingCategory, color: e.target.value })
                                        }
                                        className="w-16 h-10"
                                      />
                                      <Input
                                        value={editingCategory.color}
                                        onChange={(e) =>
                                          setEditingCategory({ ...editingCategory, color: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={updateCategory}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone and
                                  will affect all articles in this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCategory(category.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                      )}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Created {new Date(category.created_at).toLocaleDateString()}
                      </div>
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
