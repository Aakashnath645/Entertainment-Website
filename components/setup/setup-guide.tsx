"use client"

import { useState } from "react"
import { CheckCircle, Database, Key, Users, FileText, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const setupSteps = [
  {
    id: "env",
    title: "Environment Variables",
    description: "Configure Supabase connection",
    icon: Key,
    status: "completed" as const,
    details: ["NEXT_PUBLIC_SUPABASE_URL ✅", "NEXT_PUBLIC_SUPABASE_ANON_KEY ✅"],
  },
  {
    id: "schema",
    title: "Database Schema",
    description: "Create tables and relationships",
    icon: Database,
    status: "pending" as const,
    action: {
      text: "Run SQL Schema",
      href: "https://supabase.com/dashboard",
    },
    details: [
      "Copy schema from supabase/schema.sql",
      "Run in Supabase SQL Editor",
      "Creates tables: users, articles, categories, comments, reviews",
    ],
  },
  {
    id: "data",
    title: "Sample Data",
    description: "Initialize with demo content",
    icon: FileText,
    status: "pending" as const,
    action: {
      text: "Initialize Data",
      href: "/admin/init",
    },
    details: ["Creates 5 content categories", "Adds 3 sample articles", "Sets up user profiles"],
  },
  {
    id: "auth",
    title: "Authentication",
    description: "Test user registration and login",
    icon: Users,
    status: "pending" as const,
    action: {
      text: "Test Sign Up",
      href: "/auth/signup",
    },
    details: ["Email/password authentication", "OAuth with Google and Discord", "User profile management"],
  },
]

export function SetupGuide() {
  const [completedSteps, setCompletedSteps] = useState<string[]>(["env"])

  const markCompleted = (stepId: string) => {
    setCompletedSteps((prev) => [...prev, stepId])
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-primary" />
          <span>Setup Guide</span>
          <Badge variant="outline">
            {completedSteps.length}/{setupSteps.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {setupSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const Icon = step.icon

            return (
              <div key={step.id} className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {index < setupSteps.length - 1 && (
                    <div className={`w-0.5 h-12 mt-2 ${isCompleted ? "bg-green-500/40" : "bg-border"}`} />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${isCompleted ? "text-green-400" : "text-foreground"}`}>
                      {step.title}
                    </h3>
                    {step.action && !isCompleted && (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={step.action.href}
                          target={step.action.href.startsWith("http") ? "_blank" : undefined}
                          className="inline-flex items-center space-x-1"
                        >
                          <span>{step.action.text}</span>
                          {step.action.href.startsWith("http") && <ExternalLink className="w-3 h-3" />}
                        </Link>
                      </Button>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">{step.description}</p>

                  <ul className="space-y-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center space-x-2">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCompleted && step.id !== "env" && (
                    <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => markCompleted(step.id)}>
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
