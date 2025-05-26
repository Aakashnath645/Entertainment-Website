"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, RefreshCw, User, ExternalLink } from "lucide-react"
import { initializeDatabase } from "@/scripts/init-database"
import { supabase } from "@/lib/supabase"

export default function DatabaseInitPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [forceRefresh, setForceRefresh] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/signin?redirect=/admin/init")
        return
      }

      setUser(user)
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/signin?redirect=/admin/init")
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleInitialize = async () => {
    setIsInitializing(true)
    setStatus("idle")
    setMessage("")

    try {
      const result = await initializeDatabase(forceRefresh)

      if (result.success) {
        setStatus("success")
        setMessage(result.message)
        // Refresh the page after 3 seconds to show new data
        setTimeout(() => {
          window.location.href = "/"
        }, 3000)
      } else {
        setStatus("error")
        setMessage(result.message)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleRetry = () => {
    setStatus("idle")
    setMessage("")
    handleInitialize()
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p>Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>Database Initialization</CardTitle>
          {user && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Signed in as {user.email}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Initialize your Supabase database with sample categories and articles to get started.
          </p>

          {status === "success" && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-200">
                <div className="space-y-2">
                  <p>{message}</p>
                  <p className="text-xs">Redirecting to homepage in 3 seconds...</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">
                <div className="space-y-3">
                  <p>{message}</p>
                  <div className="text-xs">
                    <p className="font-medium">Common solutions:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Make sure you're signed in to your account</li>
                      <li>Ensure database tables are created (run SQL schema first)</li>
                      <li>Check Supabase RLS policies are properly configured</li>
                      <li>Verify environment variables are set correctly</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2"
                      >
                        <span>Open Supabase Dashboard</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="forceRefresh"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="forceRefresh" className="text-sm text-muted-foreground">
                Force refresh (recreate data even if it exists)
              </label>
            </div>

            {status === "idle" && (
              <Button onClick={handleInitialize} disabled={isInitializing} className="w-full">
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : forceRefresh ? (
                  "Force Reinitialize Database"
                ) : (
                  "Initialize Database"
                )}
              </Button>
            )}

            {status === "error" && (
              <Button onClick={handleRetry} disabled={isInitializing} className="w-full">
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Try Again"
                )}
              </Button>
            )}

            {status === "success" && (
              <Button asChild className="w-full">
                <a href="/">View Website</a>
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium mb-2">This will create:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>5 content categories (Gaming, Movies, TV, Tech, Esports)</li>
              <li>3 sample articles with content</li>
              <li>Your user profile with admin permissions</li>
            </ul>

            <div className="mt-4 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-200">
              <p className="font-medium">ℹ️ Schema Update Required:</p>
              <p className="text-xs">
                If you get policy errors, run the updated SQL schema in your Supabase dashboard first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
