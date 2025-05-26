"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ensureOnlyOneAdmin } from "@/lib/admin-security"
import { SuperAdminGuard } from "@/components/admin/super-admin-guard"

export default function AdminSecurity() {
  const [loading, setLoading] = useState(false)
  const [newSuperAdminEmail, setNewSuperAdminEmail] = useState("")
  const { toast } = useToast()

  const handleSecurityCheck = async () => {
    setLoading(true)
    try {
      await ensureOnlyOneAdmin()
      toast({
        title: "Security Check Complete",
        description: "Admin roles have been verified and secured.",
      })
    } catch (error) {
      toast({
        title: "Security Check Failed",
        description: error.message || "Failed to run security check",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SuperAdminGuard>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold neon-text">Admin Security</h1>
                <p className="text-muted-foreground">Manage super admin access and security settings</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Super Admin Protected</h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Only the designated super admin can access critical functions
                    </p>
                  </div>
                </div>
                <Button onClick={handleSecurityCheck} disabled={loading} className="w-full">
                  {loading ? "Running Security Check..." : "Run Security Check"}
                </Button>
              </CardContent>
            </Card>

            {/* Security Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Security Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-semibold">Super Admin Email</h4>
                      <p className="text-sm text-muted-foreground">
                        Only the email defined in the system can have admin privileges
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-semibold">Automatic Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Database triggers prevent unauthorized admin promotions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-semibold">Role Enforcement</h4>
                      <p className="text-sm text-muted-foreground">
                        System automatically demotes unauthorized admins to editor role
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-semibold">Access Control</h4>
                      <p className="text-sm text-muted-foreground">
                        Critical admin pages are protected with super admin verification
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    To change the super admin email, you need to update the configuration in:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                    <li>
                      • <code>lib/admin-security.ts</code> - Update SUPER_ADMIN_EMAIL
                    </li>
                    <li>
                      • <code>supabase/admin-security.sql</code> - Update super_admin_email variable
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  )
}
