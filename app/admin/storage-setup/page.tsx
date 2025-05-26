"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2, AlertTriangle, Copy } from "lucide-react"

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
        title: exists ? "Bucket Found!" : "Bucket Not Found",
        description: exists
          ? "The article-images bucket exists and is ready to use"
          : "The article-images bucket needs to be created manually",
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

  const copySQL = async () => {
    const sqlScript = `-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  updated_at = NOW();

-- Create policies
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES 
  ('article-images-public-read', 'article-images', 'Public Access', 'bucket_id = ''article-images''', NULL, 'SELECT', ARRAY['public', 'authenticated', 'anon']),
  ('article-images-auth-insert', 'article-images', 'Authenticated users can upload', NULL, 'bucket_id = ''article-images'' AND auth.role() = ''authenticated''', 'INSERT', ARRAY['authenticated']),
  ('article-images-auth-update', 'article-images', 'Users can update own uploads', 'bucket_id = ''article-images''', 'bucket_id = ''article-images''', 'UPDATE', ARRAY['authenticated']),
  ('article-images-auth-delete', 'article-images', 'Users can delete own uploads', 'bucket_id = ''article-images''', 'bucket_id = ''article-images''', 'DELETE', ARRAY['authenticated'])
ON CONFLICT (id) DO NOTHING;

-- Verify creation
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'article-images';`

    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "SQL Copied!",
        description: "The SQL script has been copied to your clipboard",
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
          <CardTitle>Storage Setup - Manual Creation Required</CardTitle>
          <CardDescription>
            Due to RLS policies, the storage bucket must be created manually in your Supabase dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Article Images Bucket Status</h3>
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

            <Button onClick={copySQL} variant="default">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy SQL Script"}
            </Button>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Manual Setup Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  The RLS policy prevents automatic bucket creation. Please follow these steps:
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">Step-by-Step Instructions:</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>
                Go to your <strong>Supabase Dashboard</strong>
              </li>
              <li>
                Navigate to <strong>SQL Editor</strong>
              </li>
              <li>
                Click <strong>"New Query"</strong>
              </li>
              <li>Copy and paste the SQL script (use the "Copy SQL Script" button above)</li>
              <li>
                Click <strong>"Run"</strong> to execute the script
              </li>
              <li>
                Come back here and click <strong>"Check Bucket Status"</strong> to verify
              </li>
            </ol>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Alternative: Manual UI Creation</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Go to your Supabase project dashboard</li>
              <li>
                Navigate to <strong>Storage</strong> section
              </li>
              <li>
                Click <strong>"Create a new bucket"</strong>
              </li>
              <li>
                Name it <strong>"article-images"</strong>
              </li>
              <li>
                Make it <strong>public</strong>
              </li>
              <li>
                Set file size limit to <strong>5MB</strong>
              </li>
              <li>
                Add allowed MIME types: <code>image/jpeg, image/png, image/gif, image/webp</code>
              </li>
            </ol>
          </div>

          {bucketExists === true && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">Storage Ready!</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                The article-images bucket is now available. You can upload images in the article editor.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
