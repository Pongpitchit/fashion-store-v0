import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: favorites, error } = await supabase
      .from("user_favorites")
      .select(`
        *,
        products (
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
        )
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
    }

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Supabase error:", checkError)
      return NextResponse.json({ error: "Failed to check favorite" }, { status: 500 })
    }

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)

      if (deleteError) {
        console.error("Supabase error:", deleteError)
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
      }

      return NextResponse.json({ favorited: false })
    } else {
      // Add to favorites
      const { error: insertError } = await supabase.from("user_favorites").insert({
        user_id: userId,
        product_id: productId,
      })

      if (insertError) {
        console.error("Supabase error:", insertError)
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
      }

      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
