import { createClient } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export async function signInWithGoogle() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) throw error
  } catch (error: any) {
    toast({
      title: "Authentication Error",
      description: error.message || "Failed to sign in with Google",
      variant: "destructive",
    })
    return { error }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error: any) {
    toast({
      title: "Sign Out Error",
      description: error.message || "Failed to sign out",
      variant: "destructive",
    })
    return { error }
  }

  return { success: true }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Password reset error:", error)
    return {
      error: error.message || "Failed to send password reset email",
    }
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Password update error:", error)
    return {
      error: error.message || "Failed to update password",
    }
  }
}
