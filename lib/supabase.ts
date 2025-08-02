import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, using anon key")
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  })
}

// Types
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  original_price?: number
  sku: string
  image_url: string
  images: string[]
  is_active: boolean
  is_new: boolean
  is_sale: boolean
  stock: number
  sizes: string[]
  colors: string[]
  category_id: string
  brand_id: string
  created_at: string
  updated_at: string
  categories?: Category
  brands?: Brand
  reviews_count?: number
  favorites_count?: number
  avg_rating?: number
}

export interface Category {
  id: string
  name: string
  name_en: string
  description?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  description?: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email?: string
  line_id?: string
  display_name?: string
  picture_url?: string
  created_at: string
  updated_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products?: Product
}
