"use client"

import type React from "react"

import { useState } from "react"
import { Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Simulate newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubscribed(true)
    setEmail("")
    setIsLoading(false)

    toast({
      title: "Successfully subscribed!",
      description: "You'll receive our latest updates in your inbox.",
    })
  }

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
          <p className="text-muted-foreground">Thanks for subscribing to our newsletter.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 glow-effect">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-primary" />
          <span>Stay Updated</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Get the latest gaming news, reviews, and exclusive content delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background/50 border-border focus:border-primary transition-colors"
          />
          <Button type="submit" className="w-full glow-effect" disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-3 text-center">No spam, unsubscribe at any time.</p>
      </CardContent>
    </Card>
  )
}
