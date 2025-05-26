import { Suspense } from "react"
import { ArticleContent } from "@/components/article/article-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  // In a real app, you'd fetch the article data here for SEO
  return {
    title: `Article - EntertainmentHub`,
    description: "Read the latest entertainment news and reviews.",
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ArticleContent slug={params.slug} />
        </Suspense>
      </main>
    </div>
  )
}
