import { supabase } from "./supabase"

// Your email address - the only person who should have admin access
const SUPER_ADMIN_EMAIL = "your-email@example.com" // Replace with your actual email

export async function checkSuperAdminAccess(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // Check if the current user's email matches the super admin email
    return user.email === SUPER_ADMIN_EMAIL
  } catch (error) {
    console.error("Error checking super admin access:", error)
    return false
  }
}

export async function ensureOnlyOneAdmin(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      throw new Error("Unauthorized: Only the super admin can perform this action")
    }

    // Get all current admins
    const { data: admins, error } = await supabase.from("users").select("*").eq("role", "admin")

    if (error) throw error

    // If there are multiple admins, demote all except the super admin
    if (admins && admins.length > 1) {
      const otherAdmins = admins.filter((admin) => admin.email !== SUPER_ADMIN_EMAIL)

      for (const admin of otherAdmins) {
        await supabase.from("users").update({ role: "editor" }).eq("id", admin.id)
        console.log(`Demoted ${admin.email} from admin to editor`)
      }
    }

    // Ensure the super admin has admin role
    await supabase.from("users").update({ role: "admin" }).eq("email", SUPER_ADMIN_EMAIL)
  } catch (error) {
    console.error("Error ensuring single admin:", error)
    throw error
  }
}

export async function preventAdminPromotion(targetUserId: string, newRole: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // Only the super admin can promote users to admin
    if (newRole === "admin" && user.email !== SUPER_ADMIN_EMAIL) {
      throw new Error("Only the super admin can promote users to admin role")
    }

    // Prevent demoting the super admin
    const { data: targetUser } = await supabase.from("users").select("email").eq("id", targetUserId).single()

    if (targetUser?.email === SUPER_ADMIN_EMAIL && newRole !== "admin") {
      throw new Error("Cannot demote the super admin")
    }

    return true
  } catch (error) {
    console.error("Error in admin promotion check:", error)
    throw error
  }
}
