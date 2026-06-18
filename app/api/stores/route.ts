// app/api/stores/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const form = await request.formData()
  
  const product_id = form.get('product_id') as string
  const store_name = form.get('store_name') as string
  const price_dkk = form.get('price_dkk') as string
  const last_seen_date = form.get('last_seen_date') as string

  if (!product_id || !store_name || !price_dkk || !last_seen_date) {
    return NextResponse.json({ error: 'Alle felter kræves' }, { status: 400 })
  }

  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })
  
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Kun admin har adgang' }, { status: 403 })
  }

  const { error } = await supabase.from('product_stores').insert({
    product_id: parseInt(product_id),
    store_name,
    price_dkk: parseFloat(price_dkk),
    last_seen_date
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}