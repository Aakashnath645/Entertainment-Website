import { Suspense } from "react"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "Esports News & Coverage - EntertainmentHub",
  description: "Latest esports news, tournament coverage, and competitive gaming updates.",
}

export default function EsportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryPageContent categorySlug="esports" />
        </Suspense>
      </main>
    </div>
  )
}
