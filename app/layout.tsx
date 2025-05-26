import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/navigation/header"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EntertainmentHub - Gaming, Movies, Tech & More",
  description: "Your ultimate destination for gaming news, movie reviews, tech updates, and entertainment coverage.",
  keywords: ["gaming", "movies", "tech", "reviews", "entertainment", "news"],
  authors: [{ name: "EntertainmentHub Team" }],
  openGraph: {
    title: "EntertainmentHub - Gaming, Movies, Tech & More",
    description: "Your ultimate destination for gaming news, movie reviews, tech updates, and entertainment coverage.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EntertainmentHub - Gaming, Movies, Tech & More",
    description: "Your ultimate destination for gaming news, movie reviews, tech updates, and entertainment coverage.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
