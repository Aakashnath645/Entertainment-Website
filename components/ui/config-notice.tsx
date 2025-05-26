"use client"

import { AlertTriangle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ConfigNotice() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isConfigured) return null

  return (
    <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-500">Supabase Configuration Required</AlertTitle>
      <AlertDescription className="mt-2 text-yellow-200">
        <p className="mb-3">
          This demo is showing sample content. To enable full functionality including authentication, real-time
          features, and data persistence, you need to configure Supabase.
        </p>
        <div className="space-y-2">
          <p className="font-medium">Required environment variables:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <code className="bg-black/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code className="bg-black/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </li>
          </ul>
        </div>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <a
            href="https://supabase.com/docs/guides/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2"
          >
            <span>Setup Guide</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
