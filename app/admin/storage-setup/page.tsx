"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function StorageSetupPage() {
  const [checking, setChecking] = useState(false)
  const [creating, setCreating] = useState(false)
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const { toast } = useToast()

  const checkBucket = async () => {
    try {
      setChecking(true)
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        throw error
      }

      const exists = buckets?.some((bucket) => bucket.name === "article-images") || false
      setBucketExists(exists)

      toast({
        title: exists ? "Bucket Found" : "Bucket Not Found",
        description: exists
          ? "The article-images bucket already exists"
          : "The article-images bucket needs to be created",
        variant: exists ? "default" : "destructive",
      })
    } catch (error: any) {
      console.error("Error checking bucket:", error)
      toast({
        title: "Error",
        description: `Failed to check bucket: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setChecking(false)
    }
  }

  const createBucket = async () => {
    try {
      setCreating(true)

      // Create the bucket
      const { error } = await supabase.storage.createBucket("article-images", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        // Try creating without restrictions if the first attempt fails
        const { error: simpleError } = await supabase.storage.createBucket("article-images", {
          public: true,
        })

        if (simpleError) {
          throw simpleError
        }
      }

      setBucketExists(true)
      toast({
        title: "Success",
        description: "Storage bucket created successfully",
      })
    } catch (error: any) {
      console.error("Error creating bucket:", error)
      toast({
        title: "Error",
        description: `Failed to create bucket: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Storage Setup</CardTitle>
          <CardDescription>
            Set up Supabase Storage for image uploads. This creates the necessary bucket for storing article images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Article Images Bucket</h3>
              <p className="text-sm text-muted-foreground">Storage bucket for article featured images</p>
            </div>
            <div className="flex items-center gap-2">
              {bucketExists === true && <CheckCircle className="w-5 h-5 text-green-500" />}
              {bucketExists === false && <XCircle className="w-5 h-5 text-red-500" />}
              {bucketExists === null && <div className="w-5 h-5" />}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={checkBucket} disabled={checking} variant="outline">
              {checking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Check Bucket Status
            </Button>

            <Button onClick={createBucket} disabled={creating || bucketExists === true}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Bucket
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Manual Setup (Alternative)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If automatic creation fails, you can create the bucket manually in your Supabase dashboard:
            </p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Storage section</li>
              <li>Click "Create a new bucket"</li>
              <li>Name it "article-images"</li>
              <li>Make it public</li>
              <li>Set file size limit to 5MB</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
