import { Suspense } from "react"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "TV Show Reviews & News - EntertainmentHub",
  description: "Latest TV show reviews, episode guides, and series news.",
}

export default function TVShowsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryPageContent categorySlug="tv-shows" />
        </Suspense>
      </main>
    </div>
  )
}
