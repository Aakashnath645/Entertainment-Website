import { Suspense } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { CategoryGrid } from "@/components/home/category-grid"
import { TrendingSidebar } from "@/components/home/trending-sidebar"
import { NewsletterSignup } from "@/components/home/newsletter-signup"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Suspense fallback={<div className="h-96 skeleton rounded-xl mb-12" />}>
          <HeroSection />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryGrid />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Suspense fallback={<div className="h-64 skeleton rounded-lg" />}>
              <TrendingSidebar />
            </Suspense>
            <NewsletterSignup />
          </div>
        </div>
      </main>
    </div>
  )
}
