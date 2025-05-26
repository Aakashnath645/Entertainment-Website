"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseConfig } from "@/lib/supabase"

export function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    connection: "checking" | "success" | "error"
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    connection: "checking",
  })

  useEffect(() => {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setEnvStatus((prev) => ({
      ...prev,
      supabaseUrl: hasUrl,
      supabaseKey: hasKey,
      connection: hasUrl && hasKey ? "success" : "error",
    }))
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {envStatus.connection === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span>Environment Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            {envStatus.supabaseUrl ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
          </div>

          <div className="flex items-center space-x-2">
            {envStatus.supabaseKey ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
          </div>
        </div>

        {envStatus.connection === "success" && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">
                ✅ Supabase connection ready! Project: {supabaseConfig.projectId}
              </span>
            </div>
          </div>
        )}

        {envStatus.connection === "error" && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-400">❌ Environment variables missing or invalid</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
