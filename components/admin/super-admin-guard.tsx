"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { checkSuperAdminAccess } from "@/lib/admin-security"

interface SuperAdminGuardProps {
  children: React.ReactNode
  fallbackPath?: string
}

export function SuperAdminGuard({ children, fallbackPath = "/admin" }: SuperAdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAccess() {
      try {
        const hasAccess = await checkSuperAdminAccess()
        setIsAuthorized(hasAccess)

        if (!hasAccess) {
          setTimeout(() => {
            router.push(fallbackPath)
          }, 3000)
        }
      } catch (error) {
        console.error("Error checking super admin access:", error)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">You don't have super admin privileges to access this page.</p>
            <p className="text-sm text-muted-foreground">Redirecting to admin dashboard in 3 seconds...</p>
            <Button onClick={() => router.push(fallbackPath)} className="w-full">
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
