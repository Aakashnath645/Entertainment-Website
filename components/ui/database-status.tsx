"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Database, ExternalLink, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type DatabaseStatus = "checking" | "not-setup" | "empty" | "ready" | "error"

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus>("checking")
  const [errorMessage, setErrorMessage] = useState("")
  const [details, setDetails] = useState<{
    hasCategories: boolean
    hasArticles: boolean
    hasUsers: boolean
    categoriesCount: number
    articlesCount: number
  }>({
    hasCategories: false,
    hasArticles: false,
    hasUsers: false,
    categoriesCount: 0,
    articlesCount: 0,
  })

  useEffect(() => {
    async function checkDatabaseStatus() {
      try {
        // Test basic connection first
        const { data: connectionTest, error: connectionError } = await supabase
          .from("categories")
          .select("count")
          .limit(1)

        if (connectionError) {
          console.error("Database connection error:", connectionError)
          setStatus("not-setup")
          setErrorMessage(connectionError.message)
          return
        }

        // Check if tables exist and have data
        const [categoriesResult, articlesResult, usersResult] = await Promise.all([
          supabase.from("categories").select("id", { count: "exact" }),
          supabase.from("articles").select("id", { count: "exact" }),
          supabase.from("users").select("id", { count: "exact" }),
        ])

        const hasCategories = !categoriesResult.error && (categoriesResult.count || 0) > 0
        const hasArticles = !articlesResult.error && (articlesResult.count || 0) > 0
        const hasUsers = !usersResult.error && (usersResult.count || 0) > 0

        const categoriesCount = categoriesResult.count || 0
        const articlesCount = articlesResult.count || 0

        setDetails({
          hasCategories,
          hasArticles,
          hasUsers,
          categoriesCount,
          articlesCount,
        })

        if (categoriesResult.error || articlesResult.error || usersResult.error) {
          const errors = [categoriesResult.error, articlesResult.error, usersResult.error]
            .filter(Boolean)
            .map((e) => e!.message)
            .join(", ")
          setStatus("not-setup")
          setErrorMessage(errors)
        } else if (!hasCategories && !hasArticles) {
          setStatus("empty")
        } else {
          setStatus("ready")
        }
      } catch (error: any) {
        console.error("Error checking database status:", error)
        setStatus("error")
        setErrorMessage(error.message || "Unknown error occurred")
      }
    }

    checkDatabaseStatus()
  }, [])

  if (status === "checking") {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Checking database status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "ready") {
    return (
      <Alert className="mb-6 border-green-500/50 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Database Ready</AlertTitle>
        <AlertDescription className="mt-2 text-green-200">
          <p>Your database is set up and contains content:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>{details.categoriesCount} categories</li>
            <li>{details.articlesCount} articles</li>
            <li>User profiles ready</li>
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-500">
        {status === "not-setup" ? "Database Setup Required" : status === "error" ? "Database Error" : "Database Empty"}
      </AlertTitle>
      <AlertDescription className="mt-2 text-yellow-200">
        {status === "not-setup" || status === "error" ? (
          <div className="space-y-3">
            <p>Your Supabase database tables haven't been created yet or there's a connection issue.</p>
            {errorMessage && (
              <div className="text-xs bg-red-500/20 border border-red-500/30 rounded p-2">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <p className="font-medium">Steps to set up your database:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>
                  Copy the schema from <code>supabase/schema.sql</code>
                </li>
                <li>Paste and run the SQL to create tables</li>
                <li>Return here and initialize sample data</li>
              </ol>
            </div>
            <div className="flex space-x-2">
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
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Recheck Status
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p>Your database is set up but doesn't contain any content yet.</p>
            <div className="space-y-1 text-sm">
              <p>Database status:</p>
              <ul className="list-disc list-inside space-y-1">
                <li className={details.hasCategories ? "text-green-400" : "text-yellow-400"}>
                  Categories: {details.hasCategories ? `✓ ${details.categoriesCount} found` : "⚠ Empty"}
                </li>
                <li className={details.hasArticles ? "text-green-400" : "text-yellow-400"}>
                  Articles: {details.hasArticles ? `✓ ${details.articlesCount} found` : "⚠ Empty"}
                </li>
                <li className={details.hasUsers ? "text-green-400" : "text-yellow-400"}>
                  Users: {details.hasUsers ? "✓ Ready" : "⚠ Empty"}
                </li>
              </ul>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/init">Initialize Sample Data</Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
