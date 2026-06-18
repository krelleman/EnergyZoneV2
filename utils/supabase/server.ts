import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Hvis env vars mangler – returner mock (undgår build-fejl)
  if (!supabaseUrl || !supabaseKey) {
    const mockQueryBuilder: any = {
      select: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      single: () => ({ data: null, error: null }),
      order: () => mockQueryBuilder,
      limit: () => mockQueryBuilder,
      insert: () => ({ data: null, error: null }),
      update: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
    }
    return {
      from: () => mockQueryBuilder,
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    }
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignoreres
        }
      },
    },
  })
}