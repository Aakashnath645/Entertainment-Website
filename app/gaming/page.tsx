import { Suspense } from "react"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "Gaming News & Reviews - EntertainmentHub",
  description: "Latest gaming news, reviews, and updates from the world of video games.",
}

export default function GamingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryPageContent categorySlug="gaming" />
        </Suspense>
      </main>
    </div>
  )
}
