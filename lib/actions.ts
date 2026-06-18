// lib/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'

export async function addToFridge(productId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('Ingen bruger logget ind')
    return { success: false, error: 'Ingen bruger logget ind' }
  }

  console.log('🍺 Tilføjer til køleskab:', productId)

  const { data: profile } = await supabase
    .from('profiles')
    .select('fridge')
    .eq('id', user.id)
    .single()

  const currentFridge = profile?.fridge || []
  const newFridge = Array.isArray(currentFridge) 
    ? currentFridge.includes(productId) ? currentFridge : [...currentFridge, productId]
    : [productId]

  const { error } = await supabase
    .from('profiles')
    .update({ fridge: newFridge })
    .eq('id', user.id)

  if (error) {
    console.log('Fejl ved tilføjelse:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function addToWishlist(productId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('Ingen bruger logget ind')
    return { success: false, error: 'Ingen bruger logget ind' }
  }

  console.log('❤️ Tilføjer til ønskeliste:', productId)

  const { data: profile } = await supabase
    .from('profiles')
    .select('wishlist')
    .eq('id', user.id)
    .single()

  const currentWishlist = profile?.wishlist || []
  const newWishlist = Array.isArray(currentWishlist)
    ? currentWishlist.includes(productId) ? currentWishlist : [...currentWishlist, productId]
    : [productId]

  const { error } = await supabase
    .from('profiles')
    .update({ wishlist: newWishlist })
    .eq('id', user.id)

  if (error) {
    console.log('Fejl ved tilføjelse:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}