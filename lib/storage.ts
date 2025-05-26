import { supabase } from "./supabase"

export async function ensureStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "article-images")

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket("article-images", {
        public: true,
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error checking/creating bucket:", error)
    return false
  }
}

export async function uploadImage(file: File): Promise<string> {
  await ensureStorageBucket()

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file")
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5MB")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `articles/${fileName}`

  const { data, error } = await supabase.storage.from("article-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from("article-images").getPublicUrl(filePath)

  return urlData.publicUrl
}
