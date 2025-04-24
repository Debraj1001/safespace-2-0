import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Check if user profile exists, if not create one
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.id).single()

      // If user doesn't exist in our table, create a profile
      if (!existingUser) {
        const userData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || user.user_metadata.name || "",
          avatar_url: user.user_metadata.avatar_url || null,
          user_type: user.user_metadata.user_type || "other",
          emergency_contact_email: user.user_metadata.emergency_contact_email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        await supabase.from("users").insert([userData])
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + "/dashboard")
}
