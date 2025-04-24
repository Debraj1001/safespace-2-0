import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// For client-side operations - named export as required
export const createClient = () => createClientComponentClient<Database>()

// For server-side operations (if needed)
export const createServerClient = (supabaseUrl: string, supabaseKey: string) => {
  const { createClient } = require("@supabase/supabase-js")
  return createClient<Database>(supabaseUrl, supabaseKey)
}
