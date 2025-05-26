import { Suspense } from "react"
import { SearchResults } from "@/components/search/search-results"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  return {
    title: query ? `Search results for "${query}" - EntertainmentHub` : "Search - EntertainmentHub",
    description: "Search for articles, reviews, and news across all entertainment categories.",
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <SearchResults query={query} />
        </Suspense>
      </main>
    </div>
  )
}
