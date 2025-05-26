import { Suspense } from "react"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "Movie Reviews & News - EntertainmentHub",
  description: "Latest movie reviews, trailers, and entertainment news.",
}

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryPageContent categorySlug="movies" />
        </Suspense>
      </main>
    </div>
  )
}
