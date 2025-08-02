import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          name_en
        ),
        brands (
          id,
          name
        )
      `)
      .eq("is_active", true)

    // Apply category filter
    if (category && category !== "All") {
      query = query.eq("categories.name_en", category)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,brands.name.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: products, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Get counts for reviews and favorites for each product
    const productsWithCounts = await Promise.all(
      (products || []).map(async (product) => {
        const [reviewsResult, favoritesResult] = await Promise.all([
          supabase.from("reviews").select("rating", { count: "exact" }).eq("product_id", product.id),
          supabase.from("user_favorites").select("*", { count: "exact" }).eq("product_id", product.id),
        ])

        const reviews_count = reviewsResult.count || 0
        const favorites_count = favoritesResult.count || 0

        // Calculate average rating
        const ratings = reviewsResult.data?.map((r) => r.rating) || []
        const avg_rating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

        return {
          ...product,
          reviews_count,
          favorites_count,
          avg_rating: Math.round(avg_rating * 10) / 10,
        }
      }),
    )

    return NextResponse.json({
      products: productsWithCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
