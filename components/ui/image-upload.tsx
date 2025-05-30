"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const createBucket = async () => {
    try {
      // First check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === "article-images")

      if (bucketExists) {
        return true
      }

      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket("article-images", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)

        // If we can't create bucket, try without restrictions
        const { error: simpleCreateError } = await supabase.storage.createBucket("article-images", {
          public: true,
        })

        if (simpleCreateError) {
          throw new Error(`Failed to create storage bucket: ${simpleCreateError.message}`)
        }
      }

      return true
    } catch (error: any) {
      console.error("Bucket creation error:", error)
      throw new Error(`Storage setup failed: ${error.message}`)
    }
  }

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file (JPEG, PNG, GIF, WebP)")
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB")
      }

      // Ensure bucket exists
      await createBucket()

      // Create unique filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `articles/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("article-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Upload error:", error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("article-images").getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image")
      }

      onChange(urlData.publicUrl)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImage(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0])
    }
  }

  const removeImage = () => {
    onChange("")
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative">
          <img
            src={value || "/placeholder.svg"}
            alt="Featured image"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Drag and drop an image here, or click to select</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
              id="image-upload"
            />
            <Button type="button" variant="outline" disabled={disabled || uploading} asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Select Image"}
              </label>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF, WebP up to 5MB</p>
        </div>
      )}
    </div>
  )
}
