import { Suspense } from "react"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "Tech Reviews & News - EntertainmentHub",
  description: "Latest technology reviews, gadget news, and tech updates.",
}

export default function TechPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryPageContent categorySlug="tech" />
        </Suspense>
      </main>
    </div>
  )
}
