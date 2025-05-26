"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2, Copy, ExternalLink } from "lucide-react"

export default function StorageSetupPage() {
  const [checking, setChecking] = useState(false)
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
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
        title: exists ? "✅ Bucket Found!" : "❌ Bucket Not Found",
        description: exists
          ? "The article-images bucket exists and is ready to use"
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

  const copyMinimalSQL = async () => {
    const sqlScript = `-- Minimal storage bucket creation
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Verify creation
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'article-images';`

    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "✅ SQL Copied!",
        description: "The minimal SQL script has been copied to your clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the SQL script below",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🗄️ Storage Setup - Minimal Approach</CardTitle>
          <CardDescription>
            Create the storage bucket using the simplest possible method that works with all Supabase versions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">📁 Article Images Bucket</h3>
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
              {checking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}🔍 Check Bucket Status
            </Button>

            <Button onClick={copyMinimalSQL} variant="default">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "✅ Copied!" : "📋 Copy Minimal SQL"}
            </Button>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-3">🎯 Recommended: SQL Editor Method</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-green-700">
              <li>
                Click <strong>"📋 Copy Minimal SQL"</strong> button above
              </li>
              <li>
                Open your <strong>Supabase Dashboard</strong> in a new tab
              </li>
              <li>
                Go to <strong>SQL Editor</strong> (left sidebar)
              </li>
              <li>
                Click <strong>"+ New query"</strong>
              </li>
              <li>Paste the copied SQL script</li>
              <li>
                Click <strong>"▶ Run"</strong> button
              </li>
              <li>
                Return here and click <strong>"🔍 Check Bucket Status"</strong>
              </li>
            </ol>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3">🖱️ Alternative: Storage UI Method</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-blue-700">
              <li>Go to your Supabase Dashboard</li>
              <li>
                Click <strong>"Storage"</strong> in the left sidebar
              </li>
              <li>
                Click <strong>"Create a new bucket"</strong> button
              </li>
              <li>
                Enter bucket name: <code className="bg-white px-1 rounded">article-images</code>
              </li>
              <li>
                ✅ Check <strong>"Public bucket"</strong>
              </li>
              <li>
                Click <strong>"Create bucket"</strong>
              </li>
              <li>Return here and check bucket status</li>
            </ol>
          </div>

          <div className="p-4 bg-gray-50 border rounded-lg">
            <h4 className="font-medium mb-2">📝 What This Creates:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>A public storage bucket named "article-images"</li>
              <li>Accessible for uploading images from your application</li>
              <li>Public read access for displaying images on your website</li>
              <li>No complex policies that might cause syntax errors</li>
            </ul>
          </div>

          {bucketExists === true && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">🎉 Storage Ready!</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                The article-images bucket is now available. You can upload images in the article editor!
              </p>
              <Button className="mt-3" size="sm" onClick={() => window.open("/admin/articles/new", "_blank")}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Image Upload
              </Button>
            </div>
          )}

          {bucketExists === false && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Bucket Not Found</h4>
              <p className="text-sm text-yellow-700">
                Please use one of the methods above to create the storage bucket. The minimal SQL approach should work
                with any Supabase version.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
